import React, { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useNavigate } from "react-router-dom";

interface Props {
  targetRef: React.RefObject<THREE.Object3D>; // plane or player
  scale?: number;
}

export default function Hitbox({ targetRef, scale = 32 }: Props) {
  const hitboxRef = useRef<THREE.Group>(null!);
  const { scene: hitboxScene } = useGLTF("/src/assets/models/hitBox.glb");

  const [inHitbox, setInHitbox] = useState(false);
  const navigate = useNavigate();

  // Configure material
  useEffect(() => {
    hitboxScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: "red",
          transparent: true,
          opacity: 0.15,
        });
      }
    });
  }, [hitboxScene]);

  // Collision detection
  useFrame(() => {
    if (!hitboxRef.current || !targetRef.current) return;

    const hitboxBox = new THREE.Box3().setFromObject(hitboxRef.current);
    const targetBox = new THREE.Box3().setFromObject(targetRef.current);

    const intersecting = hitboxBox.intersectsBox(targetBox);
    setInHitbox(intersecting);
  });

  // Interaction (press E)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "e" && inHitbox) {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [inHitbox, navigate]);

  return (
    <group ref={hitboxRef} scale={scale}>
      <primitive object={hitboxScene} />
    </group>
  );
}
