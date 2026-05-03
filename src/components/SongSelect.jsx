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

  const getThumbnail = (dance_id) => {
    const thumbnails = {
      "ive_love_dive_full":      "https://img.youtube.com/vi/IIdOKj-hWAY/0.jpg",
      "ive_love_dive_highlight": "https://img.youtube.com/vi/IIdOKj-hWAY/0.jpg",
      "apt":                     "https://img.youtube.com/vi/ekr2nIex040/0.jpg",
      "supernova":               "https://img.youtube.com/vi/phuiiNCxRMg/0.jpg",
    };
    return thumbnails[dance_id] || `https://placehold.co/200x150/f3e8ff/a855f7?text=${dance_id}`;
  };

  const getSongTitle = (dance_id) => {
    const titles = {
      "ive_love_dive_full":      "LOVE DIVE (Full)",
      "ive_love_dive_highlight": "LOVE DIVE (Highlight)",
      "apt":                     "APT.",
      "supernova":               "Supernova",
    };
    return titles[dance_id] || dance_id;
  };

  const getArtist = (dance_id) => {
    const artists = {
      "ive_love_dive_full":      "IVE (아이브)",
      "ive_love_dive_highlight": "IVE (아이브)",
      "apt":                     "ROSE & Bruno Mars",
      "supernova":               "aespa",
    };
    return artists[dance_id] || "";
  };

  const getModeLabel = (dance_id) => {
    if (dance_id.endsWith("_full"))      return { label: "FULL", color: "#7c3aed", bg: "#ede9fe" };
    if (dance_id.endsWith("_highlight")) return { label: "HIGH", color: "#db2777", bg: "#fce7f3" };
    return null;
  };

  if (isLoading) return (
    <div style={{ textAlign: "center", padding: "60px", color: "#a855f7" }}>
      <p style={{ fontSize: "16px" }}>🎵 곡 목록 불러오는 중...</p>
    </div>
  );
  if (error) return (
    <div style={{ textAlign: "center", padding: "60px", color: "#ef4444" }}>
      <p>❌ {error}</p>
    </div>
  );

  return (
    <div style={{ padding: "32px 40px", color: "#3b1f6e" }}>
      <h2 style={{ textAlign: "center", marginBottom: "32px", fontSize: "22px", fontWeight: "800" }}>
        🎵 연습할 곡을 선택하세요
      </h2>
      <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
        {songs.map((song) => {
          const modeLabel = getModeLabel(song.dance_id);
          return (
            <div
              key={song.dance_id}
              onClick={() => onSelect(song)}
              style={{
                width: "200px",
                background: "white",
                borderRadius: "16px",
                overflow: "hidden",
                cursor: "pointer",
                border: "2px solid #e9d5ff",
                transition: "all 0.2s",
                boxShadow: "0 2px 8px rgba(168,85,247,0.08)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "2px solid #a855f7";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(168,85,247,0.2)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "2px solid #e9d5ff";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(168,85,247,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={getThumbnail(song.dance_id)}
                  alt={getSongTitle(song.dance_id)}
                  style={{ width: "100%", height: "150px", objectFit: "cover" }}
                />
                {/* Full / Highlight 배지 */}
                {modeLabel && (
                  <span style={{
                    position: "absolute", top: "8px", right: "8px",
                    padding: "3px 8px",
                    background: modeLabel.bg,
                    color: modeLabel.color,
                    borderRadius: "6px", fontSize: "10px", fontWeight: "800",
                    letterSpacing: "0.5px",
                  }}>
                    {modeLabel.label}
                  </span>
                )}
              </div>
              <div style={{ padding: "12px" }}>
                <p style={{ fontWeight: "800", fontSize: "15px", margin: "0 0 4px", color: "#3b1f6e" }}>
                  {getSongTitle(song.dance_id)}
                </p>
                <p style={{ color: "#9ca3af", fontSize: "12px", margin: "0 0 6px" }}>
                  {getArtist(song.dance_id)}
                </p>
                <p style={{ color: "#a855f7", fontSize: "11px", margin: 0, fontWeight: "600" }}>
                  {song.duration_sec}초 · {song.fps}fps
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SongSelect;