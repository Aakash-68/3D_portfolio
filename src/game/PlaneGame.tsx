import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

import Plane from "./Plane";
import World from "./World";
import CameraHandler from "./CameraHandler";
import StableSky from "./StableSky";
import { LoadingScreen } from "../components/LoadingScreen";

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
}

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

export default function PlaneGame({ config }: Props) {
  const planeRef = useRef<THREE.Group>(null!);
  const [started, setStart] = useState(false);

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows={false}
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <StableSky />
          <Environment preset="sunset" environmentIntensity={0.3} />
          <CameraLight />
          <ambientLight intensity={1} />
          <Plane ref={planeRef} config={config} />
          <World config={config} playerRef={planeRef} />{" "}
          <CameraHandler planeRef={planeRef} mode={config.cameraMode} />
        </Suspense>
      </Canvas>

      {/* Loading Screen Overlay */}
      {!started && (
        <div className="absolute inset-0 z-50">
          <LoadingScreen started={started} onStarted={() => setStart(true)} />
        </div>
      )}
    </div>
  );
}
