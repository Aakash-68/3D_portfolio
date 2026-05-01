import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useNavigate } from "react-router-dom";

interface Props {
  targetRef: React.RefObject<THREE.Object3D>;
  triggerInteract?: boolean;
}

const BASE = (import.meta as any).env.BASE_URL;

const HITBOXES = [
  {
    path: BASE + "/assets/models/hitBox.glb",
    position: [0, 0, 0] as [number, number, number],
    scale: 32,
  },
];

export default function Hitbox({ targetRef, triggerInteract }: Props) {
  const groupRefs = useRef<THREE.Group[]>([]);
  const navigate = useNavigate();

  const raycaster = useRef(new THREE.Raycaster());
  const direction = useRef(new THREE.Vector3());
  const origin = useRef(new THREE.Vector3());

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
          child.userData.raycastable = true; // mark for clarity
        }
      });
    });
  }, [scenes]);

  let inHitboxRef = useRef(false);

  useFrame(() => {
    if (!targetRef.current) return;

    const origin = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();

    targetRef.current.getWorldPosition(origin);
    targetRef.current.getWorldDirection(forward);

    // build right & up vectors from forward
    right.crossVectors(forward, targetRef.current.up).normalize();
    up.copy(targetRef.current.up).normalize();

    const raycaster = new THREE.Raycaster();
    raycaster.far = 5;

    const directions = [
      forward.clone(), // front
      forward.clone().add(right.clone().multiplyScalar(0.5)), // front-right
      forward.clone().add(right.clone().multiplyScalar(-0.5)), // front-left
      forward.clone().add(up.clone().multiplyScalar(0.4)), // up
      forward.clone().add(up.clone().multiplyScalar(-0.4)), // down
    ];

    const meshes: THREE.Mesh[] = [];

    groupRefs.current.forEach((group) => {
      if (!group) return;
      group.traverse((child: any) => {
        if (child.isMesh) meshes.push(child);
      });
    });

    let hit = false;

    for (const dir of directions) {
      raycaster.set(origin, dir.normalize());

      const hits = raycaster.intersectObjects(meshes, true);

      if (hits.length > 0) {
        hit = true;
        break;
      }
    }

    inHitboxRef.current = hit;

    if (hit) {
      console.log("multi-ray hit");
    }
  });
  // mobile trigger
  useEffect(() => {
    if (triggerInteract && inHitboxRef.current) {
      navigate("/");
    }
  }, [triggerInteract, navigate]);

  // keyboard trigger
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "e" && inHitboxRef.current) {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

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
