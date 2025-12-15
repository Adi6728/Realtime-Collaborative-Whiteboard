"use client";

export default function Toolbar({ setMode, onImportImage, onClear }) {
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
      <button onClick={() => setMode("image")}>Select Image</button>
      <button onClick={onImportImage}>Insert Image</button>
      <button onClick={onClear}>Clear</button>
    </div>
  );
}






