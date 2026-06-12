import { useState } from "react"

const LANG_MAP = {
  js: "JavaScript", jsx: "JavaScript",
  ts: "TypeScript", tsx: "TypeScript",
  py: "Python", java: "Java",
  cpp: "C++", c: "C", go: "Go",
  rs: "Rust", rb: "Ruby", cs: "C#"
}

function DebugPanel({ activeTab }) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)

  const ext = activeTab?.name?.split(".").pop()?.toLowerCase()
  const language = LANG_MAP[ext] || "code"

  const handleDebug = async () => {
    if (!activeTab?.content) return
    setIsLoading(true)
    setResult(null)
    try {
      const resp = await fetch("http://localhost:8000/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileContent: activeTab.content,
          fileName: activeTab.name,
          language            // send detected language to backend too
        })
      })
      const data = await resp.json()
      setResult(data)
    } catch (err) {
      setResult({ error: "Failed to connect to server." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="generate-panel">

      {/* Language badge */}
      {activeTab && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "12px", color: "#858585" }}>
            Detected: <span style={{ color: "#9cdcfe" }}>{language}</span>
          </span>
          <span style={{ fontSize: "11px", color: "#555" }}>{activeTab.name}</span>
        </div>
      )}

      {!activeTab ? (
        <div style={{ color: "#858585", fontSize: "12px" }}>
          Open a file to start debugging.
        </div>
      ) : (
        <button onClick={handleDebug} className="generate-btn" disabled={isLoading}>
          {isLoading ? "Analyzing..." : "Debug current file"}
        </button>
      )}

      {isLoading && (
        <div className="loading">
          <div className="spinner" />
          <span>Scanning for issues...</span>
        </div>
      )}

      {result?.error && (
        <div style={{ color: "#f48771", fontSize: "12px" }}>{result.error}</div>
      )}

      {result && !result.error && (
        <div className="generated-output">
          <div style={{
            background: "#2d2d2d", borderRadius: "6px",
            padding: "8px 12px", fontSize: "12px",
            color: "#cccccc", lineHeight: "1.5"
          }}>
            {result.summary}
          </div>

          {result.bugs?.length === 0 && (
            <div style={{ color: "#4ec994", fontSize: "12px" }}>✓ No issues found.</div>
          )}

          {result.bugs?.map((bug, i) => (
            <div key={i} style={{
              background: "#1e1e1e",
              border: "1px solid #3d3d3d",
              borderLeft: "3px solid #f48771",
              borderRadius: "6px",
              padding: "8px 10px",
              fontSize: "12px",
              display: "flex", flexDirection: "column", gap: "4px"
            }}>
              {bug.line && (
                <span style={{
                  display: "inline-block",
                  background: "#3a1a1a",
                  color: "#f48771",
                  borderRadius: "4px",
                  padding: "1px 6px",
                  fontSize: "11px",
                  width: "fit-content"
                }}>
                  Line {bug.line}
                </span>
              )}
              <span style={{ color: "#f48771" }}>{bug.issue}</span>
              {bug.fix && (
                <span style={{ color: "#4ec994" }}>→ {bug.fix}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DebugPanel