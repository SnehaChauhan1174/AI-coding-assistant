import { useState } from "react";

function ChatPanel(){

    const [messages,setMessages]=useState([]);
    const [input,setInput]=useState("");

    const handleSend=async(e)=>{
        e.preventDefault();
        const newMsg={
            role:"user",
            content:input
        }
        const updatedMsg=[...messages,newMsg];
        setMessages([...messages,newMsg]);
        setInput("");
        try{
            const resp=await fetch("http://localhost:8000/chat",{
                method:"POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message:input }), 

            })
            if(!resp.ok){
                throw new Error("Failed to send msgs");
            }
            const data=await resp.json();
            const aiMsg={role:"ai",content:data.response}
            setMessages([...updatedMsg,aiMsg]);
        }
        catch(err){
            console.error("Error communicating with backend:", err);
        }
    }

    return(
        <>
            <div className="chat-messages">
                {messages.map((msg,index)=>(
                    <div key={index} className={msg.role=="user"?"user-msg":"ai-msg"}>
                        {msg.content}
                    </div>
                ))}
            </div>
            <div className="chat-input-area">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e)=>setInput(e.target.value)}
                    placeholder="Ask something"
                />
                <button onClick={handleSend}>send</button>
            </div>
        </>
    )
}
export default ChatPanel