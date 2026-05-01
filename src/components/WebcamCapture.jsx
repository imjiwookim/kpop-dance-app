import { useRef, useEffect, useState } from "react";
import { useMediaPipe } from "../hooks/useMediaPipe";

const BASE_URL = "http://localhost:8000";
const WS_URL = "ws://localhost:8000";
const WINDOW_SIZE = 15;

function WebcamCapture({ song, onFinish }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const referenceVideoRef = useRef(null);
  const wsRef = useRef(null);
  const windowBufferRef = useRef([]);
  const frameIdxRef = useRef(0);
  const userFramesRef = useRef([]);

  const [error, setError] = useState(null);
  const [score, setScore] = useState(null);
  const [parts, setParts] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { landmarks } = useMediaPipe(videoRef, canvasRef);

  // 1. 댄스 준비 API 호출
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

  // 2. WebSocket 연결
  useEffect(() => {
    if (!isReady || !song?.dance_id) return;

    const ws = new WebSocket(`${WS_URL}/ws/similarity/${song.dance_id}`);
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket 연결됨");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.similarity !== null) {
        setScore(Math.round(data.similarity * 100));
        setParts(data.parts);
      }
    };

    ws.onerror = (err) => console.error("WebSocket 오류:", err);
    ws.onclose = () => console.log("WebSocket 종료");

    return () => ws.close();
  }, [isReady, song]);

  // 3. 관절 좌표 전송 + 저장
  useEffect(() => {
    if (!landmarks) return;

    const currentTime = referenceVideoRef.current?.currentTime ?? 0;
    const frame = {
      frame_idx: frameIdxRef.current,
      timestamp_sec: currentTime,
      landmarks: landmarks.map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility ?? 1.0,
      })),
    };

    if (isRecording) {
      userFramesRef.current.push(frame);
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      windowBufferRef.current.push(frame);
      if (windowBufferRef.current.length >= WINDOW_SIZE) {
        const payload = {
          window: windowBufferRef.current,
          current_timestamp: currentTime,
        };
        wsRef.current.send(JSON.stringify(payload));
        windowBufferRef.current = [];
      }
    }

    frameIdxRef.current++;
  }, [landmarks, isRecording]);

  // 웹캠 시작
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("웹캠을 찾을 수 없습니다.");
      }
    };
    startWebcam();
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // 연습 시작
  const handleStart = () => {
    userFramesRef.current = [];
    frameIdxRef.current = 0;
    setIsRecording(true);
    if (referenceVideoRef.current) {
      referenceVideoRef.current.currentTime = 0;
      referenceVideoRef.current.play();
    }
  };

  // 연습 종료 → DTW API 전송
  const handleStop = async () => {
    setIsRecording(false);
    setIsAnalyzing(true);
    if (referenceVideoRef.current) {
      referenceVideoRef.current.pause();
    }

    if (userFramesRef.current.length === 0) {
      setIsAnalyzing(false);
      return;
    }

    const userJson = {
      video_id: "user_recording",
      fps: 30,
      total_frames: userFramesRef.current.length,
      duration_sec: userFramesRef.current[userFramesRef.current.length - 1]?.timestamp_sec ?? 0,
      frames: userFramesRef.current,
    };

    const formData = new FormData();
    const userBlob = new Blob([JSON.stringify(userJson)], { type: "application/json" });
    formData.append("dance_id", song.dance_id);
    formData.append("user_json", userBlob, "user_pose.json");
    formData.append("distance_metric", "l2");
    formData.append("top_n", "3");

    try {
      const response = await fetch(`${BASE_URL}/api/v1/dtw/analyze`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("DTW 결과:", result);
      if (onFinish) onFinish(result);
    } catch (err) {
      console.error("DTW 분석 실패:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (s) => {
    if (s >= 80) return "#22c55e";
    if (s >= 50) return "#f97316";
    return "#ef4444";
  };

  return (
    <div style={{ color: "#3b1f6e", padding: "10px 20px" }}>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* 유사도 점수 */}
      {score !== null ? (
        <div style={{ textAlign: "center", margin: "8px 0" }}>
          <p style={{ color: getScoreColor(score), fontSize: "28px", fontWeight: "bold", margin: 0 }}>
            유사도: {score}점
          </p>
          {parts && (
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "8px" }}>
              {Object.entries(parts).map(([part, value]) => (
                <div key={part} style={{
                  padding: "4px 10px",
                  background: getScoreColor(Math.round(value * 100)),
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "white",
                }}>
                  {part === "left_arm" ? "왼팔" :
                   part === "right_arm" ? "오른팔" :
                   part === "left_leg" ? "왼다리" :
                   part === "right_leg" ? "오른다리" : part}
                  : {Math.round(value * 100)}점
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: "gray", textAlign: "center", margin: "8px 0" }}>⏳ 연결 중...</p>
      )}

      {/* 분석 중 표시 */}
      {isAnalyzing && (
        <p style={{ color: "#a855f7", textAlign: "center", fontWeight: "bold" }}>
          🔄 DTW 분석 중... 잠시 기다려주세요
        </p>
      )}

      {/* 시작/종료 버튼 */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "10px" }}>
        <button
          onClick={handleStart}
          disabled={isRecording}
          style={{
            padding: "10px 24px",
            background: isRecording ? "#ccc" : "linear-gradient(135deg, #a855f7, #ec4899)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: isRecording ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          ▶ 연습 시작
        </button>
        <button
          onClick={handleStop}
          disabled={!isRecording}
          style={{
            padding: "10px 24px",
            background: !isRecording ? "#ccc" : "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: !isRecording ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          ■ 연습 종료
        </button>
        {isRecording && (
          <span style={{ color: "#ef4444", fontWeight: "bold", alignSelf: "center" }}>
            🔴 녹화 중...
          </span>
        )}
      </div>

      {/* 영상 두 개 나란히 */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <div style={{ width: "480px" }}>
          <p style={{ textAlign: "center", color: "gray", marginBottom: "6px", fontSize: "13px" }}>🎬 정답 안무</p>
          <video
            ref={referenceVideoRef}
            src={videoUrl}
            controls
            style={{
              width: "480px",
              height: "480px",
              background: "#000",
              borderRadius: "10px",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        <div style={{ width: "480px" }}>
          <p style={{ textAlign: "center", color: "gray", marginBottom: "6px", fontSize: "13px" }}>🎥 내 동작</p>
          <div style={{ position: "relative", width: "480px", height: "480px", overflow: "hidden", borderRadius: "10px" }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ position: "absolute", width: "480px", height: "480px", objectFit: "cover", background: "#000", transform: "scaleX(-1)" }}
            />
            <canvas
              ref={canvasRef}
              style={{ position: "absolute", width: "480px", height: "480px", transform: "scaleX(-1)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default WebcamCapture;