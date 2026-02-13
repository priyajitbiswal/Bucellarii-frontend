import SwarmCanvas from "./components/SwarmCanvas"
import ControlPanel from "./components/Controls"
import EventLog from "./components/EventLog"

export default function App() {
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <SwarmCanvas />
      <ControlPanel />
      <EventLog />
    </div>
  )
}
