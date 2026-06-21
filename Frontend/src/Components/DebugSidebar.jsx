import { Bug, Workflow, RefreshCw } from 'lucide-react'
import "./../styles/debug.css";
import { useState } from 'react';

function DebugSidebar({activeDebugIcon,setActiveDebugIcon, activeTab, handleAnalyze}){
    
    return(
        <div className="debug-sidebar">
            <button className="debug-icon"
                    onClick={()=>{setActiveDebugIcon("issues")
                        handleAnalyze()
                    }}
            >
                <Bug size={18}/>
            </button>
            <button className="debug-icon"
                    onClick={()=>setActiveDebugIcon("chain")}
            >
                <Workflow size={18}/>
            </button>
            <button className="debug-icon"
                    onClick={()=>setActiveDebugIcon("fix-loop")}
            >
                <RefreshCw size={18}/>
            </button>
        </div>
    )
}
export default DebugSidebar;