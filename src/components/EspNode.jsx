import React, { memo } from "react"
import { Handle, Position } from "reactflow"

const STATUS_CONFIG = {
    alive: { main: "#4CAF50", border: "#2E7D32", label: "ALIVE", ringColor: "#81C784" },
    byzantine: { main: "#F44336", border: "#B71C1C", label: "BYZANTINE", ringColor: "#E57373" },
    suspected: { main: "#FF9800", border: "#E65100", label: "SUSPECTED", ringColor: "#FFB74D" },
    isolated: { main: "#880E4F", border: "#4A0028", label: "ISOLATED", ringColor: "transparent" },
    dead: { main: "#9E9E9E", border: "#616161", label: "DEAD", ringColor: "transparent" },
}

const EspNode = ({ data }) => {
    const { label, value, status, tick, votes } = data
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.alive

    const radius = 45
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference - (tick / 100) * circumference

    const isActive = status !== "dead" && status !== "isolated"

    return (
        <div style={{ position: "relative", width: 120, height: 130 }}>
            <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />
            <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} />

            {/* Vote badge */}
            {votes > 0 && status !== "isolated" && (
                <div
                    style={{
                        position: "absolute",
                        top: -5,
                        right: 5,
                        background: "#FF5722",
                        color: "white",
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        zIndex: 10,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                >
                    {votes}/3
                </div>
            )}

            {/* SVG Timer Ring */}
            <svg width="110" height="110" style={{ position: "absolute", top: 0, left: 5 }}>
                {/* Background track */}
                <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    stroke="#e0e0e0"
                    strokeWidth="4"
                    fill="none"
                    opacity="0.3"
                />
                {/* Progressive ring */}
                {isActive && (
                    <circle
                        cx="55"
                        cy="55"
                        r={radius}
                        stroke={config.ringColor}
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        transform="rotate(-90 55 55)"
                        style={{ transition: "stroke-dashoffset 0.1s linear" }}
                    />
                )}
            </svg>

            {/* Main node circle */}
            <div
                style={{
                    position: "absolute",
                    top: 13,
                    left: 18,
                    width: 84,
                    height: 84,
                    borderRadius: "50%",
                    background: config.main,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `3px solid ${config.border}`,
                    boxShadow: `0 4px 12px rgba(0,0,0,0.2)`,
                    color: "white",
                    fontFamily: "'Segoe UI', sans-serif",
                    transition: "background 0.3s ease, border-color 0.3s ease",
                    opacity: status === "isolated" ? 0.6 : 1,
                }}
            >
                {status === "isolated" ? (
                    <div style={{ fontSize: "1.8rem" }}>❌</div>
                ) : (
                    <div style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                        {Math.round(value)}
                    </div>
                )}
                <div style={{ fontSize: "0.75rem", fontWeight: "600", opacity: 0.95 }}>
                    {label}
                </div>
            </div>

            {/* Status label below the node */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    textAlign: "center",
                    fontSize: "0.6rem",
                    fontWeight: "bold",
                    letterSpacing: "0.5px",
                    color: config.main,
                    fontFamily: "'Segoe UI', sans-serif",
                    textShadow: "0 0 4px rgba(0,0,0,0.5)",
                }}
            >
                {config.label}
            </div>
        </div>
    )
}

export default memo(EspNode)
