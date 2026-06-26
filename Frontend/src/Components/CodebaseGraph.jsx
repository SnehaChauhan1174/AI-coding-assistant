// import { useEffect,useState } from "react";
// import "./../styles/codebaseGraph.css";
// import {
//     ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, MarkerType
// } from '@xyflow/react';
// import '@xyflow/react/dist/style.css';

// function CodebaseGraph({activeTab,projectRoot}){
//     if(!activeTab){
//         return (
//             <div className="empty-state">
//                 <h2>No file selected</h2>
//                 <p>Open a file to view dependency graph.</p>
//             </div>
//         );
//     }
//     const [graph,setGraph]=useState(null);
//     const [loading,setLoading]=useState(false);
//     useEffect(()=>{
//         if(!activeTab) return;
//         const loadGraph=async()=>{
//             setLoading(true);
//             try{
//                 console.log("Sending dependency request:", {
//                     file_path: activeTab?.path,
//                     project_root: projectRoot
//                 });
//                 const res=await fetch("http://localhost:8000/dependencies",{
//                     method:"POST",
//                     headers:{
//                         "Content-Type":"application/json"
//                     },
//                     body:JSON.stringify({
//                         file_path:activeTab?.path,
//                         project_root:projectRoot
//                     })
//                 });
//                 const data=await res.json();
//                 setGraph(data);
//             }
//             catch(err){
//                 console.error(err);
//             }
//             finally{
//                 setLoading(false);
//             }
//         };
//         loadGraph();
//     },[activeTab]);
    
//     if(loading){
//         return <p>Loading...</p>
//     }
//     if(!graph) return null;
//     console.log(graph.dependencies)
//     return(
//         <div className="graph-container">
//             <div className="entry-node">
//                 <div className="node-title">{graph.entry}</div>
//                 <div className="node-path">{graph.entry_dir}</div>
//             </div>

//             <div className="dependency-row">
//                 {graph.dependencies.map((dep)=>(
//                     <div className={`dependency-node${dep.type.toLowerCase()}`}
//                          key={dep.path}
//                     >
//                         <div className="node-title">
//                             {dep.path.split(/[\\/]/).pop()}
//                         </div>
//                         <div className="node-path">
//                             {dep.path}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );

// }

