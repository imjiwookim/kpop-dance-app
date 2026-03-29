import { useState, useEffect } from "react";

function ReportView({ sessionId }) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const fetchReport = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 팀원이 API 완성하면 여기 주소만 바꾸면 됨!
        const response = await fetch(`http://localhost:8000/api/dtw/result/${sessionId}`);
        if (!response.ok) throw new Error("리포트를 불러올 수 없습니다.");

        const data = await response.json();
        setReport(data); // 팀원 데이터 형식에 따라 여기 수정
      } catch (err) {
        setError(err.message);
        console.error("리포트 로드 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [sessionId]);

  const getScoreColor = (s) => {
    if (s >= 80) return "green";
    if (s >= 50) return "orange";
    return "red";
  };

  // 로딩 중
  if (isLoading) {
    return <p style={{ color: "yellow" }}>리포트 분석 중...</p>;
  }

  // 에러
  if (error) {
    return <p style={{ color: "red" }}>❌ {error}</p>;
  }

  // 데이터 없음
  if (!report) {
    return (
      <div style={{ color: "gray", padding: "20px" }}>
        <p>⚠️ DTW 리포트 없음 (팀원 API 연동 필요)</p>
        <p style={{ fontSize: "12px" }}>
          팀원 API 완성 후 ReportView.jsx 에서 주소 교체.
        </p>
      </div>
    );
  }

  // 리포트 표시
  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>📊 종합 분석 리포트</h2>

      {/* 전체 점수 */}
      <div style={{ marginBottom: "20px" }}>
        <h3>전체 점수</h3>
        <p style={{
          fontSize: "48px",
          fontWeight: "bold",
          color: getScoreColor(report.score)
        }}>
          {report.score}점
        </p>
      </div>

      {/* 박자 지연 */}
      {report.delay !== undefined && (
        <div style={{ marginBottom: "20px" }}>
          <h3>박자 지연</h3>
          <p style={{ fontSize: "24px", color: report.delay > 0.5 ? "red" : "green" }}>
            {report.delay}초
          </p>
        </div>
      )}

      {/* 취약 구간 */}
      {report.weakPoints && report.weakPoints.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h3>취약 관절 부위</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {report.weakPoints.map((point, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 12px",
                  background: "red",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "14px",
                }}
              >
                {point}번 관절
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 구간별 점수 */}
      {report.sectionScores && report.sectionScores.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h3>구간별 점수</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {report.sectionScores.map((section, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ minWidth: "60px" }}>{i + 1}구간</span>
                <div style={{
                  height: "20px",
                  width: `${section.score}%`,
                  background: getScoreColor(section.score),
                  borderRadius: "4px",
                  transition: "width 0.3s",
                }} />
                <span style={{ color: getScoreColor(section.score) }}>
                  {section.score}점
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportView;