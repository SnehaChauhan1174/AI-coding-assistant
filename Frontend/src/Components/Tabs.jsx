import { MessageSquare, Sparkles, Bug, BookOpen } from 'lucide-react'

function Tabs({ openTabs, activeTab, onTabClick, onTabClose, activePanel, setActivePanel }) {
    return (
        <div className="tabs-bar">
            <div className="file-tabs">
                {openTabs.map((tab) => (
                    <div
                        key={tab.name}
                        className={`tab ${activeTab?.name === tab.name ? "active-tab" : ""}`}
                        onClick={() => onTabClick(tab)}
                    >
                        {tab.name}
                        <span onClick={(e) => {
                            e.stopPropagation()
                            onTabClose(tab)
                        }}>×</span>
                    </div>
                ))}
            </div>
            <div className="panel-switcher">
                <Sparkles size={16} onClick={() => setActivePanel(activePanel==="generate" ? null : "generate")} />
                <Bug size={16} onClick={() => setActivePanel(activePanel==="debug" ? null : "debug")} />
                <BookOpen size={16} onClick={() => setActivePanel(activePanel==="explain" ? null : "explain")} />
            </div>
        </div>
    )
}

export default Tabs;