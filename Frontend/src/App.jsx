import Editor from '@monaco-editor/react'
import './App.css'
import FileExplorer from './Components/FileExplorer'
import ChatPanel from './Components/ChatPanel'
import Tabs from './Components/Tabs';
import { useState } from 'react'

const App=()=>{

  const [openTabs,setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [explorerWidth, setExplorerWidth] = useState(250)
  const [chatWidth, setChatWidth] = useState(300)

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
  };

  return(
    <div className="ide-container"
      onMouseMove={(e)=>{
        if(dragging) handlMouseMove(e);
      }}
      onMouseUp={()=>setDragging(null)}>
      <div className='activity-bar'>AB</div>

      <div className='file-explorer' style={{ width:explorerWidth }}>
        <FileExplorer onFileClick={handleFileClick}/>
      </div>

      <div className='drag-handle' 
          onMouseDown={()=>setDragging("explorer")}></div>

      <div className='editor-area'>
        <Tabs 
            openTabs={openTabs} 
            activeTab={activeTab} 
            onTabClick={setActiveTab} 
            onTabClose={handleTabClose}
        />
        <Editor
          height="100%"
          language="javascript"
          theme="vs-dark"
          className='editor-area'
          value={activeTab ? activeTab.content : "// Start coding here..."}
        />
      </div>
      <div className='drag-handle' 
          onMouseDown={()=>setDragging("chat")}></div>

      <div className='chat-panel' style={{ width:chatWidth }}>
        <ChatPanel/>
      </div>
    </div>
  )
}

export default App;
