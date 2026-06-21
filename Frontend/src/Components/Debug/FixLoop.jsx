import React from "react";
import "./../../styles/fixloop.css";

function FixLoop({ fixLogs }) {
  return (
    <div className="fix-loop-container">
      <div className="fix-loop-header">
        <h3>Agent Execution Trace</h3>
      </div>
      <div className="fix-loop-steps">
        {fixLogs.length === 0 ? (
          <p className="empty-message">No active agent tracking logs found. Trigger a code fix to populate.</p>
        ) : (
          fixLogs.map((log, index) => (
            <div 
              className={`loop-step-card ${log.status}`} 
              key={log.id}
              style={{ "--item-index": index }} // Passed to CSS for staggered entry timings
            >
              <div className="step-indicator">
                <span className={`dot ${log.status}`} />
              </div>
              <div className="step-body">
                <p className="step-text">{log.message}</p>
                <span className="step-badge">{log.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FixLoop;