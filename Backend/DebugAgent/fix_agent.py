from langchain_groq import ChatGroq
from typing import TypedDict,List, Dict,Optional
from langgraph.graph import StateGraph,END,START
from dotenv import load_dotenv
import os
import json

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)

class FixState(TypedDict):
    issue: dict          # the bug to fix
    code: str            # current file content
    filename: str
    patch: dict          # anchor + replacement from AI
    verified: bool       # did verification pass?
    attempts: int        # current attempt number
    max_attempts: int    # stop after 3
    logs: list           # status updates for UI
    status: str          # generating/applying/verifying/resolved/failed
    resolved: bool       # is issue fixed?

# node 1: geneating the patch (old code and new code) thats it
def generate_patch(state:FixState):
    issue=state["issue"]
    code=state["code"]
    system_prompt="""
        You are a senior software engineer.
        You are given:
        - an issue
        - an anchor snippet
        - the file code

        Your task:
        Generate the corrected version of the anchor.

        Rules:
        - Only modify the anchor region.
        - Keep the fix minimal.
        - Do not refactor unrelated code.

        Return ONLY JSON:

        {
            "replacement": "fixed code"
        }
        """

    user_prompt = f"""
       Issue Title:
       {issue["title"]}

        Issue Description:
        {issue["description"]}

        Anchor:
        {issue["anchor"]}

        Code:
        {code}
    """
    resp=llm.invoke([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ])
    text = resp.content

    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:].strip()

    result = json.loads(text)
    agent_log=[
        {
            "id":f"gen-{issue['id']}-{state.get('attempts', 0)}",
            "message":f"Agent generated fix snippet for: {issue['title']}",
            "status":"done"
        }
    ]

    return{
        "patch":{
            "anchor":issue["anchor"],
            "replacement":result["replacement"]
        },
        "logs":agent_log
    }

graph=StateGraph(FixState)

graph.add_node("generate_patch",generate_patch)

graph.set_entry_point("generate_patch")
graph.add_edge("generate_patch",END)

fix_agent=graph.compile()




    