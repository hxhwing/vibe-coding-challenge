import os
import requests
import asyncio
import asyncio
import google.auth
from google import genai
from typing import Optional
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

# Shared Backend URL
SHARED_BACKEND_URL = os.environ.get("SHARED_BACKEND_URL", "http://localhost:8001")
VIBE_ONE_URL = os.environ.get("VIBE_ONE_URL", "http://localhost:5175")

# Get Credentials and Project ID for Vertex AI
try:
    credentials, project_id = google.auth.default()
except Exception as e:
    print(f"Warning: Could not get default credentials: {e}")
    project_id = None


def create_task(title: str, due_date: str = None, tags: list = []) -> dict:
    """Creates a task in the Vibe Checkmate system.
    
    Args:
        title: The actionable task description.
        due_date: Optional due date (ISO format or natural language like 'tomorrow').
        tags: Optional list of category tags.
    """
    try:
        from context import transform_user_id
        current_user_id = transform_user_id.get()
    except LookupError:
        current_user_id = "guest_assistant"

    try:
        payload = {
            "title": title,
            "due_date": due_date,
            "tags": tags,
            "completed": False
        }
        headers = {"X-User-Id": current_user_id, "Content-Type": "application/json"}
        resp = requests.post(f"{SHARED_BACKEND_URL}/api/tasks", json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        task_link = f"{VIBE_ONE_URL}/checkmate"
        return {
            "status": "success", 
            "message": f"Created task: {title}", 
            "task": data,
            "view_url": task_link,
            "instruction": f"Tell the user: Task created! Check it in Checkmate App"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def save_link(url: str, summary: str = None, tags: list = []) -> dict:
    """Saves a URL to the Vibe Stash system.
    
    Args:
        url: The URL to save.
        summary: Optional summary of the content.
        tags: Optional list of tags.
    """
    try:
        from context import transform_user_id
        current_user_id = transform_user_id.get()
    except LookupError:
        current_user_id = "guest_assistant"

    try:
        payload = {"url": url}
        headers = {"X-User-Id": current_user_id, "Content-Type": "application/json"}
        resp = requests.post(f"{SHARED_BACKEND_URL}/api/links", json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        stash_link = f"{VIBE_ONE_URL}/stash"
        return {
            "status": "success", 
            "message": f"Saved link: {data.get('title', url)}", 
            "link": data,
            "view_url": stash_link,
            "instruction": f"Tell the user: Link saved! View it in Stash App"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Get Credentials and Project ID for Vertex AI
try:
    credentials, project_id = google.auth.default()
except Exception as e:
    print(f"Warning: Could not get default credentials: {e}")
    project_id = None

# Set Environment Variables for Google GenAI / ADK
if project_id:
    os.environ["GOOGLE_CLOUD_PROJECT"] = project_id
    os.environ["GOOGLE_CLOUD_LOCATION"] = "global"
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "TRUE"
    print(f"DEBUG: Configured Vertex AI for project={project_id}, location=global")

# Define Agent
vibe_agent = LlmAgent(
    model='gemini-2.5-flash',
    name='vibe_assistant',
    description="Helps users manage their tasks and links in Vibe One.",
    instruction="""
    You are Vibe Assistant, a helpful AI integrated into the Vibe One platform.
    
    Capabilities:
    1. Create Tasks: When use says "Remind me to...", "Add task...", etc.
    2. Save Links: When user shares a URL or says "Save this link...".
    
    Rules:
    - If a user sends a URL, assume they want to save it unless they ask to summarize it immediately.
    - Be concise and friendly.
    """,
    tools=[create_task, save_link]
)


# Initialize Services
session_service = InMemorySessionService()
runner = Runner(
    agent=vibe_agent,
    app_name="vibe_assistant_app",
    session_service=session_service
)

async def process_chat(user_id: str, message_text: str) -> str:
    """Process a chat message using the ADK Runner."""
    # We use user_id as session_id for simplicity to maintain per-user history,
    # or we could generate a clear session ID if we wanted separate chats.
    # For a persistent assistant, user_id as session_id allows memory across reloads (in-memory only though).
    session_id = f"session_{user_id}"
    
    # Ensure session exists
    print(f"DEBUG: Checking session for user_id={user_id}, session_id={session_id}")
    try:
        sess = await session_service.get_session(app_name="vibe_assistant_app", user_id=user_id, session_id=session_id)
        if sess is None:
             print("DEBUG: Session is None (not found), creating new session...")
             await session_service.create_session(app_name="vibe_assistant_app", user_id=user_id, session_id=session_id)
        else:
             print(f"DEBUG: Session found: {sess}")
    except Exception as e:
        print(f"DEBUG: Session lookup failed ({e}). Creating new session...")
        try:
            await session_service.create_session(app_name="vibe_assistant_app", user_id=user_id, session_id=session_id)
            print("DEBUG: Session created via exception handler.")
        except Exception as create_error:
            print(f"DEBUG: Session creation failed: {create_error}")
            return f"Error: Could not create session: {create_error}"

    user_content = types.Content(role='user', parts=[types.Part(text=message_text)])
    
    final_text = "I'm having trouble connecting."
    
    try:
        async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=user_content):
            if event.is_final_response() and event.content and event.content.parts:
                final_text = event.content.parts[0].text
    except Exception as run_error:
        print(f"DEBUG: Runner execution failed: {run_error}")
        return f"Error executing chat: {run_error}"
            
    return final_text
