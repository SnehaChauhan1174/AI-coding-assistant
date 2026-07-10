from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
import json

load_dotenv()

llm=ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)

def extract_metadata_jsx(file_content:str,filename:str)->dict:
    system_prompt="""
You are a javascript_jsx code analyzer.

Extract ALL of the following from the given file:

1. UI Elements — buttons, divs with onClick, inputs, any clickable element
2. States — all useState declarations  
3. Handlers — all functions starting with handle, on, run, fetch
4. API Calls — all fetch() or axios calls with their method and route
5. Props Received — props this component receives from parent
6. Props Passed — props this component passes to children

Return ONLY this JSON:
{
  "ui_elements": [
    {
      "id": "descriptive name eg Open Folder Button",
      "element": "button/div/input",
      "onClick": "handler name or null"
    }
  ],
  "states": [
    {
      "id": "state variable name",
      "setter": "setter function name",
      "initial": "initial value"
    }
  ],
  "handlers": [
    {
      "id": "handlePath()",
      "description": "what this function does in one line",
      "calls_api": true,
      "updates_states": ["files", "folderOpen"],
      "triggered_by": "UI element name or prop name"
    }
  ],
  "api_calls": [
    {
      "id": "POST /api/files",
      "method": "POST/GET",
      "route": "/api/files",
      "called_by": "handler name",
      "updates_states": ["files", "folderOpen"]
    }
  ],
  "props_received": [
    {
      "id": "onFileClick",
      "from_parent": "App.jsx or unknown",
      "used_in": "handler or UI element name"
    }
  ],
  "props_passed": [
    {
      "id": "onFileClick",
      "to_child": "FileItem component",
      "value": "what is passed"
    }
  ]
}
"""
    response=llm.invoke([
        {"role":"system","content":system_prompt},
        {"role":"user","content":f"File: {filename}\n\n{file_content}"}
    ])
    text=response.content
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:].strip()
    
    return json.loads(text)

def extract_connections(file_content: str,filename: str,metadata: dict,parents: list = [] ) -> dict:
    
    parent_context = ""
    if parents:
        parent_context = f"""
This file is used by these parent components: {", ".join(parents)}
Include connections showing props received from parents and callbacks to parents.
"""

    system_prompt = f"""
You are a React code flow connection builder.

You are given:
- The file content
- Already extracted metadata (states, handlers, UI elements, API calls, props)
- Parent components that use this file

{parent_context}

Your job: Build ALL connections between the nodes.

Connection types:
- onClick    : UI Element triggers a Handler
- calls      : Handler calls an API route
- updates    : API response or Handler updates a State
- renders    : State change causes UI Element to show/hide
- prop       : Prop passed from parent or to child
- triggers   : UI Element or State triggers another Handler
- returns    : API returns data to Handler

Return ONLY this JSON:
{{
  "connections": [
    {{
      "from": "exact node id from metadata",
      "from_type": "UI Element/State/Handler/API Call/Prop",
      "to": "exact node id from metadata",
      "to_type": "UI Element/State/Handler/API Call/Prop",
      "label": "onClick/calls/updates/renders/prop/triggers/returns"
    }}
  ]
}}

RULES:
- Use EXACT node ids from the metadata provided
- Do not invent nodes that are not in metadata
- Every connection must have a clear reason from the code
- Props from parent should show: ParentName → prop name → handler/state
"""

    # build context from metadata
    metadata_str = json.dumps(metadata, indent=2)

    response = llm.invoke([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"""
File: {filename}

Metadata already extracted:
{metadata_str}

File content:
{file_content}
"""}
    ])

    text = response.content
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:].strip()

    return json.loads(text)


def build_graph(metadata:dict, connections:dict)->dict:
    nodes=[]
    for item in metadata.get("ui_elements",[]):
        nodes.append({
            "id":item["id"],
            "type":"UI element",
            "meta":item
        })

    for item in metadata.get("states",[]):
        nodes.append({
            "id":item["id"],
            "type":"State",
            "meta":item
        })

    for item in metadata.get("handlers",[]):
        nodes.append({
            "id":item["id"],
            "type":"Handler",
            "meta":item
        })

    for item in metadata.get("api_calls",[]):
        nodes.append({
            "id":item["id"],
            "type":"Backend route",
            "meta":item
        })

    for item in metadata.get("props_received",[]):
        nodes.append({
            "id":item["id"],
            "type":"Prop",
            "meta":item
        })

    return{
        "nodes":nodes,
        "connections":connections.get("connections",[])
    }


def run_code_flow_agent(
    file_content: str,
    filename: str,
    parents: list = []
) -> dict:

    # Step 1 — extract metadata
    print(f"[code-flow] extracting metadata for {filename}")
    metadata = extract_metadata_jsx(file_content, filename)

    # Step 2 — extract connections
    print(f"[code-flow] extracting connections")
    connections = extract_connections(file_content, filename, metadata, parents)

    # Step 3 — build final graph
    print(f"[code-flow] building graph structure")
    graph = build_graph(metadata, connections)

    return {
        "filename":    filename,
        "metadata":    metadata,
        "graph":       graph
    }
