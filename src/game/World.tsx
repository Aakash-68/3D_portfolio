import React, { useRef, useEffect, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useNavigate } from "react-router-dom"; // for navigation

interface Config {
  globeRotationSpeed: number;
}

interface Props {
  config: Config;
}

export const GLOBE_RADIUS = 50;

export default function World({ config }: Props) {
  const globeRef = useRef<THREE.Group>(null!);
  const visualGlobeRef = useRef<THREE.Group>(null!);
  const hitboxRef = useRef<THREE.Group>(null!);

  const [inHitbox, setInHitbox] = useState(false);
  const navigate = useNavigate();

  // Load MAIN globe
  const { scene, animations } = useGLTF("/src/assets/models/globe.glb");
  const { actions } = useAnimations(animations, visualGlobeRef);

  // Load HITBOX globe
  const { scene: hitboxScene } = useGLTF("/src/assets/models/hitBox.glb");

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

  // Configure hitbox material
  useEffect(() => {
    hitboxScene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;

        child.material = new THREE.MeshBasicMaterial({
          color: "red",
          wireframe: false,
          transparent: true,
          opacity: 0.15,
        });
      }
    });
  }, [hitboxScene]);

  // Play animations if any exist
  useEffect(() => {
    if (actions) {
      Object.values(actions).forEach((action) => {
        action?.reset().play();
      });
    }
  }, [actions]);

  // --- HITBOX DETECTION ---
  useFrame(() => {
    if (!hitboxRef.current || !globeRef.current) return;

    // Compute bounding boxes
    const hitboxBox = new THREE.Box3().setFromObject(hitboxRef.current);
    const planeBox = new THREE.Box3().setFromObject(globeRef.current); // replace with your plane ref if you have one

    // Check intersection
    const intersecting = hitboxBox.intersectsBox(planeBox);
    setInHitbox(intersecting);
  });

  // Keyboard listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "e" && inHitbox) {
        navigate("/"); // redirect to root page
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [inHitbox, navigate]);

  return (
    <group ref={globeRef} position={[0, 0, 0]}>
      {/* INVISIBLE LOGIC GLOBE */}
      <mesh receiveShadow>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>

      {/* VISUAL GLB GLOBE */}
      <group ref={visualGlobeRef} scale={32}>
        <primitive object={scene} />
      </group>

      {/* HITBOX OVERLAY */}
      <group ref={hitboxRef} scale={32}>
        <primitive object={hitboxScene} />
      </group>
    </group>
  );
}
