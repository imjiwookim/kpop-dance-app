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
      } finally {
        setIsLoading(false);
      }
    };
    fetchDances();
  }, []);

  const getThumbnail = (dance_id) => {
    const thumbnails = {
      "ive_love_dive": "https://img.youtube.com/vi/IIdOKj-hWAY/0.jpg",
      "apt": "https://img.youtube.com/vi/ekr2nIex040/0.jpg",
      "supernova": "https://img.youtube.com/vi/phuiiNCxRMg/0.jpg",
    };
    return thumbnails[dance_id] || "https://via.placeholder.com/200x150";
  };

  const getSongTitle = (dance_id) => {
    const titles = {
      "ive_love_dive": "LOVE DIVE",
      "apt": "APT.",
      "supernova": "Supernova",
    };
    return titles[dance_id] || dance_id;
  };

  const getArtist = (dance_id) => {
    const artists = {
      "ive_love_dive": "IVE (아이브)",
      "apt": "ROSE & Bruno Mars",
      "supernova": "aespa",
    };
    return artists[dance_id] || "";
  };

  if (isLoading) return <p style={{ color: "#a855f7", textAlign: "center", padding: "40px" }}>곡 목록 불러오는 중...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center", padding: "40px" }}>❌ {error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#6b21a8" }}>🎵 연습할 곡을 선택하세요</h2>
      <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
        {songs.map((song) => (
          <div
            key={song.dance_id}
            onClick={() => onSelect(song)}
            style={{
              width: "200px",
              background: "white",
              borderRadius: "12px",
              overflow: "hidden",
              cursor: "pointer",
              border: "2px solid #e9d5ff",
              transition: "border 0.2s",
              boxShadow: "0 2px 8px rgba(168, 85, 247, 0.1)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.border = "2px solid #a855f7")}
            onMouseLeave={(e) => (e.currentTarget.style.border = "2px solid #e9d5ff")}
          >
            <img src={getThumbnail(song.dance_id)} alt={getSongTitle(song.dance_id)} style={{ width: "100%", height: "150px", objectFit: "cover" }} />
            <div style={{ padding: "12px" }}>
              <p style={{ fontWeight: "bold", fontSize: "16px", margin: "0 0 4px", color: "#6b21a8" }}>{getSongTitle(song.dance_id)}</p>
              <p style={{ color: "gray", fontSize: "13px", margin: "0 0 4px" }}>{getArtist(song.dance_id)}</p>
              <p style={{ color: "#a855f7", fontSize: "11px", margin: 0 }}>{song.duration_sec}초 · {song.fps}fps</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SongSelect;