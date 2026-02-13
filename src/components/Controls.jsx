import { useSwarmStore } from "../swarmStore"
import { startSimulation, stopSimulation } from "../swimEngine"

export default function Controls() {
    const nodes = useSwarmStore(state => state.nodes)
    const setStatus = useSwarmStore(state => state.setStatus)
    const resetSimulation = useSwarmStore(state => state.resetSimulation)
    const intervalId = useSwarmStore(state => state.intervalId)

    const isRunning = intervalId !== null

    return (
        <div
            style={{
                position: "absolute",
                top: 20,
                left: 20,
                zIndex: 100,
                background: "rgba(18, 18, 24, 0.92)",
                padding: "20px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                color: "#E0E0E0",
                maxHeight: "90vh",
                overflowY: "auto",
                fontFamily: "'Segoe UI', sans-serif",
                minWidth: "260px",
            }}
        >
            {/* Title */}
            <div
                style={{
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    color: "#90CAF9",
                    letterSpacing: "1px",
                    marginBottom: "15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                }}
            >
                <span>⚙️</span> CONTROL PANEL
            </div>

            {/* Simulation controls */}
            <div style={{ display: "flex", gap: "8px", marginBottom: 20 }}>
                <button
                    onClick={isRunning ? stopSimulation : startSimulation}
                    style={{
                        flex: 1,
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        background: isRunning ? "#F44336" : "#4CAF50",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                    }}
                >
                    {isRunning ? "⏹ Stop" : "▶ Start"}
                </button>
                <button
                    onClick={() => {
                        stopSimulation()
                        resetSimulation()
                    }}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "1px solid rgba(255,255,255,0.2)",
                        background: "transparent",
                        color: "#B0BEC5",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                    }}
                >
                    ↻ Reset
                </button>
            </div>

            {/* Fault injection */}
            <div
                style={{
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    color: "#90CAF9",
                    letterSpacing: "0.5px",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                }}
            >
                Inject Faults
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {nodes.map(n => (
                    <div
                        key={n.id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "4px 0",
                        }}
                    >
                        <span
                            style={{
                                fontWeight: "bold",
                                width: "35px",
                                fontSize: "0.85rem",
                                color: "#FFF",
                            }}
                        >
                            {n.id}
                        </span>
                        <div style={{ display: "flex", gap: "4px" }}>
                            {["alive", "byzantine", "dead"].map(s => {
                                const colors = {
                                    alive: { bg: "#4CAF50", activeBg: "#4CAF50" },
                                    byzantine: { bg: "#F44336", activeBg: "#F44336" },
                                    dead: { bg: "#9E9E9E", activeBg: "#9E9E9E" },
                                }
                                const isActive =
                                    n.data.status === s ||
                                    (s === "byzantine" && n.data.status === "suspected") ||
                                    (s === "byzantine" && n.data.status === "isolated")
                                const labels = {
                                    alive: "Alive",
                                    byzantine: "Byz",
                                    dead: "Dead",
                                }

                                return (
                                    <button
                                        key={s}
                                        onClick={() => setStatus(n.id, s)}
                                        style={{
                                            padding: "3px 10px",
                                            fontSize: "0.75rem",
                                            borderRadius: "4px",
                                            border: isActive
                                                ? `2px solid ${colors[s].activeBg}`
                                                : "1px solid rgba(255,255,255,0.15)",
                                            background: isActive
                                                ? colors[s].activeBg
                                                : "rgba(255,255,255,0.05)",
                                            color: isActive ? "white" : "#999",
                                            cursor: "pointer",
                                            fontWeight: isActive ? "bold" : "normal",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        {labels[s]}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div
                style={{
                    marginTop: "20px",
                    paddingTop: "15px",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "0.65rem",
                    color: "#78909C",
                    lineHeight: "1.8",
                }}
            >
                <div style={{ fontWeight: "bold", marginBottom: "4px", color: "#90CAF9" }}>
                    STATUS LEGEND
                </div>
                <div>🟢 Alive — Normal gossip</div>
                <div>🔴 Byzantine — Sends malicious data</div>
                <div>🟠 Suspected — Under investigation</div>
                <div>⛔ Isolated — Communication dropped</div>
                <div>⚫ Dead — No participation</div>
            </div>
        </div>
    )
}
