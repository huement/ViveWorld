import { useState, type ReactNode } from "react";
import { SceneContext, type SceneControls } from "./SceneContext";

export const SceneProvider = ({ children }: { children: ReactNode }) => {
  const [controls, setControls] = useState<SceneControls>({
    starCount: 800,
    asteroidCount: 600,
    sunSize: 3.5,
    sunPosition: { x: -50, y: 30, z: -100 },
  });

  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  return (
    <SceneContext.Provider
      value={{ controls, setControls, analyser, setAnalyser }}
    >
      {children}
    </SceneContext.Provider>
  );
};
