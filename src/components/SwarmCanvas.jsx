import ReactFlow, { Background, Controls as ReactFlowControls } from "reactflow"
import "reactflow/dist/style.css"
import { useSwarmStore } from "../swarmStore"
import EspNode from "./EspNode"

const nodeTypes = {
    esp: EspNode,
}

export default function SwarmCanvas() {
    const nodes = useSwarmStore(state => state.nodes)
    const edges = useSwarmStore(state => state.edges)
    const onNodesChange = useSwarmStore(state => state.onNodesChange)
    const onEdgesChange = useSwarmStore(state => state.onEdgesChange)

    return (
        <div style={{ height: "100vh", width: "100vw" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background />
                <ReactFlowControls />
            </ReactFlow>
        </div>
    )
}
