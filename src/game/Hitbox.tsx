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

export default function Hitbox({ config }: Props) {
  const globeRef = useRef<THREE.Group>(null!);
  const hitboxRef = useRef<THREE.Group>(null!);

  const [inHitbox, setInHitbox] = useState(false);
  const navigate = useNavigate();

  // Load HITBOX globe
  const { scene: hitboxScene } = useGLTF("/src/assets/models/hitBox.glb");

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
      {/* HITBOX OVERLAY */}
      <group ref={hitboxRef} scale={32}>
        <primitive object={hitboxScene} />
      </group>
    </group>
  );
}
