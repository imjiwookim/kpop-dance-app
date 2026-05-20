import { PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

// 부위별 관절 인덱스
const BODY_PART_INDICES = {
  left_arm:  [11, 13, 15, 17, 19, 21],
  right_arm: [12, 14, 16, 18, 20, 22],
  left_leg:  [23, 25, 27, 29, 31],
  right_leg: [24, 26, 28, 30, 32],
};

// 점수 → 색상
function getColorByScore(score) {
  if (score === null || score === undefined) return "#ef4444";
  const s = Math.round(score * 100);
  if (s >= 80) return "#22c55e"; // 초록
  if (s >= 50) return "#F1A519"; // 주황
  return "#ef4444";              // 빨강
}

// 관절 인덱스 → 부위 색상
function getJointColor(index, parts) {
  if (!parts) return "#ef4444";
  for (const [part, indices] of Object.entries(BODY_PART_INDICES)) {
    if (indices.includes(index)) {
      return getColorByScore(parts[part]);
    }
  }
  return "#94a3b8"; // 얼굴 등 부위 미분류 관절 → 회색
}

/**
 * drawOverlay
 * requestAnimationFrame 루프 안에서 직접 호출하는 순수 함수
 *
 * @param {CanvasRenderingContext2D} ctx      - 캔버스 컨텍스트
 * @param {Array}                   original - MediaPipe 원본 landmarks (반전 전)
 * @param {Object|null}             parts    - 부위별 점수 { left_arm, right_arm, ... }
 */
export function drawOverlay(ctx, original, parts) {
  const drawUtils = new DrawingUtils(ctx);

  // 연결선 (반투명 흰색)
  drawUtils.drawConnectors(original, PoseLandmarker.POSE_CONNECTIONS, {
    color: "#FFFFFF60",
    lineWidth: 2,
  });

  // 관절 점 (부위별 색상)
  original.forEach((lm, i) => {
    const color = getJointColor(i, parts);
    drawUtils.drawLandmarks([lm], {
      color,
      fillColor: color,
      radius: 5,
    });
  });
}