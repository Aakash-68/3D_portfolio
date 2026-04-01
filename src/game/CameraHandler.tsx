import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  planeRef: React.RefObject<THREE.Group>;
  mode: "follow" | "dev";
}

export default function CameraHandler({ planeRef, mode }: Props) {
  const { camera } = useThree();
  const followCamRef = useRef<THREE.PerspectiveCamera>(null!);

  // Follow camera settings (inspired by the C# script)
  const offset = new THREE.Vector3(0, 7.5, -6); // Behind and above
  const lookAtOffset = new THREE.Vector3(0, 0, 2); // Look slightly ahead

  useFrame((state, delta) => {
    if (mode === "follow" && planeRef.current) {
      const plane = planeRef.current;

      // Calculate world position for camera
      const idealOffset = offset.clone().applyQuaternion(plane.quaternion);
      const targetPos = plane.position.clone().add(idealOffset);

      // Smoothly move camera
      camera.position.lerp(targetPos, 0.1);

      // Calculate look target
      const idealLookAt = lookAtOffset
        .clone()
        .applyQuaternion(plane.quaternion);
      const targetLookAt = plane.position.clone().add(idealLookAt);

      camera.lookAt(targetLookAt);

      // Up vector should be the gravity up (normalized plane position)
      const gravityUp = plane.position.clone().normalize();
      camera.up.lerp(gravityUp, 0.1);
    }
  });

  return (
    <>
      {mode === "dev" && (
        <OrbitControls
          makeDefault
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      )}

      <PerspectiveCamera
        makeDefault={mode === "follow"}
        position={[0, 15, 20]}
        fov={75}
      />
    </>
  );
}
