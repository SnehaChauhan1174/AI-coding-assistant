import "./../../styles/fixloop.css";

function FixLoop({fixLogs,bugs}){
    const remIssues=bugs.filter(
        bug=>bug.status!=="fixed"
    ).length;
    return(
        <div className="fixloop-container">
            <h3>Agent Fix Loop</h3>
            <div className="fixloop-logs">
                {fixLogs.length===0 ? (
                    <p></p>
                ):(
                    fixLogs.map((log,idx)=>(
                        <div key={idx} className={`fixlog ${log.status}`}>
                            {log.message}
                        </div>
                    ))
                )}
            </div>
            <div className="fixloop-summary">
                <h4>Current Status</h4>
                <p>
                    Remaining Issues: {remIssues}
                </p>

            </div>
        </div>
    )
}
export default FixLoop;