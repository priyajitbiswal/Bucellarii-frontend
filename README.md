# Bucellarii — Frontend Simulation Module

> **SWIM-BFT Visualization** — An interactive, browser-based simulation of a Byzantine-fault-tolerant IoT swarm

---

## Overview

This is a pure frontend visualization module for **Project Bucellarii**. It demonstrates how a distributed network of 5 ESP32 nodes communicates using SWIM-style gossip with Byzantine fault tolerance — entirely in the browser, with no backend or hardware dependency.

The simulation models the three-layer Bucellarii architecture:

| Layer | Real System | Simulation |
|---|---|---|
| **Finger** (ESP32 Nodes) | Sensors, gossip via ESP-NOW | 5 circular nodes exchanging values |
| **Brain** (Gateway) | Vote counting, firewall | Automatic anomaly detection & voting |
| **Government** (Cloud) | Kill switch, Raft consensus | Isolation upon vote threshold |

---

## Features

### Node Visualization
- **5 nodes** (S1–S5) arranged in a circular topology
- Each node displays a **numeric value** (simulated temperature) and **label**
- **Circular timer ring** shows the gossip cycle clock (fills and resets every ~5 seconds)
- Status-based coloring:

| Status | Color | Behavior |
|---|---|---|
| 🟢 **Alive** | Green | Normal gossip & value convergence |
| 🔴 **Byzantine** | Red | Sends malicious value (999) |
| 🟠 **Suspected** | Orange | Network detected anomaly, voting in progress |
| ⛔ **Isolated** | Dark Red + ❌ | Communication dropped after 3 votes |
| ⚫ **Dead** | Grey | No participation |

### Byzantine Detection Pipeline
1. User injects a **Byzantine** fault on a node
2. The node starts sending malicious data (value `999`)
3. Neighboring nodes **detect the anomaly** during gossip
4. Each detecting node **casts a SUSPECT vote**
5. When **3 votes** are reached → the node is **ISOLATED** (all edges dropped)

### Interactive Controls
- **▶ Start / ⏹ Stop** — Toggle the simulation
- **↻ Reset** — Restore all nodes to initial state
- **Fault Injection** — Set any node to Alive, Byzantine, or Dead

### Real-Time Event Log
A scrolling network log panel shows every event as it happens:
- 💬 Gossip exchanges with values
- 🔍 Anomaly detections
- 🗳️ Votes cast (with running count)
- ⛔ Isolation events

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)

### Install & Run

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Quick Walkthrough

1. Click **▶ Start** — nodes begin gossiping, values converge (~20-25 range)
2. Click **Byz** next to S1 — S1 turns red and starts sending `999`
3. Watch the **Event Log** — other nodes detect the anomaly and vote
4. After 3 votes — S1 is **isolated** with ❌, all edges dropped
5. Click **Alive** on S1 — it revives and rejoins the network
6. Click **Dead** on S2 — it turns grey and stops participating
7. Click **↻ Reset** to start fresh

---

## Architecture

```
src/
├── App.jsx                  # Root layout
├── main.jsx                 # React entry point
├── index.css                # Global styles
├── swarmStore.js            # Zustand store (nodes, edges, votes, event log)
├── swimEngine.js            # Simulation engine (gossip loop, detection, voting)
└── components/
    ├── SwarmCanvas.jsx      # ReactFlow graph canvas (fullscreen)
    ├── EspNode.jsx          # Custom node renderer (SVG ring + status colors)
    ├── Controls.jsx         # Control panel (top-left overlay)
    └── EventLog.jsx         # Network log panel (top-right overlay)
```

### Key Modules

| Module | Responsibility |
|---|---|
| `swarmStore.js` | Global state via Zustand — nodes, edges, suspicion votes, event log |
| `swimEngine.js` | Simulation loop — tick management, gossip initiation, anomaly detection, vote casting, isolation |
| `EspNode.jsx` | Visual rendering — 5 status states, timer ring, vote badge |
| `EventLog.jsx` | Real-time scrolling log with color-coded entries |

---

## Technology Stack

| Technology | Purpose |
|---|---|
| [React](https://react.dev/) (Vite) | UI framework |
| [ReactFlow](https://reactflow.dev/) | Graph rendering & edge animation |
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight state management |
| SVG | Timer ring animation (`strokeDashoffset`) |

---

## Simulation Parameters

| Parameter | Value |
|---|---|
| Tick rate | 50ms (20 ticks/second) |
| Gossip cycle | 100 ticks (~5 seconds) |
| Edge animation | 800ms |
| Vote threshold | 3 votes to isolate |
| Byzantine value | 999 |
| Normal convergence rate | 20% per exchange |
| Byzantine resistance | 1% drift (anomaly detected) |

---

## Important Notes

- This is a **conceptual simulation** for educational and presentation purposes
- It is **not** a protocol-accurate SWIM implementation
- No backend, no real networking — pure client-side
- Part of the larger [Project Bucellarii](../PROJECT.md) systems-engineering effort
