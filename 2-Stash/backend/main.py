
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import datetime
from google import genai
from google.genai import types

app = FastAPI()

# Configure CORS
# Configure CORS
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*", # Allow all http/https origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Client
client = None
try:
    client = genai.Client(vertexai=True, location="global")
except Exception as e:
    print(f"Warning: GenAI client init failed: {e}")

# Initialize Firestore
db = None
try:
    from google.cloud import firestore
    # Use specific database
    db = firestore.Client(database="vibe-coding-challenge")
except Exception as e:
    print(f"Warning: Firestore init failed: {e}")

import bcrypt

class UserAuth(BaseModel):
    email: str
    password: str

def verify_password(plain_password, hashed_password):
    # Ensure bytes
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)

def get_password_hash(password):
    # Return string for storage
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

@app.post("/api/auth/signup")
def signup(user: UserAuth):
    try:
        if not db:
            raise HTTPException(status_code=500, detail="Database not available")
            
        # Check if user exists
        users_ref = db.collection("users")
        query = users_ref.where("email", "==", user.email).stream()
        if any(query):
             raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        user_data = {
            "email": user.email,
            "hashed_password": get_password_hash(user.password),
            "created_at": datetime.datetime.now().isoformat()
        }
        update_time, doc_ref = users_ref.add(user_data)
        
        return {"uid": doc_ref.id, "email": user.email}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login")
def login(user: UserAuth):
    try:
        if not db:
            raise HTTPException(status_code=500, detail="Database not available")
            
        users_ref = db.collection("users")
        query = users_ref.where("email", "==", user.email).stream()
        
        user_doc = next(query, None)
        if not user_doc:
            raise HTTPException(status_code=400, detail="Invalid email or password")
            
        user_data = user_doc.to_dict()
        if not verify_password(user.password, user_data["hashed_password"]):
            raise HTTPException(status_code=400, detail="Invalid email or password")
            
        return {"uid": user_doc.id, "email": user.email}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CreateLinkRequest(BaseModel):
    url: str

class LinkResponse(BaseModel):
    id: str
    url: str
    title: str
    summary: str
    tags: List[str]
    created_at: str

@app.get("/")
def read_root():
    return {"message": "Stash API is running"}

import requests
from bs4 import BeautifulSoup

def scrape_url(url: str):
    try:
        if not url.startswith('http'):
            url = 'https://' + url
            
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove scripts and styles
        for script in soup(["script", "style"]):
            script.extract()
            
        # Get text
        text = soup.get_text()
        
        # Clean lines
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Truncate if too long (Gemini Flash has large context but good to be safe/efficient)
        return text[:50000] # Limit to ~50k chars for safety
    except Exception as e:
        print(f"Scraping failed: {e}")
        return None

from fastapi import Header

