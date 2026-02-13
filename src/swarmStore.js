import { create } from "zustand"
import { applyEdgeChanges, applyNodeChanges } from "reactflow"

function generateInitialNodes() {
    const radius = 250
    const centerX = 400
    const centerY = 300

    return Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * 2 * Math.PI
        return {
            id: `S${i + 1}`,
            position: {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            },
            data: {
                label: `S${i + 1}`,
                value: 20 + Math.floor(Math.random() * 5),
                status: "alive", // alive | byzantine | suspected | isolated | dead
                tick: Math.floor(Math.random() * 100),
                votes: 0, // how many nodes have voted to isolate this node
            },
            type: "esp",
        }
    })
}

const VOTE_THRESHOLD = 3 // Need 3 votes to isolate a Byzantine node

export const useSwarmStore = create((set, get) => ({
    nodes: generateInitialNodes(),
    edges: [],
    tickRate: 50,
    intervalId: null,
    suspicionVotes: {}, // { targetNodeId: Set([voterId1, voterId2, ...]) }
    eventLog: [],        // [{ time, message, type }]
    startTime: null,     // simulation start timestamp

    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    setTickRate: (rate) => set({ tickRate: rate }),

    // ReactFlow handlers
    onNodesChange: (changes) => set({
        nodes: applyNodeChanges(changes, get().nodes)
    }),
    onEdgesChange: (changes) => set({
        edges: applyEdgeChanges(changes, get().edges)
    }),

    // Edge lifecycle
    addSimulationEdge: (edge) => {
        set((state) => ({
            edges: [...state.edges, edge]
        }))
    },
    removeSimulationEdge: (edgeId) => {
        set((state) => ({
            edges: state.edges.filter(e => e.id !== edgeId)
        }))
    },

    // Node status (user-injected faults only set alive/byzantine/dead)
    setStatus: (id, status) => {
        const state = get()
        const nodes = state.nodes.map(n =>
            n.id === id ? { ...n, data: { ...n.data, status, votes: 0 } } : n
        )
        // Clear any votes for this node if revived
        const suspicionVotes = { ...state.suspicionVotes }
        if (status === "alive") {
            delete suspicionVotes[id]
        }
        set({ nodes, suspicionVotes })
    },

    updateNodeData: (id, newData) => {
        set((state) => ({
            nodes: state.nodes.map(n =>
                n.id === id ? { ...n, data: { ...n.data, ...newData } } : n
            )
        }))
    },

    // Voting system
    castVote: (targetId, voterId) => {
        const state = get()
        const votes = { ...state.suspicionVotes }

        if (!votes[targetId]) {
            votes[targetId] = new Set()
        }
        votes[targetId] = new Set(votes[targetId]) // clone
        votes[targetId].add(voterId)

        const voteCount = votes[targetId].size

        // Update the vote count on the node data for display
        const nodes = state.nodes.map(n =>
            n.id === targetId ? { ...n, data: { ...n.data, votes: voteCount } } : n
        )

        set({ suspicionVotes: votes, nodes })

        // Check threshold
        if (voteCount >= VOTE_THRESHOLD) {
            // Isolate the node
            get().isolateNode(targetId)
        }
    },

    isolateNode: (id) => {
        const state = get()
        // Change status to isolated
        const nodes = state.nodes.map(n =>
            n.id === id ? { ...n, data: { ...n.data, status: "isolated" } } : n
        )
        // Remove ALL edges connected to this node
        const edges = state.edges.filter(e => e.source !== id && e.target !== id)

        set({ nodes, edges })

        get().addLogEntry(
            `⛔ ${id} ISOLATED — all communication dropped`,
            "isolation"
        )
    },

    // Event log
    addLogEntry: (message, type = "info") => {
        const state = get()
        const elapsed = state.startTime
            ? Math.floor((Date.now() - state.startTime) / 1000)
            : 0
        const mins = String(Math.floor(elapsed / 60)).padStart(2, "0")
        const secs = String(elapsed % 60).padStart(2, "0")

        set((s) => ({
            eventLog: [
                ...s.eventLog,
                { time: `${mins}:${secs}`, message, type }
            ].slice(-100) // Keep last 100 entries
        }))
    },

    // Reset everything
    resetSimulation: () => {
        const { intervalId } = get()
        if (intervalId) clearInterval(intervalId)
        set({
            nodes: generateInitialNodes(),
            edges: [],
            intervalId: null,
            suspicionVotes: {},
            eventLog: [],
            startTime: null,
        })
    },
}))
