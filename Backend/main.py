from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os
from typing import Optional

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# class ChatRequest(BaseModel):
#     message: str
#     fileContent: Optional[str]=None
#     fileName: Optional[str]=None


class GenerateRequest(BaseModel):
    prompt: str
    fileContent: Optional[str] = None
    fileName: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI backend!"}

@app.post("/generate")
def generate(request: GenerateRequest):
    messages = []
    if request.fileContent:
        messages.append({
            "role": "user",
            "content": f"Current file ({request.fileName}):\n\n{request.fileContent}"
        })
    messages.append({
        "role": "user",
        "content": f"Generate code for: {request.prompt}. Return ONLY the code, no explanation."
    })
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages
    )
    return {"code": response.choices[0].message.content}



class FileRequest(BaseModel):
    fileContent: str
    fileName: Optional[str] = None
    language: Optional[str] = "code"   # add this

@app.post("/debug")
def debug(request: FileRequest):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    f"You are a {request.language} code debugger. "
                    "Analyze the provided code and return ONLY a JSON object "
                    "with this exact structure:\n"
                    '{"summary": "one sentence assessment", '
                    '"bugs": [{"line": <number or null>, "issue": "what is wrong", "fix": "how to fix it"}]}'
                )
            },
            {
                "role": "user",
                "content": f"File: {request.fileName}\n\n{request.fileContent}"
            }
        ],
        response_format={"type": "json_object"}
    )
    import json
    return json.loads(response.choices[0].message.content)