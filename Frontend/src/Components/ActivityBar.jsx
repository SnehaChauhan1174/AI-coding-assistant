import { Files, Search, GitBranch, Bug, Settings, Sparkles, Book, Link2, Workflow } from 'lucide-react'

function ActivityBar({activeView,setActiveView}){
    console.log(activeView)
    console.log(setActiveView)
    return(
        <div className='activity-bar'>
            <button className={activeView==="editor"?"active":""}
                    onClick={()=>setActiveView("editor")}>
                <Files size={24} />
            </button>
            <button className="activity-icon">
                <Search size={24} />
            </button>
            <button className="activity-icon">
                <GitBranch size={24} />
            </button>
            <button className="activity-icon">
                <Sparkles size={24} />
            </button>
            <button className="activity-icon">
                <Book size={24} />
            </button>
            <button className={activeView==="graph"?"active":""}
                    onClick={()=>setActiveView("graph")}>
                <Workflow size={24} />
            </button>
            <button className="activity-icon" style={{marginTop: "auto"}}>
                <Settings size={24} />
            </button>
        </div>
    )
}
export default ActivityBar;