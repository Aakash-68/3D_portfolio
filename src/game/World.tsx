import React, { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import Hitbox from "./Hitbox";

interface Config {
  globeRotationSpeed: number;
}

interface Props {
  config: Config;
  playerRef: React.RefObject<THREE.Object3D>; // 👈 IMPORTANT
}

export const GLOBE_RADIUS = 50;

export default function World({ config, playerRef }: Props) {
  const globeRef = useRef<THREE.Group>(null!);
  const visualGlobeRef = useRef<THREE.Group>(null!);

  const { scene, animations } = useGLTF("/src/assets/models/globe.glb");
  const { actions } = useAnimations(animations, visualGlobeRef);

  // Make globe matte
  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material.metalness = 0;
          child.material.roughness = 1;
          child.material.envMapIntensity = 0;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  // Play animations
  useEffect(() => {
    if (actions) {
      Object.values(actions).forEach((action) => {
        action?.reset().play();
      });
    }
  }, [actions]);

  return (
    <group ref={globeRef} position={[0, 0, 0]}>
      {/* Invisible physics globe */}
      <mesh receiveShadow>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* Visual globe */}
      <group ref={visualGlobeRef} scale={32}>
        <primitive object={scene} />
      </group>

      {/* 🔥 Separate Hitbox */}
      <Hitbox targetRef={playerRef} scale={32} />
    </group>
  );
}
