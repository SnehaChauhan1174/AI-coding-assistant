import { useState, useEffect } from "react";
import DebugSidebar  from "./DebugSidebar";
import Issues from "./Debug/Issues";
import Chain from "./Debug/Chain";
import FixLoop from "./Debug/FixLoop";
import "./../styles/debug.css";

const LANG_MAP = {
  js: "JavaScript", jsx: "JavaScript",
  ts: "TypeScript", tsx: "TypeScript",
  py: "Python", java: "Java",
  cpp: "C++", c: "C", go: "Go",
  rs: "Rust", rb: "Ruby", cs: "C#"
}

function DebugPanel({ activeTab, onApplyCode, onProposeFix, editorRef }) {
  const [activeDebugIcon,setActiveDebugIcon]=useState("issues");
  const [bugs,setBugs]=useState([]);
  const [steps,setSteps]=useState([]);
  const [loading,setLoading]=useState(false);
  const [needRefresh,setNeedRefresh]=useState(false);
  const [fixLogs,setFixLogs]=useState([]);

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
                status:"success",
                message:`Reanalyzed ${activeTab.name}`
              }
            ]);
            if(oldBugCount>0){
              if(newBugCount<oldBugCount){
                setFixLogs(prev=>[
                  ...prev,{
                    status:"success",
                    message:`${oldBugCount-newBugCount} issue resolved` 
                  }
                ]);
              }
              if (newBugCount > oldBugCount) {
                setFixLogs(prev => [
                  ...prev,
                  {
                    status: "warning",
                    message: `${newBugCount - oldBugCount} new issue detected`
                  }
                ]);
              }
              if (newBugCount === oldBugCount) {
                setFixLogs(prev => [
                  ...prev,
                  {
                    status: "warning",
                    message: "Issue count unchanged"
                  }
                ]);
              }
            }

            
            console.log(data["issues"]);

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
                                              onApplyCode={onApplyCode} 
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