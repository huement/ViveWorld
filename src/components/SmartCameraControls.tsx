import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

export function SmartCameraControls() {
  const { camera, gl } = useThree();

  // 1. Store tracking states inside a ref so updates don't trigger heavy React re-renders
  const stateRef = useRef({
    radius: 15, // Distance from Earth
    theta: 0, // Horizontal orbital angle
    phi: Math.PI / 2 - 0.2, // Vertical orbital angle (slightly tilted down at start)
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
  });

  // Track currently active keys
  const keysRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const canvas = gl.domElement;

    // Mouse Dragging Logic
    const handleMouseDown = (e: MouseEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevMouseX = e.clientX;
      stateRef.current.prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!stateRef.current.isDragging) return;

      const deltaX = e.clientX - stateRef.current.prevMouseX;
      const deltaY = e.clientY - stateRef.current.prevMouseY;

      // Sensitivity multipliers (0.005) keep mouse tracking smooth
      stateRef.current.theta -= deltaX * 0.005;
      stateRef.current.phi -= deltaY * 0.005;

      // Guard rails: Prevent the camera from turning upside down at the poles
      stateRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI - 0.1, stateRef.current.phi),
      );

      stateRef.current.prevMouseX = e.clientX;
      stateRef.current.prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      stateRef.current.isDragging = false;
    };

    // Mouse Scroll Zooming Logic
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      stateRef.current.radius += e.deltaY * 0.015;
      // Keep zoom distance bounded safely between close-up and far space
      stateRef.current.radius = Math.max(
        6,
        Math.min(35, stateRef.current.radius),
      );
    };

    // Keyboard Input Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    // Bind event listeners safely to window and canvas
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gl]);

  // 2. The Frame Loop: Updates camera position smoothly every single frame
  useFrame((_, delta) => {
    const keys = keysRef.current;
    const state = stateRef.current;

    // Frame-rate independent speeds using delta
    const orbitSpeed = 1.8 * delta;
    const zoomSpeed = 12 * delta;

    // Keyboard Orbiting (Supports both Arrows and WASD keys)
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) state.theta -= orbitSpeed;
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) state.theta += orbitSpeed;
    if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
      state.phi = Math.max(0.1, state.phi - orbitSpeed);
    }
    if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
      state.phi = Math.min(Math.PI - 0.1, state.phi + orbitSpeed);
    }

    // Keyboard Zooming (Q to zoom in closer, E to fly further backward)
    if (keys["q"] || keys["Q"])
      state.radius = Math.max(6, state.radius - zoomSpeed);
    if (keys["e"] || keys["E"])
      state.radius = Math.min(35, state.radius + zoomSpeed);

    // 3. Spherical to Cartesian math conversion
    // This physically translates our angles and distance into perfect 3D X, Y, Z points
    const x = state.radius * Math.sin(state.phi) * Math.sin(state.theta);
    const y = state.radius * Math.cos(state.phi);
    const z = state.radius * Math.sin(state.phi) * Math.cos(state.theta);

    // Snap camera to target coordinate and force lock-on view to the center (Earth)
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  });

  return null; // This component runs entirely as a background process script
}
