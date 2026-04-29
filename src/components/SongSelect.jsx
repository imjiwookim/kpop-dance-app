import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:8000";

function SongSelect({ onSelect }) {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDances = async () => {
      try {
        const response = await fetch(`${BASE_URL}/dances`);
        if (!response.ok) throw new Error("댄스 목록을 불러올 수 없습니다.");
        const data = await response.json();
        setSongs(data.dances);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDances();
  }, []);

  // dance_id로 썸네일 가져오기
  const getThumbnail = (dance_id) => {
    const thumbnails = {
      "ive_love_dive": "https://img.youtube.com/vi/IIdOKj-hWAY/0.jpg",
      "apt": "https://img.youtube.com/vi/ekr2nIex040/0.jpg",
      "supernova": "https://img.youtube.com/vi/phuiiNCxRMg/0.jpg",
    };
    return thumbnails[dance_id] || "https://via.placeholder.com/200x150";
  };

  // dance_id로 곡 이름 가져오기
  const getSongTitle = (dance_id) => {
    const titles = {
      "ive_love_dive": "LOVE DIVE",
      "apt": "APT.",
      "supernova": "Supernova",
    };
    return titles[dance_id] || dance_id;
  };

  // dance_id로 아티스트 가져오기
  const getArtist = (dance_id) => {
    const artists = {
      "ive_love_dive": "IVE (아이브)",
      "apt": "ROSE & Bruno Mars",
      "supernova": "aespa",
    };
    return artists[dance_id] || "";
  };

  if (isLoading) return <p style={{ color: "yellow", textAlign: "center", padding: "40px" }}>곡 목록 불러오는 중...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center", padding: "40px" }}>❌ {error}</p>;

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        🎵 연습할 곡을 선택하세요
      </h2>
      <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
        {songs.map((song) => (
          <div
            key={song.dance_id}
            onClick={() => onSelect(song)}
            style={{
              width: "200px",
              background: "#222",
              borderRadius: "12px",
              overflow: "hidden",
              cursor: "pointer",
              border: "2px solid #333",
              transition: "border 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.border = "2px solid #6366f1")}
            onMouseLeave={(e) => (e.currentTarget.style.border = "2px solid #333")}
          >
            <img
              src={getThumbnail(song.dance_id)}
              alt={getSongTitle(song.dance_id)}
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />
            <div style={{ padding: "12px" }}>
              <p style={{ fontWeight: "bold", fontSize: "16px", margin: "0 0 4px" }}>
                {getSongTitle(song.dance_id)}
              </p>
              <p style={{ color: "gray", fontSize: "13px", margin: "0 0 4px" }}>
                {getArtist(song.dance_id)}
              </p>
              <p style={{ color: "#6366f1", fontSize: "11px", margin: 0 }}>
                {song.duration_sec}초 · {song.fps}fps
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SongSelect;