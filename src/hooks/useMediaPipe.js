import { useEffect, useRef, useState } from "react";
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

export function useMediaPipe(videoRef, canvasRef) {
  const poseLandmarkerRef = useRef(null);
  const [landmarks, setLandmarks] = useState(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
      );

      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
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
        const raw = result.landmarks[0];
        setLandmarks(raw);

        // 관절 점 그리기
        const drawUtils = new DrawingUtils(ctx);
        drawUtils.drawLandmarks(raw, { color: "#FF0000", radius: 4 });
        drawUtils.drawConnectors(raw, PoseLandmarker.POSE_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 2,
        });
      }

      animFrameRef.current = requestAnimationFrame(detect);
    };

    init();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return { landmarks };
}