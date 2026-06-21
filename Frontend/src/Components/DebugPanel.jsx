import { useState, useEffect } from "react";
import DebugSidebar  from "./DebugSidebar";
import Issues from "./Debug/Issues";
import Chain from "./Debug/Chain";
import FixLoop from "./Debug/FixLoop";
import "./../styles/debug.css";

// const LANG_MAP = {
//   js: "JavaScript", jsx: "JavaScript",
//   ts: "TypeScript", tsx: "TypeScript",
//   py: "Python", java: "Java",
//   cpp: "C++", c: "C", go: "Go",
//   rs: "Rust", rb: "Ruby", cs: "C#"
// }

function DebugPanel({ activeTab, onApplyCode, onProposeFix, editorRef, fixLogs, setFixLogs }) {
  const [activeDebugIcon,setActiveDebugIcon]=useState("issues");
  const [bugs,setBugs]=useState([]);
  const [steps,setSteps]=useState([]);
  const [loading,setLoading]=useState(false);
  const [needRefresh,setNeedRefresh]=useState(false);
  

    const handleAnalyze=async()=>{
        const oldBugCount=bugs.length;
        setLoading(true);
        try{
            const resp=await fetch("http://localhost:8000/review-agent",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                    fileContent:activeTab.content,
                    fileName:activeTab.name
                })
            });
            const data=await resp.json();
            const newBugCount=data.issues?.length || 0;
            setBugs(data["issues"] || []);
            setSteps(data.steps || []);

            setFixLogs(prev=>[
              ...prev, 
              {
                id: `analyze-${Date.now()}`,
                status: "done", 
                message: `Analyzed workspace file: ${activeTab.name}`
              }
            ]);
            if(oldBugCount>0){
              if(newBugCount<oldBugCount){
                setFixLogs(prev=>[
                  ...prev,{
                    id: `resolve-${Date.now()}`,
                    status: "done", 
                    message: `Clean compilation! ${oldBugCount - newBugCount} issue(s) successfully resolved`
                  }
                ]);
              }
              if (newBugCount > oldBugCount) {
                setFixLogs(prev => [
                  ...prev,
                  {
                    id: `warn-${Date.now()}`,
                    status: "still-failing", 
                    message: `Alert: ${newBugCount - oldBugCount} new issue(s) detected in source`
                  }
                ]);
              }
              if (newBugCount === oldBugCount) {
                setFixLogs(prev => [
                  ...prev,
                  {
                    id: `unchanged-${Date.now()}`,
                    status: "still-failing", 
                    message: "Analysis cycle finished: Issue count remains unchanged"
                  }
                ]);
              }
            }

        }
        catch(err){
            console.error(err);
        }finally{
            setLoading(false);
        }
        
    }
   

  return (
    <div className="debug-panel">
    <div className="debug-sidebar-wrapper">
      <DebugSidebar 
          activeDebugIcon={activeDebugIcon}
          setActiveDebugIcon={setActiveDebugIcon}
          handleAnalyze={handleAnalyze}
      />
    </div>
    <div className="debug-content">
      {activeDebugIcon==="issues" && <Issues activeTab={activeTab} 
                                              bugs={bugs} 
                                              isLoading={loading} 
                                          
                                              setNeedRefresh={setNeedRefresh} 
                                              onProposeFix={onProposeFix}
                                              editorRef={editorRef}
                                              setFixLogs={setFixLogs}/>}
      {activeDebugIcon==="chain" && <Chain activeTab={activeTab} steps={steps}/>}
      {activeDebugIcon==="fix-loop" && <FixLoop fixLogs={fixLogs} bugs={bugs}/>}
    </div>
    </div>
  )
}

export default DebugPanel;