import { useState } from "react";

function ChatPanel({ activeTab, onApplyCode }) {
    const [prompt, setPrompt] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        try {
            const resp = await fetch("http://localhost:8000/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: prompt,
                    fileContent: activeTab ? activeTab.content : null,
                    fileName: activeTab ? activeTab.name : null
                })
            });
            const data = await resp.json();
            setGeneratedCode(data.code);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="generate-panel">
            <div className="generate-input-area">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you want to generate..."
                    className="generate-textarea"
                />
                <button onClick={handleGenerate} className="generate-btn">
                    {isLoading ? "Generating..." : "Generate"}
                </button>
            </div>

            {isLoading && (
                <div className="loading">
                    <div className="spinner"></div>
                    <span>Generating code...</span>
                </div>
            )}

            {generatedCode && !isLoading && (
                <div className="generated-output">
                    <div className="output-header">
                        <span>Generated Code</span>
                        <button onClick={() => onApplyCode(generatedCode)} className="apply-btn">
                            Apply to Editor
                        </button>
                    </div>
                    <pre className="code-block">{generatedCode}</pre>
                </div>
            )}
        </div>
    )
}

export default ChatPanel