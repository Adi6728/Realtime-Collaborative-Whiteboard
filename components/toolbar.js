export default function Toolbar({ onClear }) {
  return (
    <div style={{ padding: 10, background: "#eee" }}>
      <button>Brush</button>
      <button>Eraser</button>

      {/* ✅ New Clear Board button */}
      <button onClick={onClear} style={{ marginLeft: 10 }}>
        Clear Board
      </button>
    </div>
  );
}
