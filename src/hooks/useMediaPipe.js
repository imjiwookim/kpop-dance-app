import { useEffect, useRef, useState } from "react";
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import { drawOverlay } from "./useOverlay";

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
  const partsRef = useRef(null);

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
        const worldOriginal = result.worldLandmarks?.[0];

        const raw = original.map((lm, index) => {
          const vScore = lm.visibility ?? worldOriginal?.[index]?.visibility ?? 1.0;
          const simulatedScore =
            lm.x < 0.03 || lm.x > 0.97 || lm.y < 0.03 || lm.y > 0.97
              ? 0.0
              : vScore;
          return {
            x: 1 - lm.x,
            y: lm.y,
            z: lm.z,
            visibility: simulatedScore,
          };
        });

        setLandmarks(raw);

        // ── useOverlay의 drawOverlay 함수 호출 ───────────────────
        drawOverlay(ctx, original, partsRef.current);
        // ─────────────────────────────────────────────────────────
      }

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
    partsRef,
    fps,
    modelLabel: MODEL_CONFIGS[CURRENT_MODEL].label,
  };
}