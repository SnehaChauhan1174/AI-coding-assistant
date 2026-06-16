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

3. Implemented the tabs bar which also includes the state management, in App.jsx
4. Designed dragger div for chat panel and file explorer, also included state management of setting widths using inline style and onMouseMove and onMouseUp in ide-container with handling the onMouseMove
    with storing the value( explorer or chat) in dragging state and then setting the width corespondingly, in App.jsx
5. Send editor code to AI
    Now when user sends a message, the AI should also receive the currently open file's content as context.
   This is i am doing as first layer already discussed in context engg part.







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


### some commands for backend running:
- to switch into venv : ```.\venv\Scripts\activate.ps1```
- to run fast api app : ```uvicorn main:app --reload```


### 16 june
Implementing the editor functionalities with file explorer:
- **Task:**
 First how the extension we can let the editor know right now it is language="javascript" fixed
  but we want it to knwo from current file so we will send extension thru file name (.jsx) right file name is stored in string
 - **Solution i thought**
  for it i think about creating a diff state for it extension and setextension and taking the file thru fileClick and in fileexplorer
  and then extracting its extension using simple string operation
 - **actual thing**
  but this is redundant thing as activeTab already had content and name of current file so we can just get from it.

***
Next thing i am doing is create file and folder functionality, now as vs does to create file and folder in local system and also opening older from local system we can do that also

in thiswe go first with making opne folder functionality for this, i created a button and on clciking that btn an inpit area will get opened and user will eneter the path and it will et opne then
i wrote a diff function for shwoing the text area when a button will be clicked but the problem was:
If your goal is to show a textarea when a button is clicked, this won't work:

```<button onClick={handlePath}>Add Path</button>```

because React doesn't render JSX returned from an event handler. Event handlers should update state, not return UI.
```
const [showTextarea, setShowTextarea] = useState(false);

const handlePath = () => {
    setShowTextarea(true);
};

return (
    <>
        <button onClick={handlePath}>Add Path</button>

        {showTextarea && (
            <textarea
                onChange={(e) => setPath(e.target.value)}
                placeholder="Enter path"
            />
        )}
    </>
);
```
we can do like this

