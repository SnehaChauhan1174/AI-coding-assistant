import { useState } from "react";
import {ChevronDown,ChevronRight} from 'lucide-react';

function FileItem({item}){
    const [isOpen,setIsOpen]=useState(false);
    return(
        <>
            {item.type=="file" && (
                <div>📄 {item.name}</div>
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
                            <FileItem key={child.name} item={child}/>
                        ))}
                    </div>

                )}
                </>
            )}
        </>
        
    )

}

function FileExplorer(){
    const [isOpen,setIsOpen]=useState(false);
    
    const files=[
        {name:"src",type:"folder",
            children:[
                {name:"appp.jsx",type:"file"},
                {name:"main.jsx",type:"file"},
            ]
        },
        {name:"index.html",type:"file"},
        {name:"package.json",type:"file"},
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
                    <FileItem key={item.name} item={item}/>
                ))}
            </div>)}
        </div>
    )
}

export default FileExplorer;