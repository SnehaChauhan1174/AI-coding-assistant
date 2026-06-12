import { Files, Search, GitBranch, Bug, Settings, Sparkles, Book } from 'lucide-react'

function ActivityBar(){
    return(
        <div className='activity-bar'>
            <div className="activity-icon active">
                <Files size={24} />
            </div>
            <div className="activity-icon">
                <Search size={24} />
            </div>
            <div className="activity-icon">
                <GitBranch size={24} />
            </div>
            <div className="activity-icon">
                <Sparkles size={24} />
            </div>
            <div className="activity-icon">
                <Book size={24} />
            </div>
            <div className="activity-icon">
                <Bug size={24} />
            </div>
            <div className="activity-icon" style={{marginTop: "auto"}}>
                <Settings size={24} />
            </div>
        </div>
    )
}
export default ActivityBar;