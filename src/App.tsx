import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Planet } from "./components/Planet";
import { Starfield } from "./components/Starfield";
import { Sun } from "./components/Sun";
import { AsteroidRing } from "./components/AsteroidRing";
import { HiddenMenu } from "./components/HiddenMenu";
import { SceneProvider } from "./SceneProvider";
import { useSceneControls } from "./SceneContext";
import { SmartCameraControls } from "./components/SmartCameraControls";

// 1. Move your canvas layout into a dedicated scene component
function SpaceScene() {
  const { controls } = useSceneControls();

  return (
    <div className="relative w-screen h-screen bg-black select-none">
      <HiddenMenu />

      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: true }}
      >
        <SmartCameraControls />

        <hemisphereLight
          color={"#41586c"}
          groundColor={"#454392"}
          intensity={6.2}
        />

        <directionalLight
          position={[
            controls.sunPosition.x,
            controls.sunPosition.y,
            controls.sunPosition.z,
          ]}
          intensity={7.0}
        />

        <directionalLight
          position={[15, 10, 15]}
          intensity={5.5}
          color="#b3e5fc"
        />

        <Sun />

        <Suspense fallback={null}>
          <Planet />
          {/* Added 'key' so the GPU updates the rock allocation smoothly */}
          <AsteroidRing
            key={controls.asteroidCount}
            count={controls.asteroidCount}
          />
        </Suspense>

        {/* Added 'key' so the GPU updates the star allocation smoothly */}
        <Starfield key={controls.starCount} count={controls.starCount} />
      </Canvas>
    </div>
  );
}

// 2. Let App be the root wrapper that injects the context dome
export default function App() {
  return (
    <SceneProvider>
      <SpaceScene />
    </SceneProvider>
  );
}
