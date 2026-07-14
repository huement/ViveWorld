import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useSceneControls } from "../SceneContext";

// Import shaders via Vite raw text loader
import vertexShader from "../shaders/vertex.glsl?raw";
import fragmentShader from "../shaders/fragment.glsl?raw";
import perlinNoiseImg from "../assets/perlin.jpeg";

function createPRNG(seed: number) {
  let s = seed;
  return function () {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

export function AsteroidRing() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const rockMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  // 1. Read the slider value directly from global scene context
  const { analyser, controls } = useSceneControls();

  // Treat 1000 as 100% maximum capacity and scale downward
  const sliderValue = controls.asteroidCount; // Ranges from 0 to 1000
  const densityPercentage = sliderValue / 1000;

  // Calculate dynamic counts based on the slider percent
  const dynamicParticleCount = Math.floor(20000 * densityPercentage);
  const dynamicRockCount = Math.floor(400 * densityPercentage);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const baseTexture = useTexture(perlinNoiseImg);

  const noiseTexture = useMemo(() => {
    const cloned = baseTexture.clone();
    cloned.wrapS = THREE.RepeatWrapping;
    cloned.wrapT = THREE.RepeatWrapping;
    cloned.repeat.set(1, 1);
    cloned.needsUpdate = true;
    return cloned;
  }, [baseTexture]);

  useEffect(() => {
    return () => {
      noiseTexture.dispose();
    };
  }, [noiseTexture]);

  const dataArray = useMemo(() => {
    if (!analyser) return new Uint8Array(0);
    return new Uint8Array(analyser.frequencyBinCount);
  }, [analyser]);

  // 2. LAYER A: Generate Background Volumetric Particles (Thinned by slider)
  const particleGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(dynamicParticleCount * 3);
    const uvs = new Float32Array(dynamicParticleCount * 2);
    const rand = createPRNG(99);

    const minRadius = 5.8;
    const maxRadius = 8.5;

    for (let i = 0; i < dynamicParticleCount; i++) {
      const radius = minRadius + rand() * (maxRadius - minRadius);
      const angle = rand() * Math.PI * 2;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (rand() - 0.5) * 0.3;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      uvs[i * 2] = angle / (Math.PI * 2);
      uvs[i * 2 + 1] = (radius - minRadius) / (maxRadius - minRadius);
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    return geo;
  }, [dynamicParticleCount]);

  // 3. LAYER B: Generate Chunky 3D Rocks (Thinned by slider)
  const largeRocks = useMemo(() => {
    const rand = createPRNG(555);
    const temp = [];
    const minRadius = 6.0;
    const maxRadius = 8.2;

    for (let i = 0; i < dynamicRockCount; i++) {
      const radius = minRadius + rand() * (maxRadius - minRadius);
      const angle = rand() * Math.PI * 2;

      temp.push({
        radius,
        angle,
        speed: 0.04 + rand() * 0.12,
        yOffset: (rand() - 0.5) * 0.5,
        size: 0.08 + rand() * 0.22,
        rotationSpeed: 0.4 + rand() * 1.6,
        seedX: rand() * 100,
        seedY: rand() * 100,
      });
    }
    return temp;
  }, [dynamicRockCount]);

  const particleUniforms = useMemo(
    () => ({
      time: { value: 0 },
      frequency: { value: 1.4 },
      amplitude: { value: 0.4 },
      maxDistance: { value: 2.5 },
      timeX: { value: 0.05 },
      timeY: { value: 0.05 },
      timeZ: { value: 0.05 },
      uNoiseTexture: { value: noiseTexture },
      diffuse: { value: new THREE.Color("#10b981") },
      opacity: { value: 0.25 },
      interpolation: { value: 0.25 },
    }),
    [noiseTexture],
  );

  useFrame((state, delta) => {
    let normalizedMid = 0;

    if (analyser && dataArray.length > 0) {
      analyser.getByteFrequencyData(dataArray);
      let midSum = 0;
      const startBin = 20;
      const endBin = 80;
      for (let i = startBin; i < endBin; i++) {
        midSum += dataArray[i];
      }
      normalizedMid = midSum / (endBin - startBin) / 255;
    }

    // A. Particle Update
    if (particleMaterialRef.current) {
      particleMaterialRef.current.uniforms.time.value = state.clock.elapsedTime;
      particleMaterialRef.current.uniforms.amplitude.value =
        0.3 + normalizedMid * 2.2;
      particleMaterialRef.current.uniforms.timeX.value =
        0.05 + normalizedMid * 0.3;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y -= delta * 0.02;
    }

    // B. 3D Boulder Update
    if (instancedMeshRef.current && largeRocks.length > 0) {
      largeRocks.forEach((rock, i) => {
        rock.angle -= delta * rock.speed * 0.4;

        const localWobble = normalizedMid * 0.4;
        const radiusWithWobble =
          rock.radius +
          Math.sin(state.clock.elapsedTime * 2.5 + rock.seedX) * localWobble;

        const x = Math.cos(rock.angle) * radiusWithWobble;
        const z = Math.sin(rock.angle) * radiusWithWobble;
        const y =
          rock.yOffset +
          Math.cos(state.clock.elapsedTime * 2.0 + rock.seedY) * localWobble;

        dummy.position.set(x, y, z);
        dummy.scale.setScalar(rock.size);

        dummy.rotation.x += delta * rock.rotationSpeed;
        dummy.rotation.y += delta * rock.rotationSpeed * 0.5;

        dummy.updateMatrix();
        instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (rockMaterialRef.current) {
      rockMaterialRef.current.emissiveIntensity = 0.1 + normalizedMid * 5.0;
    }
  });

  return (
    <group rotation={[Math.PI / 4, 0, 0.2]}>
      {/* LAYER A: Particle Debris Cloud (Only renders if count > 0) */}
      {dynamicParticleCount > 0 && (
        <points ref={pointsRef} geometry={particleGeometry}>
          <shaderMaterial
            ref={particleMaterialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={particleUniforms}
            transparent={true}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* LAYER B: Chunky 3D Glowing Boulder Swarm (Allocates matching count size) */}
      {dynamicRockCount > 0 && (
        <instancedMesh
          ref={instancedMeshRef}
          args={[null as any, null as any, dynamicRockCount]}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            ref={rockMaterialRef}
            color="#1e293b"
            emissive="#34d399"
            emissiveIntensity={0.2}
            flatShading={true}
            roughness={0.8}
            metalness={0.2}
          />
        </instancedMesh>
      )}
    </group>
  );
}
