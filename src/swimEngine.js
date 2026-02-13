import { useSwarmStore } from "./swarmStore"

export function startSimulation() {
    const { tickRate } = useSwarmStore.getState()

    // Clear any existing interval
    stopSimulation()

    useSwarmStore.setState({ startTime: Date.now() })
    useSwarmStore.getState().addLogEntry("🚀 Simulation started", "system")

    const interval = setInterval(() => {
        runSimulationStep()
    }, tickRate)

    useSwarmStore.setState({ intervalId: interval })
}

export function stopSimulation() {
    const { intervalId } = useSwarmStore.getState()
    if (intervalId) clearInterval(intervalId)
    useSwarmStore.setState({ intervalId: null })
}

function runSimulationStep() {
    const { nodes, updateNodeData } = useSwarmStore.getState()

    nodes.forEach(node => {
        // Dead and isolated nodes don't tick
        if (node.data.status === "dead" || node.data.status === "isolated") return

        let newTick = node.data.tick + 2

        if (newTick >= 100) {
            newTick = 0
            initiateGossip(node)
        }

        updateNodeData(node.id, { tick: newTick })
    })
}

function initiateGossip(sourceNode) {
    const { nodes, addSimulationEdge, removeSimulationEdge } =
        useSwarmStore.getState()

    // Can only gossip with alive or byzantine nodes (not dead/isolated)
    const potentialTargets = nodes.filter(
        n =>
            n.id !== sourceNode.id &&
            n.data.status !== "dead" &&
            n.data.status !== "isolated"
    )
    if (potentialTargets.length === 0) return

    const targetNode =
        potentialTargets[Math.floor(Math.random() * potentialTargets.length)]

    // Create visualization edge
    const edgeId = `e-${sourceNode.id}-${targetNode.id}-${Date.now()}`

    // Edge color reflects source behavior
    let edgeColor = "#64B5F6" // normal blue
    if (sourceNode.data.status === "byzantine" || sourceNode.data.status === "suspected") {
        edgeColor = "#F44336" // red for malicious
    }

    const newEdge = {
        id: edgeId,
        source: sourceNode.id,
        target: targetNode.id,
        animated: true,
        style: { stroke: edgeColor, strokeWidth: 2 },
    }

    addSimulationEdge(newEdge)

    // Remove edge after 800ms and perform exchange
    setTimeout(() => {
        removeSimulationEdge(edgeId)
        performGossipExchange(sourceNode, targetNode)
    }, 800)
}

function performGossipExchange(source, target) {
    const { nodes, updateNodeData, addLogEntry, castVote } =
        useSwarmStore.getState()

    const currentSource = nodes.find(n => n.id === source.id)
    const currentTarget = nodes.find(n => n.id === target.id)

    if (!currentSource || !currentTarget) return
    if (currentSource.data.status === "dead" || currentSource.data.status === "isolated") return
    if (currentTarget.data.status === "dead" || currentTarget.data.status === "isolated") return

    const valA = getGossipValue(currentSource)
    const valB = getGossipValue(currentTarget)

    // --- Target receives value from Source ---
    if (valA > 100) {
        // Target detects anomaly from Source
        addLogEntry(
            `🔍 ${currentTarget.id} received value ${valA} from ${currentSource.id} — ANOMALY DETECTED`,
            "anomaly"
        )

        // Mark source as suspected if not already isolated
        if (currentSource.data.status === "byzantine") {
            updateNodeData(currentSource.id, { status: "suspected" })
        }

        // Cast vote
        castVote(currentSource.id, currentTarget.id)

        const votes = useSwarmStore.getState().suspicionVotes[currentSource.id]
        const voteCount = votes ? votes.size : 0
        addLogEntry(
            `🗳️ ${currentTarget.id} votes SUSPECT on ${currentSource.id} (${voteCount}/3 votes)`,
            "vote"
        )

        // Target resists: don't update its value
        return
    }

    // --- Source receives value from Target ---
    if (valB > 100) {
        // Source detects anomaly from Target
        addLogEntry(
            `🔍 ${currentSource.id} received value ${valB} from ${currentTarget.id} — ANOMALY DETECTED`,
            "anomaly"
        )

        if (currentTarget.data.status === "byzantine") {
            updateNodeData(currentTarget.id, { status: "suspected" })
        }

        castVote(currentTarget.id, currentSource.id)

        const votes = useSwarmStore.getState().suspicionVotes[currentTarget.id]
        const voteCount = votes ? votes.size : 0
        addLogEntry(
            `🗳️ ${currentSource.id} votes SUSPECT on ${currentTarget.id} (${voteCount}/3 votes)`,
            "vote"
        )

        // Source resists
        return
    }

    // --- Normal exchange: gradual convergence ---
    const newA = currentSource.data.value + (valB - currentSource.data.value) * 0.2
    const newB = currentTarget.data.value + (valA - currentTarget.data.value) * 0.2

    updateNodeData(currentSource.id, { value: newA })
    updateNodeData(currentTarget.id, { value: newB })

    addLogEntry(
        `💬 ${currentSource.id} ↔ ${currentTarget.id}: gossip (${Math.round(newA)} ↔ ${Math.round(newB)})`,
        "gossip"
    )
}

function getGossipValue(node) {
    if (node.data.status === "byzantine" || node.data.status === "suspected") {
        return 999
    }
    return node.data.value
}
