"use client";

import { useRef, useState } from "react";
import Toolbar from "./toolbar";

export default function Canvas() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState("brush");

  const startDrawing = (e) => {
  const ctx = canvasRef.current.getContext("2d");

  // ✅ APPLY MODE BEFORE STARTING PATH
  if (mode === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 20;
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
  }

  ctx.beginPath();
  ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  setIsDrawing(true);
};


  const draw = (e) => {
  if (!isDrawing) return;
  const ctx = canvasRef.current.getContext("2d");

  ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  ctx.stroke();
};



 const stopDrawing = () => {
  const ctx = canvasRef.current.getContext("2d");
  ctx.closePath();
  ctx.globalCompositeOperation = "source-over"; // ✅ reset
  setIsDrawing(false);
};



  const clearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <>
      <Toolbar setMode={setMode} onClear={clearBoard} />
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{ border: "1px solid black", background: "white" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </>
  );
}


