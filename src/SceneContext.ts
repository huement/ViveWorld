import { createContext, useContext } from "react";
import React from "react";

export interface SceneControls {
  starCount: number;
  asteroidCount: number;
  sunSize: number;
  sunPosition: { x: number; y: number; z: number };
}

export interface SceneContextType {
  controls: SceneControls;
  setControls: React.Dispatch<React.SetStateAction<SceneControls>>;
}

// Export the raw context so our Provider can read it
export const SceneContext = createContext<SceneContextType | undefined>(
  undefined,
);

// Export the clean hook
export const useSceneControls = () => {
  const context = useContext(SceneContext);
  if (context === undefined) {
    throw new Error("useSceneControls must be used within a SceneProvider");
  }
  return context;
};
