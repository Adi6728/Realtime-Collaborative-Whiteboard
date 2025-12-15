"use client";

import { useRef, useState } from "react";
import Toolbar from "./toolbar";

export default function Canvas() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState("brush");
  const [startPos, setStartPos] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  const getContext = () => {
    if (!ctxRef.current) {
      ctxRef.current = canvasRef.current.getContext("2d");
    }
    return ctxRef.current;
  };

  const startDrawing = (e) => {
    const ctx = getContext();
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    ctx.lineWidth = mode === "eraser" ? 20 : 2;
    ctx.strokeStyle = "black";

    if (mode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
    }

    ctx.beginPath();
    ctx.moveTo(x, y);

    setStartPos({ x, y });
    setSnapshot(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = getContext();
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (mode === "brush" || mode === "eraser") {
      ctx.lineTo(x, y);
      ctx.stroke();
      return;
    }

    // 🔁 Restore previous canvas (for live preview)
    ctx.putImageData(snapshot, 0, 0);

    if (mode === "line") {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    if (mode === "rect") {
      ctx.strokeRect(
        startPos.x,
        startPos.y,
        x - startPos.x,
        y - startPos.y
      );
    }

    if (mode === "circle") {
      const radius = Math.sqrt(
        Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    const ctx = getContext();
    ctx.closePath();
    ctx.globalCompositeOperation = "source-over";
    setIsDrawing(false);
    setStartPos(null);
    setSnapshot(null);
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
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
