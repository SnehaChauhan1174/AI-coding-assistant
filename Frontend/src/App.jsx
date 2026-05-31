import Editor from '@monaco-editor/react'
import './App.css'
import FileExplorer from './Components/FileExplorer'
import ChatPanel from './Components/ChatPanel'

const App=()=>{
  return(
    <div className="ide-container">
      <div className='activity-bar'>AB</div>
      <div className='file-explorer'>
        <FileExplorer/>
      </div>
      <div className='editor-area'>
        <Editor
          height="100%"
          language="javascript"
          theme="vs-dark"
          defaultValue="// Start coding here..."
        />
      </div>
      <div className='chat-panel'>
        <ChatPanel/>
      </div>
    </div>
  )
}

export default App
