import { useRef, useEffect, useState } from "react";
import { useMediaPipe } from "../hooks/useMediaPipe";

function WebcamCapture({ songId }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const referenceVideoRef = useRef(null);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(null);
  const [jointScores, setJointScores] = useState([]);

  const { landmarks } = useMediaPipe(videoRef, canvasRef);

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

  const getScoreColor = (s) => {
    if (s >= 80) return "green";
    if (s >= 50) return "orange";
    return "red";
  };

  const getVideoPath = (id) => {
    if (id === "love-dive") return "/LoveDive_IVE.mp4";
    return null;
  };

  return (
    <div style={{ color: "white", padding: "10px 20px" }}>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {/* 유사도 점수 */}
      {score !== null ? (
        <p style={{
          color: getScoreColor(score),
          fontSize: "28px",
          fontWeight: "bold",
          textAlign: "center",
          margin: "8px 0",
        }}>
          유사도: {score}점
        </p>
      ) : (
        <p style={{ color: "gray", textAlign: "center", margin: "8px 0" }}>
          ⏳ 팀원 API 연동 후 점수가 표시됩니다
        </p>
      )}

      {/* 영상 두 개 나란히 */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>

        {/* 정답 안무 */}
        <div style={{ width: "480px" }}>
          <p style={{ textAlign: "center", color: "gray", marginBottom: "6px", fontSize: "13px" }}>
            🎬 정답 안무
          </p>
          <video
            ref={referenceVideoRef}
            src={getVideoPath(songId)}
            controls
            autoPlay
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

        {/* 내 동작 */}
        <div style={{ width: "480px" }}>
          <p style={{ textAlign: "center", color: "gray", marginBottom: "6px", fontSize: "13px" }}>
            🎥 내 동작
          </p>
          <div style={{
            position: "relative",
            width: "480px",
            height: "480px",
            overflow: "hidden",
            borderRadius: "10px",
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                position: "absolute",
                width: "480px",
                height: "480px",
                objectFit: "cover",
                background: "#000",
                transform: "scaleX(-1)",
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                width: "480px",
                height: "480px",
                transform: "scaleX(-1)",
              }}
            />
          </div>
        </div>
      </div>

      {/* 관절별 점수 */}
      {jointScores.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "8px", fontSize: "14px" }}>관절별 점수</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
            {jointScores.map((j) => (
              <div key={j.index} style={{
                padding: "4px 8px",
                background: getScoreColor(j.score),
                borderRadius: "6px",
                color: "white",
                fontSize: "11px",
                fontWeight: "bold",
              }}>
                {j.index}번: {j.score}점
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WebcamCapture;