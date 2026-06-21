import Editor, {DiffEditor} from '@monaco-editor/react';
import FileExplorer from './Components/FileExplorer';
import ChatPanel from './Components/ChatPanel';
import Tabs from './Components/Tabs';
import ActivityBar from './Components/ActivityBar';
import RightPanel from './Components/RightPanel';
import ToolBar from './Components/ToolBar';
import { useState, useRef } from 'react';
import './App.css';
import { Diff } from 'lucide-react';
import "./styles/editor.css";


const App=()=>{
  const [openTabs,setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [explorerWidth, setExplorerWidth] = useState(250);
  const [chatWidth, setChatWidth] = useState(300);
  const [activePanel,setActivePanel] = useState(null);
  const [showDiff,setShowDiff] = useState(false);
  const [proposedCode,setProposedCode]=useState(null);
  const [fixLogs,setFixLogs]=useState([]);
  
  const editorRef=useRef(null);

  const handleFileClick=async(file)=>{
      //fetch real content from backend
      try{
      const resp=await fetch(`http://localhost:8000/file-content?path=${file.path}`,{
        method:"GET"
      });
      const data=await resp.json();
      const fileWithContent={...file,content:data.content};

      const alreadyOpen=openTabs.find(tab=>tab.name===file.name);
      if(!alreadyOpen){
        setOpenTabs([...openTabs,fileWithContent]);
      }
      setActiveTab(fileWithContent);
    }catch(err){
      console.log(err);
    }
  }
 
  const handleTabClose = (tab) => {
    setOpenTabs(openTabs.filter(t => t.name !== tab.name))
    if(activeTab?.name === tab.name) setActiveTab(null)
  }
  const handlMouseMove=(e)=>{
    if(dragging==="explorer"){
      setExplorerWidth(e.clientX-48); // subtract activity bar width
    }
    if(dragging==="chat"){
      setChatWidth(window.innerWidth-e.clientX);
    }
  }
  const handleApplyCode = (code) => {//saving the updated code to active tab state to preserve changes across tabs
    if (activeTab) {
        const updatedTab = { ...activeTab, content: code }
        setActiveTab(updatedTab)
        setOpenTabs(openTabs.map(t => 
            t.name === activeTab.name ? updatedTab : t
        ))
    }
  }

  const handleProposeFix=(proposedCode)=>{
    setProposedCode(proposedCode);
    setShowDiff(true);
  }

  const handleKeep = async()=>{
    // const editor=editorRef.current;
    // if(!editor) return;
    // editor.pushUndoStop(); // locks the state before the edit
    // editor.executeEdits("ai-fix",[{//will swap that exact range part form old snippet to new nippet
    //   range:proposedCode.range,
    //   text:proposedCode.new_snippet
    // }]);
    // editor.pushUndoStop();// locks it after
    
    // const newContent=editor.getValue();
    // handleApplyCode(newContent);
    const modifiedContent = getModifiedContent();
    handleApplyCode(modifiedContent);
    setShowDiff(false);
    // //verify loop
    // //calling verify endpoint from backend
    // const resp=await fetch("http://localhost:8000/review-agent/verify",{
    //   method:"post",
    //   headers:{"Content-Type":"applications/json"},
    //   body:{
    //       "issue":proposedCode.issue,
    //       "old_snippet":proposedCode.old_snippet,
    //       "new_snippet":proposedCode.new_snippet
    //   } 
    // });
    // const data = await resp.json();
    // //in data status and reason to store in the logs
    // setFixLogs(prev=>[
    //   ...prev,
    //   {
    //     status:data.status,
    //     reason:data.reason
    //   }
    // ]);
    //after pass removing the issue card from panel
    // setBugs(prev=>prev.filter(
    //   bug=>bug.id!=proposedCode.issue.id
    // ))
    setProposedCode(null);
  }
  const extensions = {
    "jsx": "javascript",
    "js": "javascript",
    "java": "java",
    "py": "python",
    "cpp": "cpp",
    "html": "html",
    "css": "css",
    "env": "env",
  }
  const getExtension = (name) => {
    const ext = name.split(".").pop();
    if (!(ext in extensions)) {
      return "txt";
    }
    return extensions[ext];
  }
  const getModifiedContent=()=>{
    if(!proposedCode || !activeTab) return "";
    const model=editorRef.current?.getModel();
    if(!model) return "";
    //simulate the edit
    const lines=activeTab.content.split("\n");
    const range=proposedCode.range;
    const newLines=proposedCode.new_snippet.split('\n');
    lines.splice(
      range.startLineNumber-1,
      range.endLineNumber-range.startLineNumber+1,
      ...newLines
    )
    return lines.join("\n");
  }


  return(
    <div className="ide-container"
      onMouseMove={(e)=>{ if(dragging) handlMouseMove(e); }}
      onMouseUp={()=>setDragging(null)}>

      <div className='main-area'>
        <div className='activity-bar'>
          <ActivityBar/>
        </div>

        <div className='file-explorer' style={{ width:explorerWidth }}>
          <FileExplorer onFileClick={(item)=>{
                  handleFileClick(item);
                  
          }}/>
                     
        </div>

        <div className='drag-handle'  onMouseDown={()=>setDragging("explorer")}></div>

        <div className='editor-area'>
          <Tabs 
              openTabs={openTabs} 
              activeTab={activeTab} 
              onTabClick={setActiveTab} 
              onTabClose={handleTabClose}
              activePanel={activePanel}
              setActivePanel={setActivePanel}
          />
          {showDiff && (
            <div className="diff-actions">
              <button className='keep-btn' onClick={handleKeep}>✓ Keep</button>
              <button className="undo-btn" onClick={() => {
                  setShowDiff(false)
                  setProposedCode(null)
              }}>✗ Undo</button>
            </div>

          )}
          <div style={{height:"100%", display:showDiff ? "none" : "block"}}>
            <Editor
              key="main-editor"
                height="100%"
                language={activeTab ? getExtension(activeTab.name):"javascript"}
                theme="vs-dark"
                onMount={(editor) => editorRef.current = editor}
                value={activeTab ? activeTab.content : "// Start coding here..."}
                onChange={(newValue) => {
                  if (activeTab) {
                    const updated = { ...activeTab, content: newValue }
                    setActiveTab(updated)
                    setOpenTabs(openTabs.map(t =>
                      t.name === activeTab.name ? updated : t
                    ))
                  }
                }}
              />
          </div>
           {showDiff && (
              <div style={{ height: "100%" }}>
                  <DiffEditor
                      height="100%"
                      theme="vs-dark"
                      original={activeTab?.content || ""}
                      modified={getModifiedContent() || ""}
                      language={activeTab ? getExtension(activeTab.name) : "javascript"}
                      options={{ renderSideBySide: false }}
                  />
              </div>
          )}
        </div>

        <div className='drag-handle' 
            onMouseDown={()=>setDragging("chat")}></div>
        
        <div className='right-panel' style={{ width: activePanel ? chatWidth : 0  }}>
          <RightPanel 
            activeTab={activeTab}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            onApplyCode={handleApplyCode}
            onProposeFix={handleProposeFix}
            editorRef={editorRef} 
            fixLogs={fixLogs}
            setFixLogs={setFixLogs}
          />
        </div>
      </div>
      {/* <div className='status-bar'>
          <span>AI Coding Assistant</span>
          <span>{activeTab ? activeTab.name : "No file open"}</span>
          <span>{activeTab ? "JavaScript" : ""}</span>
      </div> */}
    </div>
  )
}

export default App;
