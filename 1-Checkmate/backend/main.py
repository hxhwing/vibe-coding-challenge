
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
from google import genai
from google.genai import types

app = FastAPI()

# Configure CORS
# Configure CORS
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*", # Allow all http/https origins (e.g. localhost:5174)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client
# In a real scenario, API_KEY should be in env vars.
# User will need to run with GOOGLE_API_KEY set or via gcloud auth.
# using default vertex/genai auth which relies on 'gcloud auth application-default login' or similar if API key not present.
# But 'google-genai' SDK often prefers API key for AI Studio, or Vertex config for Vertex.
# We will use Vertex AI if no API key, or AI Studio if API key.
# For this challenge, we assume Vertex AI path since user mentioned "Vertex AI" context before, 
# but then switched to "google-genai". google-genai supports both.
# We'll try to auto-detect.

client = None
try:
    client = genai.Client(vertexai=True, location="global")
except Exception as e:
    print(f"Warning: Vertex AI client init failed: {e}")
    # Fallback or wait for first request to fail?
    pass

class Task(BaseModel):
    id: str
    title: str
    completed: bool = False
    due_date: Optional[str] = None
    tags: List[str] = []

class ParseRequest(BaseModel):
    text: str

class ParseResponse(BaseModel):
    tasks: List[Task]

@app.get("/")
def read_root():
    return {"message": "Checkmate API is running"}

from tenacity import retry, stop_after_attempt, wait_exponential

# ...

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def generate_with_retry(prompt):
    return client.models.generate_content(
        model="gemini-2.5-flash", 
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            thinking_config=types.ThinkingConfig(
                thinking_budget=0
            ) 
        )
    )

@app.post("/api/parse-tasks", response_model=ParseResponse)
def parse_tasks(request: ParseRequest):
    if not client:
        raise HTTPException(status_code=500, detail="GenAI client not initialized")
    
    prompt = f"""
    You are a task extraction assistant. 
    Analyze the following text and extract actionable tasks.
    Return a list of tasks in JSON format.
    
    Text: "{request.text}"
    
    Output Schema within a JSON block:
    [
        {{
            "title": "string (actionable task description)",
            "due_date": "string (ISO date or relative time like 'tomorrow 5pm', or null)",
            "tags": ["string (category tags)"]
        }}
    ]
    """
    
    try:
        # Call with retry
        response = generate_with_retry(prompt)
        
        parsed_data = json.loads(response.text)
        
        # Add IDs and defaults
        tasks = []
        import uuid
        for item in parsed_data:
            tasks.append(Task(
                id=str(uuid.uuid4()),
                title=item.get("title", "Untitled Task"),
                completed=False,
                due_date=item.get("due_date"),
                tags=item.get("tags", [])
            ))
            
        return ParseResponse(tasks=tasks)
        
    except Exception as e:
        print(f"Error parsing tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
