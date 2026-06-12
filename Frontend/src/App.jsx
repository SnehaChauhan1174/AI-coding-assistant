import Editor from '@monaco-editor/react';
import FileExplorer from './Components/FileExplorer';
import ChatPanel from './Components/ChatPanel';
import Tabs from './Components/Tabs';
import ActivityBar from './Components/ActivityBar';
import RightPanel from './Components/RightPanel';
import ToolBar from './Components/ToolBar';
import { useState } from 'react';
import './App.css';


const App=()=>{
  const [openTabs,setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [explorerWidth, setExplorerWidth] = useState(250);
  const [chatWidth, setChatWidth] = useState(300);
  const [activePanel,setActivePanel] = useState(null);

  const handleFileClick=(file)=>{
      const alreadyOpen=openTabs.find(tab=>tab.name===file.name);
      if(!alreadyOpen){
        setOpenTabs([...openTabs,file]);
      }
      setActiveTab(file);
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
  const handleApplyCode = (code) => {
    if (activeTab) {
        const updatedTab = { ...activeTab, content: code }
        setActiveTab(updatedTab)
        setOpenTabs(openTabs.map(t => 
            t.name === activeTab.name ? updatedTab : t
        ))
    }
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
          <FileExplorer onFileClick={handleFileClick}/>
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
          <Editor
            height="100%"
            language="javascript"
            theme="vs-dark"
            className='editor-area'
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

        <div className='drag-handle' 
            onMouseDown={()=>setDragging("chat")}></div>
        
        <div className='right-panel' style={{ width: activePanel ? chatWidth : 0  }}>
          <RightPanel 
            activeTab={activeTab}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            onApplyCode={handleApplyCode}
          />
        </div>
      </div>
      <div className='status-bar'>
          <span>AI Coding Assistant</span>
          <span>{activeTab ? activeTab.name : "No file open"}</span>
          <span>{activeTab ? "JavaScript" : ""}</span>
      </div>
    </div>
  )
}

export default App;
