from typing import TypedDict,List, Dict,Optional
class ReviewState(TypedDict):
    filename:str
    code:str
    context:str # filled by node 1
    raw_issues:list # filled by node 2
    issues:list # filled by node 3
    steps:list # tracks what agent did
    confidence: float # filled by node 3
    

from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
import json
load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)

def get_context(state:ReviewState)->dict:
    code=state["code"]
    filename=state["filename"]
    system_prompt=f"""
        You are a senior software engineer
        Analyze this code file and understand:
        - What the file does overall
        - All functions and their purposes
        - Libraries being used
        - What this file's role is in the codebase
        - Any obvious patterns or practices used

        Return ONLY this JSON:
        {{
            "context": "clear summary of what this file does and its role"
                        
        }}

    """
    response=llm.invoke([
        {"role":"system","content":system_prompt},
        {"role":"user","content":f"File:{filename}\n\n{code}"}
    ])
    text = response.content
    if isinstance(text, str) and text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:].strip()
    res=json.loads(text)
    
    return {
        "context":res["context"],
        "steps":state["steps"]+[{"name":"get context","status":"success"}]
    }
    
    

def analyse_code(state:ReviewState):
    context=state["context"]
    code=state["code"]
    filename=state["filename"]
    system_prompt=f"""
        You are a senior code reviewer
        Context of thsi file: {context}
        if after seeing all things file looks correct overall then no need to necessarily find the loopholes.
        You need to analyse this current file in terms of:
        - bugs
        - warnings
        - edge cases that could breake in run time
        - bad practices

        Return ONLY this JSON:
        {{
            "issues":[
                {{
                    
                    "id":"issue_1",
                    "type":"bug/warning/error/bad practice/edge case/suggestion",
                    "title":"Issue title",
                    "description":"clear explanation of the issue",
                    "risk":"specific one line impact of this issue",
                    "suggestion":"specific one line actionable fix",
                    "anchor":"smallest unique code block that contains the issue"
        
                }}
            ]
        }} 
        IMPORANT FOR ANCHOR:
        - must be exact charcaters from the code
        - Every anchor must be UNIQUE across all issues
        - If two or more issues share the same code, make anchor more specific by including surrounding line

"""
    resp=llm.invoke([
        {"role":"system","content":system_prompt},
        {"role":"user","content":f"File and context are:{code}\n{context}"}
    ])
    text = resp.content
    if isinstance(text, str) and text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:].strip()
    res=json.loads(text)
    

    return {
        "raw_issues": res["issues"],  # list of all issues
        "steps": state["steps"] + [
            {"name": "Analyze Code", "status": "success"}
        ]
    }

def rank_and_structure(state:ReviewState):
    raw_issues=state["raw_issues"]
    issues=[]
    for iss in raw_issues:
        comp_issue=iss
        if iss["type"] in ("bug", "error"):
            comp_issue["confidence"]=1.0
        elif iss["type"]=="warning":
            comp_issue["confidence"]=0.8
        elif iss["type"]=="edge_case":
            comp_issue["confidence"]=0.6
        elif iss["type"]=="suggestion":
            comp_issue["confidence"]=0.4
        else:
            comp_issue["confidence"] = 0.5
        comp_issue["status"]="open"
        issues.append(comp_issue)
    sorted_list=sorted(issues,key=lambda x:x["confidence"],reverse=True)
    return {
        "issues": sorted_list,
        "steps": state["steps"] + [
            {"name": "Rank and Structure", "status": "success"}
        ]
    }

from langgraph.graph import StateGraph,END,START

graph=StateGraph(ReviewState)

# add nodes
graph.add_node("get_context",get_context)
graph.add_node("analyse_code",analyse_code)
graph.add_node("rank_struct",rank_and_structure)

# connect nodes in order
graph.add_edge(START,"get_context")
graph.add_edge("get_context","analyse_code")
graph.add_edge("analyse_code","rank_struct")
graph.add_edge("rank_struct",END)

review_agent=graph.compile()
