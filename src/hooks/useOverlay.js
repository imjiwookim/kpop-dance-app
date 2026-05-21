import { PoseLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

const BODY_PART_INDICES = {
  left_arm:  [11, 13, 15, 17, 19, 21],
  right_arm: [12, 14, 16, 18, 20, 22],
  left_leg:  [23, 25, 27, 29, 31],
  right_leg: [24, 26, 28, 30, 32],
};

function getColorByScore(score) {
  if (score === null || score === undefined) return "#ef4444";
  const s = Math.round(score * 100);
  if (s >= 80) return "#22c55e";
  if (s >= 50) return "#F1A519";
  return "#ef4444";
}

function getLabelByScore(score) {
  if (score === null || score === undefined) return "Bad";
  const s = Math.round(score * 100);
  if (s >= 80) return "Perfect";
  if (s >= 50) return "Good";
  return "Bad";
}

function getBgColorByScore(score) {
  if (score === null || score === undefined) return "rgba(239,68,68,0.25)";
  const s = Math.round(score * 100);
  if (s >= 80) return "rgba(34,197,94,0.25)";
  if (s >= 50) return "rgba(241,165,25,0.25)";
  return "rgba(239,68,68,0.25)";
}

function getJointColor(index, parts) {
  if (!parts) return "#ef4444";
  for (const [part, indices] of Object.entries(BODY_PART_INDICES)) {
    if (indices.includes(index)) {
      return getColorByScore(parts[part]);
    }
  }
  return "#94a3b8";
}

function getPartCenter(original, indices, canvasWidth, canvasHeight) {
  const validLms = indices
    .map((i) => original[i])
    .filter((lm) => lm && lm.x > 0.03 && lm.x < 0.97 && lm.y > 0.03 && lm.y < 0.97);

  if (validLms.length === 0) return null;

  const avgX = validLms.reduce((sum, lm) => sum + lm.x, 0) / validLms.length;
  const avgY = validLms.reduce((sum, lm) => sum + lm.y, 0) / validLms.length;

  return {
    x: avgX * canvasWidth,
    y: avgY * canvasHeight,
  };
}

export function drawOverlay(ctx, original, parts) {
  const drawUtils = new DrawingUtils(ctx);
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  // ── 1. 부위별 반투명 오버레이 ───────────────────────────────
  if (parts) {
    for (const [part, indices] of Object.entries(BODY_PART_INDICES)) {
      const score = parts[part];
      const bgColor = getBgColorByScore(score);
      const textColor = getColorByScore(score);
      const label = getLabelByScore(score);

      const validLms = indices
        .map((i) => original[i])
        .filter((lm) => lm && lm.x > 0.03 && lm.x < 0.97 && lm.y > 0.03 && lm.y < 0.97);

      if (validLms.length < 2) continue;

      // 반투명 영역
      ctx.beginPath();
      ctx.moveTo(validLms[0].x * W, validLms[0].y * H);
      for (let i = 1; i < validLms.length; i++) {
        ctx.lineTo(validLms[i].x * W, validLms[i].y * H);
      }
      ctx.closePath();
      ctx.fillStyle = bgColor;
      ctx.fill();

      // ── [수정] 텍스트 그릴 때 캔버스 반전 해제 ──────────────
      const center = getPartCenter(original, indices, W, H);
      if (center) {
        ctx.save();
        // 캔버스가 scaleX(-1) 반전돼 있으므로 텍스트만 다시 뒤집기
        ctx.scale(-1, 1);
        ctx.translate(-W, 0);

        const mirroredX = W - center.x; // 반전된 x 좌표

        const fontSize = Math.max(14, W * 0.028);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 텍스트 배경
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.beginPath();
        ctx.roundRect(
          mirroredX - textWidth / 2 - 6,
          center.y - fontSize / 2 - 4,
          textWidth + 12,
          fontSize + 8,
          6
        );
        ctx.fill();

        // 텍스트
        ctx.fillStyle = textColor;
        ctx.fillText(label, mirroredX, center.y);

        ctx.restore();
      }
      // ─────────────────────────────────────────────────────────
    }
  }

  // ── 2. 연결선 ────────────────────────────────────────────────
  drawUtils.drawConnectors(original, PoseLandmarker.POSE_CONNECTIONS, {
    color: "#FFFFFF60",
    lineWidth: 2,
  });

  // ── 3. 관절 점 (부위별 색상) ─────────────────────────────────
  original.forEach((lm, i) => {
    const color = getJointColor(i, parts);
    drawUtils.drawLandmarks([lm], {
      color,
      fillColor: color,
      radius: 5,
    });
  });
}