- Next i go to build the tree in backend which is recieving the path from frontend:
  now for getting the directories and files from path we used os module
  forming same structure of file tree as we made earlier dummy
  a list of dictionaries of files and folders each dict containing
    - name
    - type - file/folder
    - path - full path till now( which we get from curr path and file or foldr name joining using os.path.join()
    - children -[] same list again or children if curr was directory
  now for this made a diff function to work recursively as if wriiten in same function with FastAPI endpoint:
  @app.get("/files")
  when we use decorstors these made func to return a sepcific wrapper form defined in decorator itself.
  now it return a HTTP response with JSON format so then it will return
  {"tree":[]} like this
```
  {
  "name": "src",
  "type": "folder",
  "children": {"tree": [...]}  // ← wrong! extra wrapper
}
```

- so now getting the file content what i think ki lets make content key itslef in tree while loading
  but this approach will be slow and thus we can do lazy laoding in which we can load the content of only file we are opening
  which is what vs also does
  # Open Existing Folder — Implementation Documentation

## Overview
Implemented real file system integration allowing users to open any folder from their local disk into the IDE, replacing the hardcoded dummy file tree with actual project files.

---

## Architecture

```
User enters path → Frontend sends to FastAPI → Backend reads disk → Returns file tree JSON → Frontend renders in explorer → Click file → Backend reads content → Monaco shows real code
```

---

## Backend Implementation

### 1. File Tree Endpoint — `/files`

**Key concept:** Separated the recursive logic into a helper function `build_tree()` and kept the FastAPI endpoint `get_files()` as a thin wrapper. This is important because FastAPI decorators wrap functions in HTTP response machinery — calling an endpoint function recursively would return an HTTP response object instead of a plain list.

```python
def build_tree(path):
    tree = []
    for f in os.listdir(path):
        full_path = os.path.join(path, f)
        f_obj = {}
        f_obj["name"] = f
        f_obj["path"] = full_path
        if os.path.isdir(full_path):
            f_obj["type"] = "folder"
            f_obj["children"] = build_tree(full_path)
        else:
            f_obj["type"] = "file"
        tree.append(f_obj)
    return tree

@app.get("/files")
def get_files(path: str):
    return {"tree": build_tree(path)}
```

**Mistakes made and fixed:**
- Initially called `getFiles()` recursively instead of `build_tree()` — this would have returned HTTP response objects as children instead of plain lists
- Used `os.path.isdir(f)` (just filename) instead of `os.path.isdir(full_path)` (full path) — fixed by always using the full path computed with `os.path.join()`
- Missing `/` in endpoint decorator: `@app.get("file-content")` → fixed to `@app.get("/file-content")`

---

### 2. File Content Endpoint — `/file-content`

**Key concept:** Files are NOT loaded eagerly when the tree is built. Content is fetched lazily only when a file is clicked — this is called lazy loading. Loading all file contents upfront would be very slow for large projects.

```python
@app.get("/file-content")
def get_file_content(path: str):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return {"content": f.read()}
    except Exception as e:
        return {"content": f"Cannot read file: {str(e)}"}
```

**Why try/except:** Binary files (images, executables) cannot be read as text and will throw an error without it.

---

## Frontend Implementation

### 1. FileExplorer Component

Added states to manage folder opening flow:

```jsx
const [folderOpen, setFolderOpen] = useState(false)   // is a folder open?
const [showTextArea, setShowTextArea] = useState(false) // show path input?
const [path, setPath] = useState("")                    // user entered path
const [files, setFiles] = useState([])                  // real file tree from backend
```

**UI flow:**
- Default state → shows "Open Folder" button
- Click button → shows path input + Open button
- Click Open → calls backend → sets `files` state → sets `folderOpen` to true
- `folderOpen` true → renders real file tree

**Mistakes made and fixed:**
- `onClick={setShowTextArea(true)}` — this calls the function immediately on render, not on click. Fixed to `onClick={() => setShowTextArea(true)}`
- Two props with same name: `onFileClick={handleFileClick} onFileClick={handleExtension}` — only the second one would work, first gets overridden. Fixed by combining into one `handleFileClick` function in App.jsx
- Missing fragment wrapper when returning two sibling elements inside `&&` conditional — fixed by wrapping in `<></>`

**Extracting folder name from path:**
```jsx
const folderName = path.split(/[\\/]/).pop().toUpperCase()
// handles both Windows (\) and Mac/Linux (/) separators
```

---

### 2. App.jsx — handleFileClick

Updated to async function that fetches real file content when a file is clicked:

```jsx
const handleFileClick = async (file) => {
    const resp = await fetch(
        `http://localhost:8000/file-content?path=${encodeURIComponent(file.path)}`
    )
    const data = await resp.json()
    const fileWithContent = { ...file, content: data.content }

    const alreadyOpen = openTabs.find(tab => tab.name === file.name)
    if (!alreadyOpen) setOpenTabs([...openTabs, fileWithContent])
    setActiveTab(fileWithContent)
}
```

**Key points:**
- `encodeURIComponent()` is essential — without it, backslashes and spaces in Windows paths break the URL
- Spread operator `{ ...file, content: data.content }` adds content to existing file object without mutating it
- Content is added to the file object before storing in `openTabs` so switching tabs doesn't re-fetch

**Mistakes made and fixed:**
- Missing `async` keyword on `handleFileClick` while using `await` inside
- `method="GET"` (JSX syntax) inside a JavaScript object — fixed to `method: "GET"`
- Wrong URL format: `/files?D:\path` instead of `/files?path=D:\path` — query parameters need `key=value` format
- `!ext in extensions` checks if `false` is in extensions — fixed to `!(ext in extensions)`

---

## Language Detection

Monaco Editor requires a language string to enable syntax highlighting. Built a mapping from file extensions to Monaco language names:

```jsx
const extensions = {
    "jsx": "javascript",
    "js": "javascript",
    "py": "python",
    "cpp": "cpp",
    "html": "html",
    "css": "css",
    "json": "json"
}

const getExtension = (name) => {
    const ext = name.split(".").pop()
    if (!(ext in extensions)) return "plaintext"
    return extensions[ext]
}
```

Passed to Monaco:
```jsx
language={activeTab ? getExtension(activeTab.name) : "javascript"}
```

---

## Key Concepts Learned

| Concept | What it means |
|---|---|
| Lazy loading | Don't load data until it's actually needed |
| Recursive function vs endpoint | Keep business logic in plain functions, endpoints are just wrappers |
| `os.path.join()` | Always use this for paths — handles OS differences automatically |
| `encodeURIComponent()` | Always encode paths before putting in URLs |
| Prop drilling | Passing data down through multiple component levels |
| Spread operator | `{...obj, key: value}` adds/updates fields without mutating original |

---

## Final Result

- User can open any folder from their local disk
- Real file tree renders in explorer with correct folder/file hierarchy  
- Clicking any file loads its actual content into Monaco editor
- Correct syntax highlighting based on file extension
- Multi-tab support — multiple files open simultaneously
- IDE reads its own source code correctly
  
  


