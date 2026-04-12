import React, { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useNavigate } from "react-router-dom";

interface Props {
  targetRef: React.RefObject<THREE.Object3D>;
  triggerInteract?: boolean;
}

const HITBOXES = [
  {
    path: "/src/assets/models/hitBox.glb",
    position: [0, 0, 0] as [number, number, number],
    scale: 32,
  },
];

export default function Hitbox({ targetRef, triggerInteract }: Props) {
  const groupRefs = useRef<THREE.Group[]>([]);
  const navigate = useNavigate();
  const [inHitbox, setInHitbox] = useState(false);

  const scenes = HITBOXES.map((hb) => useGLTF(hb.path).scene);

  useEffect(() => {
    scenes.forEach((scene) => {
      scene.traverse((child: any) => {
        if (child.isMesh) {
          child.material = new THREE.MeshBasicMaterial({
            color: "red",
            transparent: true,
            opacity: 0.15,
          });
        }
      });
    });
  }, [scenes]);

  useFrame(() => {
    if (!targetRef.current) return;

    const targetBox = new THREE.Box3().setFromObject(targetRef.current);

    let hit = false;

    for (let i = 0; i < groupRefs.current.length; i++) {
      const ref = groupRefs.current[i];
      if (!ref) continue;

      const box = new THREE.Box3().setFromObject(ref);

      if (box.intersectsBox(targetBox)) {
        hit = true;
        break;
      }
    }

    setInHitbox(hit);
  });

  //mobile trigger
  useEffect(() => {
    if (triggerInteract && inHitbox) {
      navigate("/");
    }
  }, [triggerInteract, inHitbox, navigate]);

  //keyboard trigger
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
    <>
      {HITBOXES.map((hb, index) => (
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
