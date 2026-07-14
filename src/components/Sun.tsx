import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

import localSunTexture from "../assets/sun.png";
import { useSceneControls } from "../SceneContext";

export function Sun() {
  const sunRef = useRef<THREE.Mesh>(null);
  const sunTexture = useTexture(localSunTexture);

  const { controls, analyser } = useSceneControls();
  const { x, y, z } = controls.sunPosition;

  // 1. Visualizer Staging Metrics
  const numRings = 3;
  const numPoints = 180;

  // Base visualizer radius sits just outside the sun's physical surface mesh
  const baseRadius = controls.sunSize + 0.8;

  // Direct access handles to update the lines on the GPU canvas
  const geoRef1 = useRef<THREE.BufferGeometry>(null);
  const geoRef2 = useRef<THREE.BufferGeometry>(null);
  const geoRef3 = useRef<THREE.BufferGeometry>(null);
  const geoRefs = [geoRef1, geoRef2, geoRef3];

  const dataArray = useMemo(() => {
    if (!analyser) return new Uint8Array(0);
    return new Uint8Array(analyser.frequencyBinCount);
  }, [analyser]);

  // 2. Generate starting circles. Re-allocates safely if sunSize slider tweaks baseRadius.
  const visualizerRings = useMemo(() => {
    return Array.from({ length: numRings }).map((_, ringIdx) => {
      const positions = new Float32Array(numPoints * 3);
      const angles = new Float32Array(numPoints);

      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        angles[i] = angle;

        // Spread initial coordinate points flat on the ring plane
        positions[i * 3] = Math.cos(angle) * baseRadius;
        positions[i * 3 + 1] = 0; // Flat orientation
        positions[i * 3 + 2] = Math.sin(angle) * baseRadius;
      }

      return { positions, angles };
    });
  }, [baseRadius]);

  // 3. Main Frame Execution Loop
  useFrame((state, delta) => {
    // Keep the core star spinning slowly
    if (sunRef.current) sunRef.current.rotation.y += delta * 0.02;

    if (analyser && dataArray.length > 0) {
      analyser.getByteFrequencyData(dataArray);
      const binCount = analyser.frequencyBinCount;

      // Extract raw sub-bass to pulsate the physical core star scale
      let bassSum = 0;
      const bassBins = 6;
      for (let i = 0; i < bassBins; i++) {
        bassSum += dataArray[i];
      }
      const pulseFactor = 1.0 + (bassSum / bassBins / 255) * 0.4;
      if (sunRef.current) sunRef.current.scale.setScalar(pulseFactor);

      // Animate the 3 surrounding Solar Prominence visualizer rings
      for (let ring = 0; ring < numRings; ring++) {
        const geo = geoRefs[ring].current;
        if (!geo) continue;

        const posAttribute = geo.getAttribute(
          "position",
        ) as THREE.BufferAttribute;
        const posArray = posAttribute.array as Float32Array;
        const { angles } = visualizerRings[ring];

        // Slice up the frequency spectrum across the 3 lines
        const freqRangeStart = Math.floor((ring * binCount) / (numRings * 1.5));
        const freqRangeEnd = Math.floor(
          ((ring + 1) * binCount) / (numRings * 1.5),
        );
        const freqRange = freqRangeEnd - freqRangeStart;
        const segmentSize = Math.max(1, Math.floor(freqRange / numPoints));

        // Stagger the ring distances outward
        const ringRadius = baseRadius * (1.0 + ring * 0.15) * pulseFactor;

        for (let i = 0; i < numPoints; i++) {
          let sum = 0;
          for (let j = 0; j < segmentSize; j++) {
            const freqIndex =
              freqRangeStart + ((i * segmentSize + j) % freqRange);
            sum += dataArray[freqIndex];
          }
          const normalizedFreq = sum / (segmentSize * 255);

          // Erupt vertices outward based on sound amplitude mapping
          const dynamicRadius = ringRadius * (1.0 + normalizedFreq * 0.6);
          const angle = angles[i];

          posArray[i * 3] = Math.cos(angle) * dynamicRadius;
          posArray[i * 3 + 2] = Math.sin(angle) * dynamicRadius;
        }
        posAttribute.needsUpdate = true;
      }
    } else {
      // Default resting state if track is paused/inactive
      if (sunRef.current) sunRef.current.scale.setScalar(1.0);

      for (let ring = 0; ring < numRings; ring++) {
        const geo = geoRefs[ring].current;
        if (!geo) continue;

        const posAttribute = geo.getAttribute(
          "position",
        ) as THREE.BufferAttribute;
        const posArray = posAttribute.array as Float32Array;
        const { angles } = visualizerRings[ring];
        const ringRadius = baseRadius * (1.0 + ring * 0.15);

        for (let i = 0; i < numPoints; i++) {
          const angle = angles[i];
          posArray[i * 3] = Math.cos(angle) * ringRadius;
          posArray[i * 3 + 2] = Math.sin(angle) * ringRadius;
        }
        posAttribute.needsUpdate = true;
      }
    }
  });

  // Hot solar color palette selection matching an active stellar atmosphere
  const flareColors = ["#ff3300", "#ffaa00", "#ffffff"];

  return (
    <group position={[x, y, z]}>
      {/* THE FIERY SUN CORE */}
      <mesh ref={sunRef} position={[0, 0, 0]}>
        <sphereGeometry args={[controls.sunSize, 16, 12]} />
        <meshStandardMaterial
          map={sunTexture}
          emissiveMap={sunTexture}
          emissive={new THREE.Color("#ffaa44")}
          emissiveIntensity={2.5}
          flatShading={true}
        />
      </mesh>

      {/* THE AUDIO REVOLVING FIERE VISUALIZER CAGE */}
      {/* Retains that dynamic, retro-futuristic mechanical cockpit tilt angle */}
      <group rotation={[Math.PI / 6, Math.PI / 1.8, 0]}>
        {visualizerRings.map((ring, index) => (
          <lineLoop key={index}>
            <bufferGeometry ref={geoRefs[index]}>
              <bufferAttribute
                attach="attributes-position"
                args={[ring.positions, 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={flareColors[index]}
              linewidth={2}
              transparent
              opacity={0.8 - index * 0.2}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </lineLoop>
        ))}
      </group>
    </group>
  );
}