@app.get("/api/links", response_model=List[LinkResponse])
def get_links(x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    try:
        if not x_user_id:
            return []
            
        links = []
        if db:
            # Query subcollection: users/{uid}/links
            docs = db.collection("users").document(x_user_id).collection("links").stream()
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                links.append(data)
            
            links.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            
        return [LinkResponse(**l) for l in links]
    except Exception as e:
        print(f"Error fetching links: {e}")
        return []

@app.post("/api/links", response_model=LinkResponse)
def create_link(request: CreateLinkRequest, x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    if not client:
        raise HTTPException(status_code=500, detail="GenAI client not initialized")
    if not x_user_id:
        raise HTTPException(status_code=400, detail="User ID required")

    # 1. Scrape Content
    # We need to capture the normalized URL if scrape_url modifies it
    if not request.url.startswith('http'):
        final_url = 'https://' + request.url
    else:
        final_url = request.url

    scraped_content = scrape_url(final_url)
    
    if not scraped_content:
        # Fallback if scraping fails: tell Gemini to try its best or just fail?
        # User asked for scraping function, so we rely on it.
        # But we can pass the URL as a fallback reference in the prompt.
        scraped_content = f"Failed to scrape content from {request.url}. Please infer from URL if possible."

    # 2. Analyze with Gemini (Text Mode)
    prompt = f"""
    Analyze the following text content from the URL: {request.url}
    
    [BEGIN CONTENT]
    {scraped_content}
    [END CONTENT]
    
    1. Generate a concise summary.
    2. Generate 3-5 relevant tags.
    
    Output PURE JSON without markdown formatting.
    JSON structure:
    {{
        "title": "Page Title (Extracted or Generated)",
        "summary": "Concise summary...",
        "tags": ["tag1", "tag2"]
    }}
    """
    
    try:
        # No Tools needed for Text Analysis
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        # DEBUG: Print raw response
        print(f"DEBUG: Response Text: {response.text}")
        if not response.text:
             print(f"DEBUG: Candidates: {response.candidates}")
        
        # Clean JSON text (remove markdown if present)
        text = response.text
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            print("Warning: Failed to parse JSON, using raw text as summary")
            data = {
                "title": "Analysis Result",
                "summary": text,
                "tags": ["review"]
            }
        
        # Prepare Data
        timestamp = datetime.datetime.now().isoformat()
        link_data = {
            "url": final_url,
            "title": data.get("title", "Untitled"),
            "summary": data.get("summary", "No summary available"),
            "tags": data.get("tags", []),
            "created_at": timestamp,
            "user_id": x_user_id
        }
        
        # Save to Firestore
        link_id = "temp_id"
        if db:
            # Save to users/{uid}/links
            update_time, link_ref = db.collection("users").document(x_user_id).collection("links").add(link_data)
            link_id = link_ref.id
            link_data["id"] = link_id
        else:
            link_data["id"] = "memory_" + str(timestamp)
            print("Warning: Firestore not active, data not saved persistently.")

        return LinkResponse(**link_data)
        
    except Exception as e:
        print(f"Error processing link: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/links/{link_id}")
def delete_link(link_id: str, x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    try:
        if db:
            ref = db.collection("users").document(x_user_id).collection("links").document(link_id)
            ref.delete()
        return {"success": True, "id": link_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class UpdateLinkRequest(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[List[str]] = None

@app.put("/api/links/{link_id}")
def update_link(link_id: str, request: UpdateLinkRequest, x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    try:
        if db:
            ref = db.collection("users").document(x_user_id).collection("links").document(link_id)
            doc = ref.get()
            if not doc.exists:
                raise HTTPException(status_code=404, detail="Link not found")
            
            updates = {k: v for k, v in request.dict().items() if v is not None}
            if updates:
                ref.update(updates)
                
            return {**doc.to_dict(), **updates, "id": link_id}
            
        return {"id": link_id, "message": "In-memory update simulated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# CHECKMATE (TASK) ENDPOINTS
# ==========================================

class Task(BaseModel):
    id: Optional[str] = None
    title: str
    completed: bool = False
    due_date: Optional[str] = None
    tags: List[str] = []

class UpdateTaskRequest(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[str] = None
    tags: Optional[List[str]] = None

@app.get("/api/tasks", response_model=List[Task])
def get_tasks(x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    try:
        if not x_user_id:
            return []
        
        tasks = []
        if db:
            docs = db.collection("users").document(x_user_id).collection("tasks").stream()
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                tasks.append(data)
            # Sort by created_at ideally, but for now simple append
        
        return [Task(**t) for t in tasks]
    except Exception as e:
        print(f"Error fetching tasks: {e}")
        return []

@app.post("/api/tasks", response_model=Task)
def create_task(task: Task, x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    try:
        if not x_user_id:
             raise HTTPException(status_code=400, detail="User ID required")
             
        task_data = task.dict(exclude={"id"})
        task_data["created_at"] = datetime.datetime.now().isoformat()
        task_data["user_id"] = x_user_id
        
        if db:
            update_time, ref = db.collection("users").document(x_user_id).collection("tasks").add(task_data)
            task.id = ref.id
        else:
            task.id = "mem_" + str(datetime.datetime.now().timestamp())
            
        return task
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/tasks/{task_id}", response_model=Task)
def update_task(task_id: str, request: UpdateTaskRequest, x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    try:
        if db:
            ref = db.collection("users").document(x_user_id).collection("tasks").document(task_id)
            doc = ref.get()
            if not doc.exists:
                 raise HTTPException(status_code=404, detail="Task not found")
            
            updates = {k: v for k, v in request.dict().items() if v is not None}
            if updates:
                ref.update(updates)
            
            # Merge existing with updates
            existing = doc.to_dict()
            existing.update(updates)
            existing["id"] = task_id
            return Task(**existing)
            
        return Task(id=task_id, title="Mock Update", completed=request.completed or False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str, x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    try:
        if db:
            ref = db.collection("users").document(x_user_id).collection("tasks").document(task_id)
            ref.delete()
        return {"success": True, "id": task_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ParseRequest(BaseModel):
    text: str

@app.post("/api/parse-tasks")
def parse_tasks(request: ParseRequest):
    if not client:
        raise HTTPException(status_code=500, detail="GenAI client not initialized")
        
    prompt = f"""
    You are a task extraction assistant. 
    Analyze the following text and extract actionable tasks.
    Return a list of tasks in PURE JSON format (no markdown).
    
    Text: "{request.text}"
    
    Output Schema:
    [
        {{
            "title": "string (actionable task description)",
            "due_date": "string (ISO date or relative time like 'tomorrow 5pm', or null)",
            "tags": ["string (category tags)"]
        }}
    ]
    """
    
    try:
        # Generate with Gemini
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        text = response.text
        # Cleanup potential markdown
        if text.startswith("```json"): text = text[7:]
        if text.endswith("```"): text = text[:-3]
        
        parsed_data = json.loads(text.strip())
        
        # Add IDs
        import uuid
        tasks = []
        for item in parsed_data:
            tasks.append({
                "id": str(uuid.uuid4()),
                "title": item.get("title", "Untitled Task"),
                "completed": False,
                "due_date": item.get("due_date"),
                "tags": item.get("tags", [])
            })
            
        return {"tasks": tasks}
        
    except Exception as e:
        print(f"Error parsing tasks: {e}")
        # Fallback
        return {"tasks": [{
            "id": "fallback_" + str(datetime.datetime.now().timestamp()),
            "title": request.text,
            "completed": False,
            "tags": ["manual"]
        }]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