import { useEffect, useState, useCallback } from "react";
import {
    ReactFlow, Background, Controls, MiniMap,
    useNodesState, useEdgesState, MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import "./../styles/codebaseGraph.css";

const TYPE_COLORS = {
    Entry:     "#ff5555",
    Component: "#0078d4",
    Hook:      "#9c27b0",
    Service:   "#2ea043",
    Utility:   "#ff9800",
    External:  "#555555",
};

function nodeStyle(type) {
    return {
        background:   TYPE_COLORS[type] || "#333",
        color:        "#ffffff",
        border:       "none",
        borderRadius: "8px",
        padding:      "10px 18px",
        fontSize:     "12px",
        fontWeight:   type === "Entry" ? "700" : "500",
        minWidth:     "140px",
        textAlign:    "center",
        boxShadow:    "0 2px 8px rgba(0,0,0,0.4)",
    };
}

function layoutNodes(entryName, dependencies) {
    const nodes = [];
    const edges = [];

    nodes.push({
        id:       entryName,
        data:     { label: entryName, type: "Entry", path: "" },
        position: { x: 0, y: 0 },
        style:    nodeStyle("Entry"),
    });

    const cols   = Math.min(dependencies.length, 4);
    const gapX   = 220;
    const gapY   = 140;
    const totalW = (cols - 1) * gapX;

    dependencies.forEach((dep, i) => {
        const col  = i % cols;
        const row  = Math.floor(i / cols);
        const x    = col * gapX - totalW / 2;
        const y    = (row + 1) * gapY + 60;
        const name = dep.path.split(/[\\/]/).pop();

        nodes.push({
            id:       name,
            data:     { label: name, type: dep.type, path: dep.path },
            position: { x, y },
            style:    nodeStyle(dep.type),
        });

        edges.push({
            id:        `e-${entryName}-${name}`,
            source:    entryName,
            target:    name,
            animated:  true,
            markerEnd: { type: MarkerType.ArrowClosed, color: TYPE_COLORS[dep.type] || "#555" },
            style:     { stroke: TYPE_COLORS[dep.type] || "#555", strokeWidth: 2 },
        });
    });

    return { nodes, edges };
}

function CodebaseGraph({ activeTab, projectRoot }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading,      setLoading]      = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [graphData,    setGraphData]    = useState(null);

    const buildGraph = useCallback(async (filePath) => {
        if (!filePath || !projectRoot) return;
        setLoading(true);
        setSelectedNode(null);
        try {
            const res  = await fetch("http://localhost:8000/dependencies", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ file_path: filePath, project_root: projectRoot }),
            });
            const data = await res.json();
            setGraphData(data);
            const { nodes: n, edges: e } = layoutNodes(data.entry, data.dependencies);
            setNodes(n);
            setEdges(e);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [projectRoot]);

    useEffect(() => {
        if (activeTab?.path) buildGraph(activeTab.path);
    }, [activeTab, buildGraph]);

    const onNodeClick = useCallback((_, node) => {
        setSelectedNode(node.data);
    }, []);

    if (!activeTab) {
        return (
            <div className="graph-empty">
                <p>Open a file to view its dependency graph.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="graph-loading">
                <div className="graph-spinner" />
                <p>Building graph…</p>
            </div>
        );
    }

    return (
        <div className="graph-wrapper">

            <div className="graph-canvas">
                <div className="graph-header">
                    <span className="graph-header-title">
                        Codebase Graph — {activeTab?.name}
                    </span>
                    <div className="graph-legend">
                        {Object.entries(TYPE_COLORS).map(([type, color]) => (
                            <span key={type} className="legend-item">
                                <span className="legend-dot" style={{ background: color }} />
                                {type}
                            </span>
                        ))}
                    </div>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    fitView
                    fitViewOptions={{ padding: 0.3 }}
                    style={{ paddingTop: "38px" }}
                >
                    <Background color="#2a2a2a" gap={20} />
                    <Controls style={{ background: "#2d2d2d", border: "none" }} />
                    <MiniMap
                        style={{ background: "#252526", border: "1px solid #3d3d3d" }}
                        nodeColor={n => TYPE_COLORS[n.data?.type] || "#555"}
                        maskColor="rgba(0,0,0,0.6)"
                    />
                </ReactFlow>
            </div>

            <div className="graph-detail-panel">
                <p className="detail-panel-label">Selected Node</p>

                {selectedNode ? (
                    <>
                        <div
                            className="detail-node-title"
                            style={{ background: TYPE_COLORS[selectedNode.type] || "#333" }}
                        >
                            {selectedNode.label}
                        </div>

                        <div className="detail-node-info">
                            <div>
                                <span>Type: </span>
                                <span style={{ color: TYPE_COLORS[selectedNode.type] }}>
                                    {selectedNode.type}
                                </span>
                            </div>
                            <div className="detail-node-path">
                                <span>Path: </span>
                                {selectedNode.path || activeTab?.path}
                            </div>
                        </div>

                        {selectedNode.type !== "Entry" && (
                            <button
                                className="show-deps-btn"
                                onClick={() => {
                                    const fullPath = (projectRoot + "/" + selectedNode.path).replace(/\\/g, "/");
                                    buildGraph(fullPath);
                                }}
                            >
                                 Show its dependencies
                            </button>
                        )}
                    </>
                ) : (
                    <p className="detail-empty">Click a node to see details</p>
                )}

                {graphData && (
                    <div className="detail-summary">
                        <p className="detail-summary-label">Summary</p>
                        <div className="detail-summary-content">
                            <span>
                                Imports: <b style={{ color: "#ccc" }}>{graphData.dependencies.length}</b>
                            </span>
                            {Object.entries(
                                graphData.dependencies.reduce((acc, d) => {
                                    acc[d.type] = (acc[d.type] || 0) + 1;
                                    return acc;
                                }, {})
                            ).map(([type, count]) => (
                                <span key={type} style={{ color: TYPE_COLORS[type] }}>
                                    {type}: {count}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}



export default CodebaseGraph;

