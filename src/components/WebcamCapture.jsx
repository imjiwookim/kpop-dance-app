import { useRef, useEffect, useState } from "react";
import { useMediaPipe } from "../hooks/useMediaPipe";

const BASE_URL = "http://localhost:8000";
const WS_URL = "ws://localhost:8000";
const WINDOW_SIZE = 15;

function WebcamCapture({ song }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const referenceVideoRef = useRef(null);
  const wsRef = useRef(null);
  const windowBufferRef = useRef([]);
  const frameIdxRef = useRef(0);

  const [error, setError] = useState(null);
  const [score, setScore] = useState(null);
  const [parts, setParts] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const { landmarks } = useMediaPipe(videoRef, canvasRef);

  useEffect(() => {
    if (!song?.dance_id) return;
    const readyDance = async () => {
      try {
        const response = await fetch(`${BASE_URL}/dances/${song.dance_id}/ready`);
        if (!response.ok) throw new Error("댄스 준비 실패");
        const data = await response.json();
        setVideoUrl(`${BASE_URL}${data.video_url}`);
        setIsReady(true);
      } catch (err) {
        setError(err.message);
      }
    };
    readyDance();
  }, [song]);

  useEffect(() => {
    if (!isReady || !song?.dance_id) return;
    const ws = new WebSocket(`${WS_URL}/ws/similarity/${song.dance_id}`);
    wsRef.current = ws;
    ws.onopen = () => console.log("WebSocket 연결됨");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("받은 데이터:", data);
      if (data.similarity !== null) {
        setScore(Math.round(data.similarity * 100));
        setParts(data.parts);
      }
    };
    ws.onerror = (err) => console.error("WebSocket 오류:", err);
    ws.onclose = () => console.log("WebSocket 종료");
    return () => ws.close();
  }, [isReady, song]);

  useEffect(() => {
    if (!landmarks || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const currentTime = referenceVideoRef.current?.currentTime ?? 0;
    const frame = {
      landmarks: landmarks.map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility,
      })),
      timestamp: currentTime,
      frame_idx: frameIdxRef.current++,
    };
    windowBufferRef.current.push(frame);
    if (windowBufferRef.current.length >= WINDOW_SIZE) {
      const payload = {
        window: windowBufferRef.current,
        current_timestamp: currentTime,
      };
      wsRef.current.send(JSON.stringify(payload));
      windowBufferRef.current = [];
    }
  }, [landmarks]);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setError("웹캠을 찾을 수 없습니다.");
      }
    };
    startWebcam();
    return () => {
      if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const getScoreColor = (s) => {
    if (s >= 80) return "#16a34a";
    if (s >= 50) return "#ea580c";
    return "#dc2626";
  };

  return (
    <div style={{ color: "#3b1f6e", padding: "10px 20px" }}>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {score !== null ? (
        <div style={{ textAlign: "center", margin: "8px 0" }}>
          <p style={{ color: getScoreColor(score), fontSize: "28px", fontWeight: "bold", margin: 0 }}>
            유사도: {score}점
          </p>
          {parts && (
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "8px" }}>
              {Object.entries(parts).map(([part, value]) => (
                <div key={part} style={{ padding: "4px 10px", background: getScoreColor(Math.round(value * 100)), borderRadius: "6px", fontSize: "12px", fontWeight: "bold", color: "white" }}>
                  {part === "left_arm" ? "왼팔" : part === "right_arm" ? "오른팔" : part === "left_leg" ? "왼다리" : "오른다리"}: {Math.round(value * 100)}점
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: "gray", textAlign: "center", margin: "8px 0" }}>⏳ 연결 중...</p>
      )}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <div style={{ width: "480px" }}>
          <p style={{ textAlign: "center", color: "gray", marginBottom: "6px", fontSize: "13px" }}>🎬 정답 안무</p>
          <video ref={referenceVideoRef} src={videoUrl} controls autoPlay style={{ width: "480px", height: "480px", background: "#000", borderRadius: "10px", objectFit: "contain", display: "block" }} />
        </div>
        <div style={{ width: "480px" }}>
          <p style={{ textAlign: "center", color: "gray", marginBottom: "6px", fontSize: "13px" }}>🎥 내 동작</p>
          <div style={{ position: "relative", width: "480px", height: "480px", overflow: "hidden", borderRadius: "10px" }}>
            <video ref={videoRef} autoPlay playsInline style={{ position: "absolute", width: "480px", height: "480px", objectFit: "cover", background: "#000", transform: "scaleX(-1)" }} />
            <canvas ref={canvasRef} style={{ position: "absolute", width: "480px", height: "480px", transform: "scaleX(-1)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebcamCapture;