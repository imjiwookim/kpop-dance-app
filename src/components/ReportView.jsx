import { useState, useEffect } from "react";

function ReportView({ sessionId }) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/dtw/result/${sessionId}`);
        if (!response.ok) throw new Error("리포트를 불러올 수 없습니다.");
        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [sessionId]);

  const getScoreColor = (s) => {
    if (s >= 80) return "#16a34a";
    if (s >= 50) return "#ea580c";
    return "#dc2626";
  };

  if (isLoading) return <p style={{ color: "#a855f7", textAlign: "center", padding: "40px" }}>리포트 분석 중...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center", padding: "40px" }}>❌ {error}</p>;
  if (!report) return (
    <div style={{ color: "gray", padding: "40px", textAlign: "center" }}>
      <p>⚠️ DTW 리포트 없음 (팀원 API 연동 필요)</p>
    </div>
  );

  return (
    <div style={{ padding: "20px", color: "#3b1f6e" }}>
      <h2>📊 종합 분석 리포트</h2>
      <p style={{ fontSize: "48px", fontWeight: "bold", color: getScoreColor(report.score) }}>{report.score}점</p>
      {report.weakPoints && (
        <div>
          <h3>취약 관절</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {report.weakPoints.map((point, i) => (
              <div key={i} style={{ padding: "8px 12px", background: "red", borderRadius: "4px", color: "white" }}>{point}번 관절</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportView;