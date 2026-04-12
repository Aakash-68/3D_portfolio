import React, { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import Hitbox from "./Hitbox";

interface Config {
  globeRotationSpeed: number;
}

interface Props {
  config: Config;
  playerRef: React.RefObject<THREE.Object3D>;
  triggerInteract?: boolean;
}

export const GLOBE_RADIUS = 50;

export default function World({ config, playerRef, triggerInteract }: Props) {
  const globeRef = useRef<THREE.Group>(null!);
  const visualGlobeRef = useRef<THREE.Group>(null!);

  const { scene, animations } = useGLTF("/src/assets/models/globe.glb");
  const { actions } = useAnimations(animations, visualGlobeRef);

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

  useEffect(() => {
    if (actions) {
      Object.values(actions).forEach((a) => a?.reset().play());
    }
  }, [actions]);

  return (
    <group ref={globeRef}>
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      <group ref={visualGlobeRef} scale={32}>
        <primitive object={scene} />
      </group>

      <Hitbox targetRef={playerRef} triggerInteract={triggerInteract} />
    </group>
  );
}
