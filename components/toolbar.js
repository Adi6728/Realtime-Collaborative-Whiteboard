"use client";

export default function Toolbar({ setMode, onClear }) {
  return (
    <div
      style={{
        padding: 10,
        background: "white",
        borderBottom: "1px solid #ccc",
        display: "flex",
        gap: 10,
      }}
    >
      {/* ✅ THESE TWO LINES FIX EVERYTHING */}
      <button onClick={() => setMode("brush")}>Brush</button>
      <button onClick={() => setMode("eraser")}>Eraser</button>

      <button onClick={onClear}>Clear Board</button>
    </div>
  );
}


