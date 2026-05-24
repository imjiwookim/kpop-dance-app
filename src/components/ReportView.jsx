import { useRef, useState, useEffect } from "react";

const BASE_URL = "http://localhost:8000";

// ── SegmentVideo를 컴포넌트 밖으로 분리 ─────────────────────────
function SegmentVideo({ seg, videoUrl, onEnd, getSeverityColor }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playFromStart = () => {
      video.currentTime = seg.start_sec;
      video.play();
    };

    if (video.readyState >= 2) {
      playFromStart();
    } else {
      video.addEventListener("loadeddata", playFromStart, { once: true });
    }

    return () => {
      video.removeEventListener("loadeddata", playFromStart);
      video.pause();
    };
  }, [seg.start_sec]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= seg.end_sec) {
      videoRef.current.pause();
      onEnd();
    }
  };

  return (
    <div style={{
      marginBottom: "14px",
      borderRadius: "12px", overflow: "hidden",
      border: `2px solid ${getSeverityColor(seg.severity)}`,
    }}>
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        onTimeUpdate={handleTimeUpdate}
        style={{ width: "100%", maxHeight: "280px", objectFit: "contain", background: "#000", display: "block" }}
      />
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────

function ReportView({ dtwResult }) {
  const [playingRank, setPlayingRank] = useState(null);

  const getScoreColor = (s) => {
    if (s >= 80) return "#22c55e";
    if (s >= 50) return "#f97316";
    return "#ef4444";
  };

  const getScoreBg = (s) => {
    if (s >= 80) return "rgba(34,197,94,0.1)";
    if (s >= 50) return "rgba(249,115,22,0.1)";
    return "rgba(239,68,68,0.1)";
  };

  const getSeverityColor = (severity) => {
    if (severity === "high") return "#ef4444";
    if (severity === "medium") return "#f97316";
    return "#22c55e";
  };

  const getSeverityLabel = (severity) => {
    if (severity === "high") return "심각";
    if (severity === "medium") return "보통";
    return "낮음";
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "-";
    const d = new Date(isoStr);
    return d.toLocaleString("ko-KR", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  if (!dtwResult) {
    return (
      <div style={{
        padding: "60px 40px", textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
      }}>
        <span style={{ fontSize: "48px" }}>📊</span>
        <p style={{ fontSize: "18px", color: "#a855f7", fontWeight: "700" }}>분석 결과가 없습니다</p>
        <p style={{ color: "#9ca3af", fontSize: "14px" }}>연습 후 종료 버튼을 누르면 결과가 표시됩니다</p>
      </div>
    );
  }

  const score = Math.round(dtwResult.overall_score);
  const videoUrl = `${BASE_URL}/static/videos/${dtwResult.dance_id}.mp4`;

  return (
    <div style={{ padding: "24px 40px", color: "#3b1f6e", maxWidth: "900px", margin: "0 auto" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>📊 종합 분석 리포트</h2>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
          <span style={{ fontSize: "11px", color: "#9ca3af" }}>분석 ID: {dtwResult.analysis_id}</span>
          <span style={{ fontSize: "11px", color: "#9ca3af" }}>{formatDate(dtwResult.created_at)}</span>
        </div>
      </div>

      {/* 종합 점수 카드 */}
      <div style={{
        padding: "28px 32px",
        background: "linear-gradient(135deg, #f3e8ff, #fce7f3)",
        borderRadius: "20px", marginBottom: "20px",
        border: "1px solid #e9d5ff",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "16px",
      }}>
        <div>
          <p style={{ fontSize: "13px", color: "#a855f7", margin: "0 0 6px", letterSpacing: "1px", fontWeight: "600" }}>
            종합 유사도 점수
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
            <span style={{ fontSize: "72px", fontWeight: "900", lineHeight: 1, color: getScoreColor(score) }}>
              {score}
            </span>
            <span style={{ fontSize: "24px", color: getScoreColor(score), fontWeight: "700", marginBottom: "8px" }}>점</span>
          </div>
          <div style={{
            marginTop: "10px", padding: "6px 14px",
            background: getScoreBg(score), borderRadius: "20px",
            display: "inline-block", fontSize: "13px",
            color: getScoreColor(score), fontWeight: "700",
          }}>
            {score >= 80 ? "🎉 훌륭해요!" : score >= 50 ? "💪 조금 더 연습해봐요!" : "🔥 다시 도전해보세요!"}
          </div>
        </div>

        <div style={{
          padding: "16px 20px", background: "white",
          borderRadius: "14px", border: "1px solid #e9d5ff", minWidth: "160px",
        }}>
          <p style={{ fontSize: "11px", color: "#a855f7", margin: "0 0 4px", letterSpacing: "1px" }}>DANCE</p>
          <p style={{ fontSize: "16px", fontWeight: "800", color: "#6b21a8", margin: "0 0 8px" }}>
            {dtwResult.dance_id}
          </p>
          <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
            거리 함수: <strong style={{ color: "#6b21a8" }}>{dtwResult.distance_metric?.toUpperCase()}</strong>
          </p>
        </div>
      </div>

      {/* 수치 지표 카드 그리드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "전문가 프레임", value: dtwResult.expert_frame_count, unit: "frames", color: "#a855f7", bg: "#f3e8ff" },
          { label: "사용자 프레임", value: dtwResult.user_frame_count, unit: "frames", color: "#ec4899", bg: "#fce7f3" },
          { label: "FPS", value: dtwResult.fps, unit: "fps", color: "#8b5cf6", bg: "#ede9fe" },
          { label: "DTW 거리", value: dtwResult.dtw_distance?.toFixed(2), unit: "", color: "#a855f7", bg: "#f3e8ff" },
          { label: "정규화 거리", value: dtwResult.normalized_distance?.toFixed(4), unit: "", color: "#ec4899", bg: "#fce7f3" },
          { label: "워핑 경로 길이", value: dtwResult.warping_path_length, unit: "steps", color: "#8b5cf6", bg: "#ede9fe" },
        ].map((item) => (
          <div key={item.label} style={{ padding: "16px", background: item.bg, borderRadius: "14px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: item.color, margin: "0 0 6px", fontWeight: "600", letterSpacing: "0.5px" }}>
              {item.label}
            </p>
            <p style={{ fontSize: "22px", fontWeight: "800", color: "#3b1f6e", margin: 0 }}>
              {item.value}
              {item.unit && <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "4px" }}>{item.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* 취약 구간 */}
      <h3 style={{ marginBottom: "16px", color: "#6b21a8", fontSize: "17px", fontWeight: "800" }}>
        🚨 취약 구간 Top {dtwResult.mismatch_segments?.length}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {dtwResult.mismatch_segments?.map((seg) => (
          <div key={seg.rank} style={{
            padding: "18px 20px", background: "white",
            borderRadius: "16px",
            border: `2px solid ${getSeverityColor(seg.severity)}`,
            boxShadow: `0 2px 12px ${getSeverityColor(seg.severity)}18`,
          }}>

            {/* 구간 헤더 */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px",
            }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{
                  width: "32px", height: "32px",
                  background: getSeverityColor(seg.severity),
                  color: "white", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: "800", flexShrink: 0,
                }}>
                  {seg.rank}
                </span>
                <div>
                  <span style={{ color: "#6b21a8", fontWeight: "700", fontSize: "15px" }}>
                    {seg.start_sec.toFixed(1)}초 ~ {seg.end_sec.toFixed(1)}초
                  </span>
                  <span style={{ color: "#9ca3af", fontSize: "12px", marginLeft: "8px" }}>
                    ({seg.duration_sec.toFixed(1)}초)
                  </span>
                </div>
                <span style={{
                  padding: "3px 10px",
                  background: getSeverityColor(seg.severity) + "20",
                  color: getSeverityColor(seg.severity),
                  borderRadius: "6px", fontSize: "12px", fontWeight: "700",
                }}>
                  {getSeverityLabel(seg.severity)}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "6px 14px", background: "#f9fafb", borderRadius: "8px", textAlign: "right" }}>
                  <p style={{ fontSize: "10px", color: "#9ca3af", margin: "0 0 2px" }}>평균 오차</p>
                  <p style={{ fontSize: "15px", fontWeight: "800", color: "#3b1f6e", margin: 0 }}>
                    {seg.mean_distance.toFixed(3)}
                  </p>
                </div>

                <button
                  onClick={() => setPlayingRank(playingRank === seg.rank ? null : seg.rank)}
                  style={{
                    padding: "8px 16px",
                    background: playingRank === seg.rank
                      ? "linear-gradient(135deg, #ef4444, #f97316)"
                      : "linear-gradient(135deg, #a855f7, #ec4899)",
                    color: "white", border: "none",
                    borderRadius: "10px", cursor: "pointer",
                    fontSize: "13px", fontWeight: "700",
                    boxShadow: "0 2px 8px rgba(168,85,247,0.3)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {playingRank === seg.rank ? "⏹ 닫기" : "▶ 구간 보기"}
                </button>
              </div>
            </div>

            {/* 영상 재생 영역 */}
            {playingRank === seg.rank && (
              <SegmentVideo
                seg={seg}
                videoUrl={videoUrl}
                onEnd={() => setPlayingRank(null)}
                getSeverityColor={getSeverityColor}
              />
            )}

            {/* 취약 관절 */}
            <div>
              <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 8px", letterSpacing: "0.5px" }}>
                주요 취약 관절
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {seg.top_joints?.map((joint, i) => (
                  <div key={i} style={{
                    padding: "7px 14px",
                    background: "linear-gradient(135deg, #f3e8ff, #fce7f3)",
                    borderRadius: "10px", border: "1px solid #e9d5ff",
                    display: "flex", alignItems: "center", gap: "8px",
                  }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#6b21a8" }}>
                      {joint.name}
                    </span>
                    <span style={{
                      padding: "2px 7px",
                      background: getSeverityColor(
                        joint.error > 0.7 ? "high" : joint.error > 0.4 ? "medium" : "low"
                      ) + "25",
                      color: getSeverityColor(
                        joint.error > 0.7 ? "high" : joint.error > 0.4 ? "medium" : "low"
                      ),
                      borderRadius: "4px", fontSize: "11px", fontWeight: "700",
                    }}>
                      {joint.error.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: "40px" }} />
    </div>
  );
}

export default ReportView;