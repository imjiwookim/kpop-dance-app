function ReportView({ dtwResult }) {

  const getScoreColor = (s) => {
    if (s >= 80) return "#22c55e";
    if (s >= 50) return "#f97316";
    return "#ef4444";
  };

  const getSeverityColor = (severity) => {
    if (severity === "high") return "#ef4444";
    if (severity === "medium") return "#f97316";
    return "#22c55e";
  };

  if (!dtwResult) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#a855f7" }}>
        <p style={{ fontSize: "18px" }}>⚠️ 분석 결과가 없습니다</p>
        <p style={{ color: "gray", fontSize: "14px" }}>연습 후 종료 버튼을 누르면 결과가 표시됩니다</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 40px", color: "#3b1f6e" }}>
      <h2 style={{ textAlign: "center", marginBottom: "24px" }}>📊 종합 분석 리포트</h2>

      {/* 종합 점수 */}
      <div style={{
        textAlign: "center",
        padding: "24px",
        background: "linear-gradient(135deg, #f3e8ff, #fce7f3)",
        borderRadius: "16px",
        marginBottom: "24px",
        border: "1px solid #e9d5ff",
      }}>
        <p style={{ fontSize: "14px", color: "#a855f7", margin: "0 0 8px" }}>종합 유사도 점수</p>
        <p style={{
          fontSize: "64px",
          fontWeight: "bold",
          color: getScoreColor(dtwResult.overall_score),
          margin: 0,
        }}>
          {Math.round(dtwResult.overall_score)}점
        </p>
        <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginTop: "16px", fontSize: "13px", color: "gray" }}>
          <span>분석 ID: {dtwResult.analysis_id}</span>
          <span>FPS: {dtwResult.fps}</span>
          <span>거리 함수: {dtwResult.distance_metric}</span>
        </div>
      </div>

      {/* 프레임 정보 */}
      <div style={{
        display: "flex",
        gap: "16px",
        marginBottom: "24px",
      }}>
        <div style={{ flex: 1, padding: "16px", background: "#f3e8ff", borderRadius: "12px", textAlign: "center" }}>
          <p style={{ color: "#a855f7", fontSize: "12px", margin: "0 0 4px" }}>전문가 프레임</p>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#6b21a8", margin: 0 }}>{dtwResult.expert_frame_count}</p>
        </div>
        <div style={{ flex: 1, padding: "16px", background: "#fce7f3", borderRadius: "12px", textAlign: "center" }}>
          <p style={{ color: "#ec4899", fontSize: "12px", margin: "0 0 4px" }}>사용자 프레임</p>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#9d174d", margin: 0 }}>{dtwResult.user_frame_count}</p>
        </div>
        <div style={{ flex: 1, padding: "16px", background: "#f3e8ff", borderRadius: "12px", textAlign: "center" }}>
          <p style={{ color: "#a855f7", fontSize: "12px", margin: "0 0 4px" }}>DTW 거리</p>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#6b21a8", margin: 0 }}>{dtwResult.dtw_distance?.toFixed(2)}</p>
        </div>
      </div>

      {/* 취약 구간 */}
      <h3 style={{ marginBottom: "16px", color: "#6b21a8" }}>🚨 취약 구간 Top {dtwResult.mismatch_segments?.length}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {dtwResult.mismatch_segments?.map((seg) => (
          <div key={seg.rank} style={{
            padding: "16px",
            background: "white",
            borderRadius: "12px",
            border: `2px solid ${getSeverityColor(seg.severity)}`,
            boxShadow: "0 2px 8px rgba(168, 85, 247, 0.08)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{
                  padding: "4px 12px",
                  background: getSeverityColor(seg.severity),
                  color: "white",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}>
                  {seg.rank}위
                </span>
                <span style={{ color: "#6b21a8", fontWeight: "bold" }}>
                  {seg.start_sec.toFixed(1)}초 ~ {seg.end_sec.toFixed(1)}초
                </span>
                <span style={{
                  padding: "2px 8px",
                  background: getSeverityColor(seg.severity) + "20",
                  color: getSeverityColor(seg.severity),
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}>
                  {seg.severity === "high" ? "심각" : seg.severity === "medium" ? "보통" : "낮음"}
                </span>
              </div>
              <span style={{ color: "gray", fontSize: "13px" }}>
                평균 오차: {seg.mean_distance.toFixed(3)}
              </span>
            </div>

            {/* 취약 관절 */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {seg.top_joints?.map((joint, i) => (
                <div key={i} style={{
                  padding: "6px 12px",
                  background: "#f3e8ff",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#6b21a8",
                  fontWeight: "bold",
                }}>
                  {joint.name} ({joint.error.toFixed(2)})
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReportView;