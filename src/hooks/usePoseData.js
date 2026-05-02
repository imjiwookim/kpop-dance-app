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
        let url = "";
        if (songId === "love-dive") {
          url = "/love-dive_0s-73s.json";
        } else {
          throw new Error("해당 곡의 데이터가 없습니다.");
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error("데이터를 불러올 수 없습니다.");
        const data = await response.json();
        if (data.landmarks && data.landmarks.length > 0) {
          setReferenceData(data.landmarks);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPoseData();
  }, [songId]);

  return { referenceData, isLoading, error };
}