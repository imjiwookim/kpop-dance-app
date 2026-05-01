import { useState } from "react";
import SongSelect from "./components/SongSelect";
import WebcamCapture from "./components/WebcamCapture";
import ReportView from "./components/ReportView";

function App() {
  const [mode, setMode] = useState("select");
  const [selectedSong, setSelectedSong] = useState(null);
  const [dtwResult, setDtwResult] = useState(null);

  const handleSongSelect = (song) => {
    setSelectedSong(song);
    setMode("practice");
  };

  const handleFinish = (result) => {
    setDtwResult(result);
    setMode("report");
  };

  const handleBack = () => {
    setMode("select");
    setSelectedSong(null);
    setDtwResult(null);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fdf6f0" }}>

      {/* 왼쪽 사이드바 */}
      <div style={{
        width: "220px",
        background: "linear-gradient(180deg, #f3e8ff 0%, #fce7f3 100%)",
        borderRight: "1px solid #e9d5ff",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        gap: "8px",
        boxShadow: "2px 0 8px rgba(168, 85, 247, 0.08)",
      }}>

        {/* 로고 */}
        <div style={{ marginBottom: "32px", padding: "0 8px" }}>
          <p style={{ fontSize: "11px", color: "#a855f7", fontWeight: "600", margin: "0 0 4px", letterSpacing: "2px" }}>
            K-POP DANCE
          </p>
          <h1 style={{ fontSize: "18px", color: "#6b21a8", margin: 0, fontWeight: "800" }}>
            안무 학습 시스템
          </h1>
        </div>

        <p style={{ fontSize: "11px", color: "#c084fc", margin: "0 0 8px 8px", letterSpacing: "1px" }}>MENU</p>

        <button onClick={handleBack} style={sidebarBtn(mode === "select")}>
          🏠 곡 선택
        </button>
        <button
          onClick={() => selectedSong && setMode("practice")}
          style={sidebarBtn(mode === "practice", !selectedSong)}
        >
          🎮 연습 모드
        </button>
        <button
          onClick={() => dtwResult && setMode("report")}
          style={sidebarBtn(mode === "report", !dtwResult)}
        >
          📊 리포트
        </button>

        {/* 선택된 곡 표시 */}
        {selectedSong && (
          <div style={{
            marginTop: "auto",
            padding: "12px",
            background: "rgba(168, 85, 247, 0.1)",
            borderRadius: "12px",
            border: "1px solid #e9d5ff",
          }}>
            <p style={{ fontSize: "10px", color: "#a855f7", margin: "0 0 4px", letterSpacing: "1px" }}>NOW PLAYING</p>
            <p style={{ fontSize: "13px", color: "#6b21a8", fontWeight: "700", margin: 0 }}>
              {selectedSong.dance_id}
            </p>
          </div>
        )}
      </div>

      {/* 메인 화면 */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {mode === "select" && <SongSelect onSelect={handleSongSelect} />}
        {mode === "practice" && (
          <WebcamCapture
            song={selectedSong}
            onFinish={handleFinish}
          />
        )}
        {mode === "report" && <ReportView dtwResult={dtwResult} />}
      </div>
    </div>
  );
}

function sidebarBtn(active, disabled = false) {
  return {
    padding: "12px 16px",
    background: active ? "linear-gradient(135deg, #a855f7, #ec4899)" : "transparent",
    color: active ? "white" : "#7c3aed",
    border: "none",
    borderRadius: "12px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "14px",
    fontWeight: active ? "700" : "500",
    textAlign: "left",
    opacity: disabled ? 0.4 : 1,
    transition: "all 0.2s",
    boxShadow: active ? "0 4px 12px rgba(168, 85, 247, 0.3)" : "none",
  };
}

export default App;