import { useState } from "react";
import "./../../styles/issues.css";
import { Lightbulb, TriangleAlert } from "lucide-react";

function Issues({ activeTab, bugs, isLoading, setNeedRefresh, onProposeFix, editorRef,  setFixLogs }) {
    if (!activeTab) {
        return (
        <div className="empty-state">
            <h2>No file selected</h2>
            <p>Open a file to view detected issues and suggestions.</p>
        </div>
        );
    }
  if (isLoading) {
    return <p>Loading issues...</p>;
  }
  const [generating, setGenerating]=useState(null);

  const handleApplyFix = async(bug)=>{
    if (!activeTab || !editorRef?.current) return;
    try{
      setGenerating(bug.id);
      setFixLogs([
        {
          id:`start-${bug.id}`,
          message:`Initiating AI Fix Agent loop for:${bug.title}`,
          status:"pending"
        }
      ]);
    const editor=editorRef.current;
    const model=editor.getModel();
    if(!model){
      alert("editor not ready");
      return;
    }
     const matches = model.findMatches(
        bug.anchor,  // text to find
        false,         // searchOnlyEditableRange
        false,         // isRegex
        true,          // matchCase
        null,          // wordSeparators
        true           // captureMatches
    )
    if(matches.length === 0) {
        alert("Could not find code to fix")
        return
    }
    //  // if multiple matches pick closest to bug.line
    //  const match = matches.length === 1 
    //     ? matches[0] 
    //     : matches.reduce((prev, curr) => 
    //         Math.abs(curr.range.startLineNumber - bug.line) < 
    //         Math.abs(prev.range.startLineNumber - bug.line) 
    //         ? curr : prev
    //     )
    const match=matches[0];

      //calling the backend
      const resp=await fetch("http://localhost:8000/fix-agent/generate",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
                issue:bug, 
                code:model.getValue(),
                anchor:bug.anchor
              })
      })
      if(!resp.ok) throw new Error("Backend patch generation failed");
      const data=await resp.json();
      setFixLogs([
        {
          id: `gen-${bug.id}`,
          message: `Agent generated patch snippet for: ${bug.title}`,
          status: "done"
        }
      ]);
      const range=match.range;
      const proposedCode={
        range,
        old_snippet:bug.anchor,
        new_snippet:data.replacement,
        issue:bug
      }
      // setProposedCode(proposedCode);
      // setShowDiff(true);
      onProposeFix(proposedCode);
      setGenerating(null);

    }catch(err){
      console.log(err);
      setGenerating(null);
      setFixLogs([
      {
        id: `err-${bug.id}`,
        message: `Agent failed to complete the patch generation sequence`,
        status: "still-failing"
      }
    ]);
    }

  }

  return (
    <div className="issues-container">
      {bugs?.map((item) => (
        <div className="issue-card" key={item.id}>
          <div className="issue-header">
            <span className={`issue-type ${item.type.replace(" ", "-")}`}>
              {item.type}
            </span>

            {/* <span className="issue-line">
              line {item.line}
            </span> */}
          </div>

          <p className="issue-title">{item.title}</p>

          <p className="issue-description">
            {item.description}
          </p>

          <div className="diff-block">
                <pre className="diff-line removed">
                    <span><TriangleAlert size={16}/></span> {item.risk}
                </pre>


                <pre className="diff-line added">
                    <span><Lightbulb size={16}/></span> {item.suggestion}
                </pre>
         </div>

          <div className="issue-actions">
            <button className="apply-btn" onClick={()=>handleApplyFix(item)} disabled={generating === item.id}>
              {generating === item.id ? "Fixing..." : "Apply Fix"}
            </button>

            {/* <button className="explain-btn">
              Explain Why
            </button> */}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Issues;