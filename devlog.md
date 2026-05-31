# AI coding assistant
## making a daywise logs of what done and how and why!!
### 31st may
today i started with making ide ui with a basic ai coding functionality on the top of which i would build everything
project setup in vs with frontend as react-vite
``` npm create vite@latest frontend```

************
1. Made basic IDE UI, left panel with file structure
2. Made file explorer, what i learnt:
     - rendering list using map
         ```
         {item.children.map((child)=>(
               <FileItem key={child.name} item={child}/>
         ))}
         ```
     - useState
     - rendering components with a condition
3. Working on Chat Panel component, two states to remember:
     - messages list, to show in message area:
          ```
              { role: "user", content: "hello" }
              { role: "ai", content: "Hi! How can I help?" }
          ```
    - input state for the msg input, with a send button
  
*******
## Two modes in AI assistant:
   - ### Builder mode
       Normal AI coding assistant.
          User says: build authentication middleware
          AI: generates edits debugs executes
       This is normal assistant.
   - ### Thinking mode
       AI switches behavior completely, it becomes:
          ask → evaluate → hint → ask next
     The role reverses.
