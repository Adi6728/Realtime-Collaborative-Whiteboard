"use client";

import { useEffect, useRef, useState } from "react";
import Toolbar from "./toolbar";

export default function Canvas() {
  const gridCanvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [mode, setMode] = useState("brush");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = drawCanvasRef.current.getContext("2d");
    }
    return ctxRef.current;
  };

  const resizeCanvas = () => {
    const toolbarHeight = 60;
    const w = window.innerWidth;
    const h = window.innerHeight - toolbarHeight;

    setSize({ w, h });

    gridCanvasRef.current.width = w;
    gridCanvasRef.current.height = h;

    drawCanvasRef.current.width = w;
    drawCanvasRef.current.height = h;

    drawGrid();
  };

  const drawGrid = () => {
    const canvas = gridCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showGrid) return;

    const gap = 25;
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    drawGrid();
  }, [showGrid]);

  const startDrawing = (e) => {
    const ctx = getCtx();
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    ctx.lineWidth = mode === "eraser" ? 20 : 2;
    ctx.strokeStyle = "black";
    ctx.globalCompositeOperation =
      mode === "eraser" ? "destination-out" : "source-over";

    ctx.beginPath();
    ctx.moveTo(x, y);

    setStartPos({ x, y });
    setSnapshot(
      ctx.getImageData(
        0,
        0,
        drawCanvasRef.current.width,
        drawCanvasRef.current.height
      )
    );
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = getCtx();
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (mode === "brush" || mode === "eraser") {
      ctx.lineTo(x, y);
      ctx.stroke();
      return;
    }

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
      const r = Math.hypot(x - startPos.x, y - startPos.y);
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    const ctx = getCtx();
    ctx.closePath();
    ctx.globalCompositeOperation = "source-over";
    setIsDrawing(false);
    setStartPos(null);
    setSnapshot(null);
  };

  const clearBoard = () => {
    const ctx = getCtx();
    ctx.clearRect(
      0,
      0,
      drawCanvasRef.current.width,
      drawCanvasRef.current.height
    );
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <Toolbar
        setMode={setMode}
        onClear={clearBoard}
        toggleGrid={() => setShowGrid(!showGrid)}
        showGrid={showGrid}
      />

      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <canvas
          ref={gridCanvasRef}
          style={{ position: "absolute", top: 0, left: 0 }}
        />

        <canvas
          ref={drawCanvasRef}
          style={{ position: "absolute", top: 0, left: 0 }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
}

