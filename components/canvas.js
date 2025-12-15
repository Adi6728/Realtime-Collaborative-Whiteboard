import { useRef } from "react";
import Toolbar from "./toolbar";

export default function Canvas() {
  const canvasRef = useRef(null);

  const clearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <>
      <Toolbar onClear={clearBoard} />
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{ border: "1px solid black" }}
      />
    </>
  );
}
