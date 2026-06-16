import { useState } from "react";
import {ChevronDown,ChevronRight, FolderOpen, FolderPlus} from 'lucide-react';

function FileItem({item,onFileClick}){
    const [isOpen,setIsOpen]=useState(false); // to hide or show the file tree

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
    const [folderOpen,setFolderOpen]=useState(false);
    const [path,setPath]=useState("");
    const [showTextArea, setShowTextArea]=useState(false);
    const [inputMode,setInputMode]=useState("");
    const [files,setFiles]=useState([]);

    const handlePath = async()=>{
        try{
            const resp = await fetch(`http://localhost:8000/files?path=${path}`,{
                method:"GET",
                headers:{"Content-Type":"application/json"},
            });
            const data=await resp.json();
            //files will be a list of file/folder objects 
            setFiles(data.tree);
            setFolderOpen(true);
        }catch(err){
            console.err(err);
        }
    }
    return(
        <div className="file-container">
            {!folderOpen &&
            (<div className="open-folder">
                <p className="explorer-hint">No folder opened</p>
                    <button className="explorer-btn" onClick={()=>{setShowTextArea(true); setInputMode("open")}}>
                        <FolderOpen size={15} />Open Folder
                    </button>
                    <button className="explorer-btn" onClick={() => { setShowTextArea(true); setInputMode("new") }}>
                        <FolderPlus size={15} /> New Project
                    </button>
                    {showTextArea &&
                        (<div className="path-input-area"> 
                            <input
                                value={path}
                                onChange={(e)=>setPath(e.target.value)}
                                placeholder={inputMode === "open" ? "Enter folder path..." : "Enter new project path..."}
                                className="path-input"
                            />
                            <button className="path-open-btn"
                            onClick={()=>setFolderOpen(true),handlePath}>
                                {inputMode === "open" ? "Open" : "Create"}
                            </button>
                        </div>)
                    }
                </div>
            )}
            { folderOpen && 
                <>
                    <div className="explorer-header" onClick={()=>setIsOpen(!isOpen)}>
                        {isOpen ? <ChevronDown size={16}/> : 
                                <ChevronRight size={16}/>}

                        <span>{path.split(/[\\/]/).pop().toUpperCase()}</span>

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
                </>
            }
        </div>
    )
}

export default FileExplorer;