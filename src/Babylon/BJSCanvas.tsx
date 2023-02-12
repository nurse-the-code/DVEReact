import React, { useEffect, useRef } from "react";

import "./BJSCanvas.css";
import { BabylonSystem } from "./EngineSystem";
import { Scene, Engine } from "babylonjs";
import { $INIT_RENDER } from "../contexts/Render/render";

let ran = false;
const BabylonCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ran) return;
    ran = true;
    if (!canvasRef.current) {
      return;
    }

    const engine = new Engine(canvasRef.current, true);

    const scene = new Scene(engine);

    BabylonSystem.scene = scene;
    BabylonSystem.engine = engine;
    BabylonSystem.canvas = canvasRef.current;
  }, []);

  return <canvas ref={canvasRef} className="renderCanvas" />;
};

export default BabylonCanvas;
