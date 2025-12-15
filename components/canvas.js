"use client";

import { useEffect, useRef, useState } from "react";
import Toolbar from "./toolbar";

export default function Canvas() {
  const baseCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [baseCtx, setBaseCtx] = useState(null);
  const [overlayCtx, setOverlayCtx] = useState(null);

  const [mode, setMode] = useState("brush");
  const [isDrawing, setIsDrawing] = useState(false);
  const [start, setStart] = useState(null);

  const [image, setImage] = useState(null);
  const [imgState, setImgState] = useState(null);
  const [imageSelected, setImageSelected] = useState(false);
  const [activeHandle, setActiveHandle] = useState(null);

  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight - 60;

    baseCanvasRef.current.width = w;
    baseCanvasRef.current.height = h;
    overlayCanvasRef.current.width = w;
    overlayCanvasRef.current.height = h;

    setBaseCtx(baseCanvasRef.current.getContext("2d"));
    setOverlayCtx(overlayCanvasRef.current.getContext("2d"));
  }, []);

  const redrawOverlay = () => {
    overlayCtx.clearRect(
      0,
      0,
      overlayCanvasRef.current.width,
      overlayCanvasRef.current.height
    );

    if (image && imgState) {
      overlayCtx.drawImage(
        image,
        imgState.x,
        imgState.y,
        imgState.w,
        imgState.h
      );

      if (imageSelected) drawHandles();
    }
  };

  const drawHandles = () => {
    const { x, y, w, h } = imgState;
    overlayCtx.strokeStyle = "blue";
    overlayCtx.strokeRect(x, y, w, h);

    [
      { x, y },
      { x: x + w, y },
      { x, y: y + h },
      { x: x + w, y: y + h },
    ].forEach((p) => {
      overlayCtx.fillStyle = "white";
      overlayCtx.fillRect(p.x - 4, p.y - 4, 8, 8);
      overlayCtx.strokeRect(p.x - 4, p.y - 4, 8, 8);
    });
  };

  const mouseDown = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (mode === "image" && image && imgState) {
      if (
        x >= imgState.x &&
        x <= imgState.x + imgState.w &&
        y >= imgState.y &&
        y <= imgState.y + imgState.h
      ) {
        setImageSelected(true);
        setActiveHandle("move");
        setStart({ x, y });
        return;
      }
    }

    if (mode !== "image") {
      baseCtx.beginPath();
      baseCtx.moveTo(x, y);
      setStart({ x, y });
      setIsDrawing(true);
    }
  };

  const mouseMove = (e) => {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (mode === "image" && activeHandle && imgState) {
      setImgState({
        ...imgState,
        x: imgState.x + (x - start.x),
        y: imgState.y + (y - start.y),
      });
      setStart({ x, y });
      redrawOverlay();
      return;
    }

    if (!isDrawing) return;

    if (mode === "brush" || mode === "eraser") {
      baseCtx.strokeStyle = "black";
      baseCtx.lineWidth = mode === "eraser" ? 20 : 2;
      baseCtx.globalCompositeOperation =
        mode === "eraser" ? "destination-out" : "source-over";

      baseCtx.lineTo(x, y);
      baseCtx.stroke();
      return;
    }

    redrawOverlay();
    overlayCtx.strokeStyle = "black";
    overlayCtx.lineWidth = 2;

    if (mode === "line") {
      overlayCtx.beginPath();
      overlayCtx.moveTo(start.x, start.y);
      overlayCtx.lineTo(x, y);
      overlayCtx.stroke();
    }

    if (mode === "rect") {
      overlayCtx.strokeRect(
        start.x,
        start.y,
        x - start.x,
        y - start.y
      );
    }

    if (mode === "circle") {
      const r = Math.hypot(x - start.x, y - start.y);
      overlayCtx.beginPath();
      overlayCtx.arc(start.x, start.y, r, 0, Math.PI * 2);
      overlayCtx.stroke();
    }
  };

  const mouseUp = () => {
    if (isDrawing && mode !== "brush" && mode !== "eraser") {
      baseCtx.drawImage(overlayCanvasRef.current, 0, 0);
      redrawOverlay();
    }

    setIsDrawing(false);
    setActiveHandle(null);
    baseCtx.globalCompositeOperation = "source-over";
  };

  const importImage = () => fileInputRef.current.click();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setImgState({
          x: 100,
          y: 100,
          w: img.width / 2,
          h: img.height / 2,
        });
        setMode("image");
        setImageSelected(true);
        redrawOverlay();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const clear = () => {
    baseCtx.clearRect(
      0,
      0,
      baseCanvasRef.current.width,
      baseCanvasRef.current.height
    );
    overlayCtx.clearRect(
      0,
      0,
      overlayCanvasRef.current.width,
      overlayCanvasRef.current.height
    );
    setImage(null);
  };

  return (
    <>
      <Toolbar
        setMode={(m) => {
          setMode(m);
          if (m !== "image") setImageSelected(false);
        }}
        onImportImage={importImage}
        onClear={clear}
      />

      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/png,image/jpeg"
        onChange={handleFile}
      />

      <div style={{ position: "relative" }}>
        <canvas
          ref={baseCanvasRef}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        <canvas
          ref={overlayCanvasRef}
          style={{ position: "absolute", top: 0, left: 0 }}
          onMouseDown={mouseDown}
          onMouseMove={mouseMove}
          onMouseUp={mouseUp}
        />
      </div>
    </>
  );
}





