"use client";

export default function Toolbar({ setMode, onClear, toggleGrid, showGrid }) {
  return (
    <div
      style={{
        padding: 10,
        background: "white",
        borderBottom: "1px solid #ccc",
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <button onClick={() => setMode("brush")}>Brush</button>
      <button onClick={() => setMode("eraser")}>Eraser</button>
      <button onClick={() => setMode("line")}>Line</button>
      <button onClick={() => setMode("rect")}>Rectangle</button>
      <button onClick={() => setMode("circle")}>Circle</button>
      <button onClick={toggleGrid}>
        {showGrid ? "Hide Grid" : "Show Grid"}
      </button>
      <button onClick={onClear}>Clear Board</button>
    </div>
  );
}



