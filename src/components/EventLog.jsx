import { useRef, useEffect } from "react"
import { useSwarmStore } from "../swarmStore"

const LOG_COLORS = {
    system: "#90CAF9",
    gossip: "#A5D6A7",
    anomaly: "#FFB74D",
    vote: "#CE93D8",
    isolation: "#EF5350",
    info: "#B0BEC5",
}

export default function EventLog() {
    const eventLog = useSwarmStore(state => state.eventLog)
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [eventLog])

    return (
        <div
            style={{
                position: "absolute",
                top: 20,
                right: 20,
                width: 380,
                maxHeight: "85vh",
                zIndex: 100,
                background: "rgba(18, 18, 24, 0.92)",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                display: "flex",
                flexDirection: "column",
                fontFamily: "'Consolas', 'Courier New', monospace",
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    color: "#90CAF9",
                    letterSpacing: "1px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                }}
            >
                <span>📡</span> NETWORK LOG
            </div>

            {/* Log entries */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "8px 12px",
                    fontSize: "0.75rem",
                    lineHeight: "1.6",
                }}
            >
                {eventLog.length === 0 && (
                    <div style={{ color: "#616161", fontStyle: "italic", padding: "10px 0" }}>
                        Click "Start" to begin simulation...
                    </div>
                )}

                {eventLog.map((entry, i) => (
                    <div
                        key={i}
                        style={{
                            color: LOG_COLORS[entry.type] || LOG_COLORS.info,
                            padding: "2px 0",
                            borderBottom: entry.type === "isolation" ? "1px solid rgba(239,83,80,0.3)" : "none",
                        }}
                    >
                        <span style={{ color: "#616161", marginRight: "8px" }}>
                            [{entry.time}]
                        </span>
                        {entry.message}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    )
}
