from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

from agent import vibe_agent
from context import transform_user_id
import uvicorn

@app.post("/api/chat")
async def chat(request: ChatRequest, x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    if not x_user_id:
        raise HTTPException(status_code=400, detail="User ID required")
    
    # Set context for tools
    token = transform_user_id.set(x_user_id)
    
    try:
        # Reconstruct message history for ADK?
        # Assuming ADK Agent has a simple query/chat method that takes a string or history.
        # Let's try passing the last message content for now, or check docs.
        # User snippet didn't show chat method. Common is .query(text) or .chat(history).
        # Let's assume .query(input_text) for a single turn or .chat(messages) 
        # But wait, ADK might manage state internally?
        # Let's just try to call it with the last user message.
        
        last_msg = next((m for m in reversed(request.messages) if m.role == "user"), None)
        if not last_msg:
             return {"role": "model", "content": "I didn't hear anything."}

        # Inspecting `vibe_agent` at runtime would be ideal, but let's guess .query()
        # If it fails, I'll fix it.
        # Actually, if I can pass history that's better.
        
        # Let's inspect it in a separate step or just try/except blocks
        # For MVP, just the latest prompt:
        
        # Note: 'google-adk' library likely has a specific entry point. 
        # I'll check `dir(vibe_agent)` via print if I can.
        
        # Assuming synchronous for now?
        from agent import process_chat
        response_text = await process_chat(x_user_id, last_msg.content)
        
        return {"role": "model", "content": str(response_text)}
    except Exception as e:
        print(f"Chat Execution Error: {e}")
        return {"role": "model", "content": f"Error: {e}"}
    finally:
        transform_user_id.reset(token)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)

