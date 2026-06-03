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
4. For editor, used Monaco editor, command is:
      ```npm i @monaco-editor/react```



  
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


*****
### 3rd june
### Implementations
1.Integrated FastAPI backend with groq api and ai chat panel now listening request and respondng.
2.File opening from file explorer into editor:
   Understanding in react:
   - Set variables activeFile and setActiveFile into App.jsx
       Why state in App.jsx?
       Because App.jsx is the parent of both FileExplorer and Editor. State needs to live where both components can access it — that's always the common parent.
   - Why onFileClick acts like setActiveFile? ( refer file explorer component and app.jsx)
          Because you literally passed setActiveFile as the value:
          ```<FileExplorer onFileClick={setActiveFile} />```
          So inside FileExplorer when you call:
          ```onClick={() => onFileClick(item)}```
          It's the same as calling:
          ```setActiveFile(item)```
          onFileClick is just the name of the prop. The actual function behind it is setActiveFile. So yes — calling onFileClick(item) sets activeFile to that item object!









### Features understanding part
 __one more thing i got wrt giving context to ai__
### Context engineering part
For your AI to truly understand a project it needs:
File Structure     → what files exist
File Contents      → what code is in each file
Import Relations   → which file imports which
Current open file  → what user is looking at
Selected code      → what user highlighted
Error messages     → what's failing
     
How this is engineered — 3 layers:
     Layer 1 — Static Context
     Read all files, build a map of the project. Send this with every request.
     Layer 2 — Dynamic Context
     What file is open, what lines are selected, what error just happened. Changes in real time.
     Layer 3 — Relationship Graph
     Which files import each other — this is what powers the error chain and flowchart.
     
The Reality
     You can't send the entire codebase to Groq every time — there's a token limit. So smart IDEs like Cursor do this:
     1. Index the whole project
     2. When user asks something → find RELEVANT files only
     3. Send only those to AI
     This is called __RAG (Retrieval Augmented Generation)__.
     
Your Build Order for this:
     Step 1 → Send current open file with every message (easy)
     Step 2 → Send full file tree structure (medium)
     Step 3 → Backend reads actual files from disk (medium)
     Step 4 → Build import graph for flowchart (hard)
     Step 5 → RAG for smart context (advanced)
     
****


