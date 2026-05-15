// src/game/PlaneGame.tsx
import React, { Suspense, useRef, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

import Plane from "./Plane";
import World from "./World";
import CameraHandler from "./MapHandler/CameraHandler";
import StableSky from "./StableSky";
import Words from "./Words";
import { LoadingScreen } from "../components/LoadingScreen";
import ControlsUI from "./../components/ControlsUI";
import PipCameraPanel from "./MapHandler/PIPcameraPanel";

interface Config {
  globeRotationSpeed: number;
  forwardSpeed: number;
  slowSpeed: number;
  turnAmount: number;
  rollAmount: number;
  cameraMode: "follow" | "dev";
}

interface Props {
  config: Config;
  joystick?: { x: number; y: number } | null;
  triggerInteract?: boolean;
}

// ── Directional light that tracks the camera position ────────────────────────
function CameraLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  const targetRef = useRef<THREE.Object3D>(new THREE.Object3D());

  useFrame(({ camera }) => {
    if (!lightRef.current) return;
    lightRef.current.position.copy(camera.position);
    const forward = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(camera.quaternion)
      .multiplyScalar(200);
    targetRef.current.position.copy(camera.position).add(forward);
    lightRef.current.target = targetRef.current;
    targetRef.current.updateMatrixWorld();
  });

  return (
    <>
      <primitive object={targetRef.current} />
      <directionalLight ref={lightRef} intensity={0.8} />
    </>
  );
}

// ── Main game component ───────────────────────────────────────────────────────
export default function PlaneGame({
  config,
  joystick,
  triggerInteract,
}: Props) {
  const planeRef = useRef<THREE.Group>(null!);
  const [started, setStart] = useState(false);
  const [activeHitboxIndex, setActiveHitboxIndex] = useState(-1);

  const handleHitboxStateChange = useCallback((idx: number) => {
    setActiveHitboxIndex(idx);
  }, []);

  return (
    <div className="w-full h-full relative">
      {/* ── Primary 3-D canvas ─────────────────────────────────────────────── */}
      <Canvas
        shadows={false}
        camera={{ near: 0.1, far: 10000, fov: 75 }}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
          logarithmicDepthBuffer: true,
        }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <StableSky />
          <Environment preset="sunset" environmentIntensity={0.3} />
          <CameraLight />
          <ambientLight intensity={1} />
          <Plane ref={planeRef} config={config} joystick={joystick} />
          <World
            config={config}
            playerRef={planeRef}
            triggerInteract={triggerInteract}
            onHitboxStateChange={handleHitboxStateChange}
          />
          <Words />
          <CameraHandler planeRef={planeRef} mode={config.cameraMode} />
        </Suspense>
      </Canvas>

      {/* ── HUD overlays ───────────────────────────────────────────────────── */}
      <PipCameraPanel
        planeRef={planeRef}
        activeHitboxIndex={activeHitboxIndex}
      />
      <ControlsUI />
      {/* ── Loading screen ─────────────────────────────────────────────────── */}
      {!started && (
        <div className="absolute inset-0 z-50">
          <LoadingScreen started={started} onStarted={() => setStart(true)} />
        </div>
      )}
    </div>
  );
}
