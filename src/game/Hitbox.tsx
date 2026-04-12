import { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface HitboxProps {
  object: THREE.Object3D;
  playerRef: React.RefObject<THREE.Object3D>;
  onInteract: () => void;
  debug?: boolean;
}

export default function Hitbox({
  object,
  playerRef,
  onInteract,
  debug = false,
}: HitboxProps) {
  const hitboxRef = useRef<THREE.Group>(null!);
  const [inHitbox, setInHitbox] = useState(false);

  const clonedObject = useMemo(() => object.clone(true), [object]);

  useEffect(() => {
    if (!debug) return;

    clonedObject.traverse((child: any) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: "red",
          transparent: true,
          opacity: 0.15,
        });
      }
    });
  }, [clonedObject, debug]);

  // Collision detection
  useFrame(() => {
    if (!hitboxRef.current || !playerRef.current) return;

    const hitboxBox = new THREE.Box3().setFromObject(hitboxRef.current);
    const playerBox = new THREE.Box3().setFromObject(playerRef.current);

    setInHitbox(hitboxBox.intersectsBox(playerBox));
  });

  // Key press
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "e" && inHitbox) {
        onInteract();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [inHitbox, onInteract]);

  return (
    <group ref={hitboxRef}>
      <primitive object={clonedObject} />
    </group>
  );
}
