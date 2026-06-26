from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os
from typing import Optional
from DebugAgent.review_agent import review_agent
from DebugAgent.fix_agent import fix_agent
from FlowChart.generalized_tree import get_python_imports,get_treesitter_imports,extract_dependencies
import re
from fastapi import FastAPI, HTTPException


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
     

# @app.post("/debug")
# def debug(request: FileRequest):
#     response = client.chat.completions.create(
#         model="llama-3.3-70b-versatile",
#         messages=[
#             {
#                 "role": "system",
#                 "content": (
#                     f"You are a {request.language} code debugger. "
#                     "Analyze the provided code and return ONLY a JSON object "
#                     "with this exact structure:\n"
#                     '{"summary": "one sentence assessment", '
#                     '"bugs": [{"line": <number or null>, "issue": "what is wrong", "fix": "how to fix it"}]}'
#                 )
#             },
#             {
#                 "role": "user",
#                 "content": f"File: {request.fileName}\n\n{request.fileContent}"
#             }
#         ],
#         response_format={"type": "json_object"}
#     )
#     import json
#     return json.loads(response.choices[0].message.content)

def build_tree(path):
    tree=[]
    files_folders=os.listdir(path) # will return a list of files n folders
    for f in files_folders:
        full_path=os.path.join(path,f)
        f_obj={}
        f_obj["name"]=f
        f_obj["path"]=full_path
        if(os.path.isdir(full_path)):
            f_obj["type"]="folder"
            f_obj["children"]=build_tree(full_path)
        else:
            f_obj["type"]="file"

        tree.append(f_obj)
    return tree


@app.get("/files")
def get_files(path:str):
    return {"tree":build_tree(path)}

@app.get("/file-content")
def get_file_content(path:str):
    with open(path,"r",encoding="utf-8") as f:
        return {"content":f.read()}

@app.get("/create-project")
def create_file_path(path:str,name:str):
    file_path=os.path.join(path,name)
    os.makedirs(file_path,exist_ok=True) # makedirs makes nested folders
    return {"success": True, "path": file_path}

@app.post("/review-agent")
def run_review_agent(request: FileRequest):
    result = review_agent.invoke({
        "code": request.fileContent,
        "filename": request.fileName,
        "context": "",
        "raw_issues": [],
        "issues": [],
        "steps": [],
        "confidence": 0.0,
        "status": "running"
    })
    return {
        "steps": result["steps"],
        "issues": result["issues"]
    }


class FixRequest(BaseModel):
    issue:dict
    code:str

@app.post("/fix-agent/generate")
def generate_fix(req:FixRequest):
    result = fix_agent.invoke({
        "issue":req.issue,
        "code":req.code,
        "logs":[]
    })
    return {
        "replacement":result["patch"]["replacement"]
    }

class FlowchartReq(BaseModel):
    file_path:str
    project_root:str

@app.post("/dependencies")
def get_file_dependencies(request:FlowchartReq):
    # print("FILE :", repr(request.file_path))
    # print("ROOT :", repr(request.project_root))

    file_path = os.path.normpath(request.file_path)
    proj_root = os.path.normpath(request.project_root)

    # print("Normalized file :", file_path)
    # print("Normalized root :", proj_root)
    # print("Exists :", os.path.exists(file_path))

    if not os.path.exists(file_path):
        raise HTTPException(status_code=400, detail=f"File not found: {file_path}")
    raw_dependencies=extract_dependencies(file_path,proj_root)
    print("RAW DEPENDENCIES:", raw_dependencies)
    formatted_dep=[]
    for dep_path in raw_dependencies:
        dep_type="Utility"
        if "components" in dep_path.lower():
            dep_type="Component"
        elif "hooks" in dep_path.lower():
            dep_type="Hook"
        formatted_dep.append({
            "path": dep_path,
            "type": dep_type
        })
    return {
        "entry": os.path.basename(file_path),
        "entry_dir": "/" + os.path.relpath(os.path.dirname(file_path), proj_root).replace("\\", "/"),
        "dependencies": formatted_dep
    }


    


