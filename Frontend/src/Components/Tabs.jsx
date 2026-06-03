function Tabs({ openTabs, activeTab, onTabClick, onTabClose }) {
    return (
        <div className="tabs-bar">
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
    )
}

export default Tabs;