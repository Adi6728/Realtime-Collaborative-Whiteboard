"use client";

import { useEffect, useRef, useState } from "react";
import Toolbar from "./toolbar";
import { io } from "socket.io-client";

export default function Canvas() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [mode, setMode] = useState("brush");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const socket = io("http://localhost:3000", {
      transports: ["websocket"],
      timeout: 5000,
    });

    socket.on("connect", () => {
      setConnected(true);
      setError(false);
    });

    socket.on("connect_error", () => {
      setError(true);
      setConnected(false);
    });

    return () => socket.disconnect();
  }, []);

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
    ctx.globalCompositeOperation =
      mode === "eraser" ? "destination-out" : "source-over";

    ctx.beginPath();
    ctx.moveTo(x, y);

    setStartPos({ x, y });
    setSnapshot(
      ctx.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      )
    );
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
      const radius = Math.hypot(x - startPos.x, y - startPos.y);
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
    const ctx = getContext();
    ctx.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
  };

  if (!connected && !error) {
    return (
      <div style={loaderStyle}>
        <div style={spinnerStyle}></div>
        <p>Connecting to whiteboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={loaderStyle}>
        <p style={{ color: "red" }}>Unable to connect to server</p>
      </div>
    );
  }

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

const loaderStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
};

const spinnerStyle = {
  width: 40,
  height: 40,
  border: "4px solid #ccc",
  borderTop: "4px solid black",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

