import { useEffect, useRef, useState } from "react";
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

// 실험할 모델을 여기서 변경하세요: "lite" | "full" | "heavy"
export const CURRENT_MODEL = "full";

const MODEL_CONFIGS = {
  lite: {
    label: "Lite",
    path: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
  },
  full: {
    label: "Full",
    path: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
  },
  heavy: {
    label: "Heavy",
    path: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task",
  },
};

export function useMediaPipe(videoRef, canvasRef) {
  const poseLandmarkerRef = useRef(null);
  const [landmarks, setLandmarks] = useState(null);
  const animFrameRef = useRef(null);

  // FPS 측정용
  const [fps, setFps] = useState(0);
  const fpsFrameCountRef = useRef(0);
  const fpsLastTimeRef = useRef(performance.now());

  useEffect(() => {
    const selectedModel = MODEL_CONFIGS[CURRENT_MODEL];

    const init = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
      );

      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: selectedModel.path,
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      detect();
    };

    const detect = () => {
      if (!videoRef.current || !canvasRef.current || !poseLandmarkerRef.current) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const result = poseLandmarkerRef.current.detectForVideo(video, performance.now());

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (result.landmarks.length > 0) {
        const original = result.landmarks[0];

        const raw = original.map((lm) => {
          // 1. 기본값은 잘 보인다고 가정 (1.0)
          let simulatedScore = 1.0;

          // 2. [방법 1] X나 Y 좌표가 화면 끝(상하좌우 3% 경계선 영역)으로 나가면 0.0으로 강제 변경
          if (lm.x < 0.03 || lm.x > 0.97 || lm.y < 0.03 || lm.y > 0.97) {
            simulatedScore = 0.0;
          }

          return {
            x: 1 - lm.x,
            y: lm.y,
            z: lm.z,
            visibility: simulatedScore, 
          };
        });

        setLandmarks(raw);

        // ── 실시간 데이터 가시성 검증용 표(Table) 콘솔 출력 ──
        if (fpsFrameCountRef.current === 1) {
          console.clear();
          console.log(`📊 [현재 모델: ${MODEL_CONFIGS[CURRENT_MODEL].label}] 주요 관절 데이터`);

          const targetIndices = {
            0: "코 (Nose)",
            11: "왼쪽 어깨 (L_Shoulder)",
            12: "오른쪽 어깨 (R_Shoulder)",
            15: "왼쪽 손목 (L_Wrist)",
            16: "오른쪽 손목 (R_Wrist)",
          };

          const logData = [];
          for (const [index, name] of Object.entries(targetIndices)) {
            if (raw[index]) {
              logData.push({
                "관절 이름": name,
                "X 좌표": raw[index].x.toFixed(3),
                "Y 좌표": raw[index].y.toFixed(3),
                "가시성 (Visibility)": raw[index].visibility.toFixed(3),
              });
            }
          }

          console.table(logData);
        }
        // ───────────────────────────────────────────────────

        const drawUtils = new DrawingUtils(ctx);
        drawUtils.drawLandmarks(original, { color: "#FF0000", radius: 4 });
        drawUtils.drawConnectors(original, PoseLandmarker.POSE_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 2,
        });
      }

      // FPS 계산
      fpsFrameCountRef.current += 1;
      const now = performance.now();
      const elapsed = now - fpsLastTimeRef.current;
      if (elapsed >= 1000) {
        setFps(Math.round((fpsFrameCountRef.current * 1000) / elapsed));
        fpsFrameCountRef.current = 0;
        fpsLastTimeRef.current = now;
      }

      animFrameRef.current = requestAnimationFrame(detect);
    };

    init();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return {
    landmarks,
    fps,
    modelLabel: MODEL_CONFIGS[CURRENT_MODEL].label,
  };
}