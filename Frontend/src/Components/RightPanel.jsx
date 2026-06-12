import { Bug, Sparkles, Book } from 'lucide-react';
import ChatPanel from './ChatPanel';
import GeneratePanel from './GeneratePanel';
import DebugPanel from './DebugPanel';
import ExplainPanel from './ExplainPanel';

function RightPanel({activeTab, activePanel, setActivePanel, onApplyCode}){
    return(
        <div className="right-panel">
            <div className="panel-content">
                {activePanel === "generate" && <ChatPanel activeTab={activeTab} onApplyCode={onApplyCode} />}
                {activePanel === "debug" && <DebugPanel activeTab={activeTab}/>}
                {activePanel === "explain" && <ExplainPanel activeTab={activeTab}/>}
            </div>
        </div>
    )
}

export default RightPanel;