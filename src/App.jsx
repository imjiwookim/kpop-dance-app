import { useState } from "react";
import SongSelect from "./components/SongSelect";
import WebcamCapture from "./components/WebcamCapture";
import ReportView from "./components/ReportView";

function App() {
  const [mode, setMode] = useState("select");
  const [selectedSong, setSelectedSong] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const handleSongSelect = (song) => {
    setSelectedSong(song);
    setMode("practice");
  };

  const handleFinish = () => {
    setSessionId("test-session-1");
    setMode("report");
  };

  const handleBack = () => {
    setMode("select");
    setSelectedSong(null);
    setSessionId(null);
  };

  return (
    <div style={{ background: "#111", minHeight: "100vh", color: "white" }}>

      {/* 상단 네비게이션 */}
      <div style={{
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #333",
      }}>
        <h1 style={{ fontSize: "20px", margin: 0 }}>🎵 K-POP 안무 학습 시스템</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={handleBack} style={btnStyle(mode === "select")}>곡 선택</button>
          <button
            onClick={() => selectedSong && setMode("practice")}
            style={btnStyle(mode === "practice", !selectedSong)}
          >연습 모드</button>
          <button
            onClick={handleFinish}
            style={btnStyle(mode === "report", !selectedSong)}
          >리포트</button>
        </div>
      </div>

      {/* 선택된 곡 표시 */}
      {selectedSong && mode === "practice" && (
        <p style={{ textAlign: "center", color: "#6366f1", margin: "8px 0 0", fontSize: "14px" }}>
          🎵 {selectedSong.dance_id}
        </p>
      )}

      {/* 화면 전환 */}
      {mode === "select" && <SongSelect onSelect={handleSongSelect} />}
      {mode === "practice" && <WebcamCapture song={selectedSong} />}
      {mode === "report" && <ReportView sessionId={sessionId} />}
    </div>
  );
}

function btnStyle(active, disabled = false) {
  return {
    padding: "8px 16px",
    background: active ? "#6366f1" : "#333",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "14px",
    opacity: disabled ? 0.5 : 1,
  };
}

export default App;