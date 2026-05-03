import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";

const BASE = (import.meta as any).env.BASE_URL;

const WORDS = [
  {
    path: BASE + "/assets/models/Word/Contact.glb",
    position: [0, 0, 0] as any,
    scale: 32,
  },
  {
    path: BASE + "/assets/models/Word/About.glb",
    position: [0, 0, 0] as any,
    scale: 32,
  },
  {
    path: BASE + "/assets/models/Word/project.glb",
    position: [0, 0, 0] as any,
    scale: 32,
  },
];

export default function Words() {
  const groupRefs = useRef<THREE.Group[]>([]);
  const navigate = useNavigate();

  const scenes = WORDS.map((hb) => useGLTF(hb.path).scene);

  const inWordRef = useRef(false);

  useEffect(() => {
    scenes.forEach((scene) => {
      scene.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.metalness = 0;
            child.material.roughness = 1;
            child.material.envMapIntensity = 0;
            // Pull words in front of hitbox meshes to prevent Z-fighting
            child.material.polygonOffset = true;
            child.material.polygonOffsetFactor = -1;
            child.material.polygonOffsetUnits = -1;
            child.material.needsUpdate = true;
          }
        }
      });
    });
  }, [scenes]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "e" && inWordRef.current) {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      {WORDS.map((hb, index) => (
        <group
          key={index}
          ref={(el) => {
            if (el) groupRefs.current[index] = el;
          }}
          position={hb.position}
          scale={hb.scale}
        >
          <primitive object={scenes[index]} />
        </group>
      ))}
    </>
  );
}
