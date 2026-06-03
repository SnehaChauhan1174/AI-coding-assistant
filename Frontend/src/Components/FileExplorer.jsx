import { useState } from "react";
import {ChevronDown,ChevronRight} from 'lucide-react';

function FileItem({item,onFileClick}){
    const [isOpen,setIsOpen]=useState(false);
    return(
        <>
            {item.type=="file" && (
                <div className="file-item" onClick={()=>{
                        onFileClick(item);
                    }}>
                    📄 {item.name}
                </div>
            )}
            {item.type=="folder" && (
                <>
                <div className="folder-header" onClick={()=>setIsOpen(!isOpen)}>
                    {isOpen ?   <ChevronDown size={16}/> : 
                                <ChevronRight size={16}/>}
                    <span>📁 {item.name}</span>
                    
                </div>
                { isOpen && (
                    <div className="folder-children">
                        {item.children.map((child)=>(
                            <FileItem key={child.name} item={child} onFileClick={onFileClick}/>
                        ))}
                    </div>

                )}
                </>
            )}
        </>
    )

}

function FileExplorer({onFileClick}){
    const [isOpen,setIsOpen]=useState(false);
    
    const files=[
        {name:"src",type:"folder",
            children:[
                {name:"app.jsx",type:"file", content:"// app.jsx content here"},
                {name:"main.jsx",type:"file", content:"// main.jsx content here"},
            ]
        },
        {name:"index.html",type:"file", content:"index.html content here"},
        {name:"package.json",type:"file", content:"package.json content here"},
    ]
    return(
        <div className="file-container">
            <div className="explorer-header" onClick={()=>setIsOpen(!isOpen)}>
                {isOpen ? <ChevronDown size={16}/> : 
                          <ChevronRight size={16}/>}
                <span>AI CODING ASSISTANT</span>
            </div>
            {isOpen && 
            (<div className="file-items"> 
                {files.map((item)=>(
                    <FileItem key={item.name} 
                              item={item} 
                              onFileClick={onFileClick}
                             />
                ))}
            </div>)}
        </div>
    )
}

export default FileExplorer;