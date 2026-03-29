import { useState, useEffect } from "react";

export function usePoseData(songId) {
  const [referenceData, setReferenceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!songId) return;

    const fetchPoseData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 로컬 JSON 파일 불러오기 (백엔드 완성되면 API 주소로 교체)
        let url = "";
        if (songId === "love-dive") {
          url = "/love-dive_0s-73s.json";
        } else {
          throw new Error("해당 곡의 데이터가 없습니다.");
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error("데이터를 불러올 수 없습니다.");

        const data = await response.json();

        // 첫 번째 프레임 랜드마크를 기준 데이터로 사용
        // 나중에 Sliding Window 방식으로 교체 예정
        if (data.landmarks && data.landmarks.length > 0) {
          setReferenceData(data.landmarks);
        }
      } catch (err) {
        setError(err.message);
        console.error("기준 데이터 로드 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoseData();
  }, [songId]);

  return { referenceData, isLoading, error };
}