const SONG_LIST = [
    {
      id: "love-dive",
      title: "LOVE DIVE",
      artist: "IVE (아이브)",
      thumbnail: "https://img.youtube.com/vi/IIdOKj-hWAY/0.jpg",
    },
    {
      id: "apt",
      title: "APT.",
      artist: "ROSE & Bruno Mars",
      thumbnail: "https://img.youtube.com/vi/ekr2nIex040/0.jpg",
    },
    {
      id: "supernova",
      title: "Supernova",
      artist: "aespa",
      thumbnail: "https://img.youtube.com/vi/phuiiNCxRMg/0.jpg",
    },
  ];
  
  function SongSelect({ onSelect }) {
    return (
      <div style={{ padding: "20px", color: "white" }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
          🎵 연습할 곡을 선택하세요
        </h2>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
          {SONG_LIST.map((song) => (
            <div
              key={song.id}
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
                src={song.thumbnail}
                alt={song.title}
                style={{ width: "100%", height: "150px", objectFit: "cover" }}
              />
              <div style={{ padding: "12px" }}>
                <p style={{ fontWeight: "bold", fontSize: "16px", margin: "0 0 4px" }}>
                  {song.title}
                </p>
                <p style={{ color: "gray", fontSize: "13px", margin: 0 }}>
                  {song.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  export default SongSelect;