import { Routes, Route } from "react-router-dom";
import "./App.css";
import Dashboard from "./screens/Dashboard";
import PreviewPage from "./screens/Preview";
import RoomPage from "./screens/Room";
import Settings from "./screens/Settings";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/preview/:roomCode" element={<PreviewPage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}

export default App;
