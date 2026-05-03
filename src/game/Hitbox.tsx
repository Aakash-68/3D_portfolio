import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useNavigate } from "react-router-dom";

import { PLANE_CONFIG } from "./Plane";

import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from "three-mesh-bvh";

THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree as any;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree as any;

interface Props {
  targetRef: React.RefObject<THREE.Object3D>;
  triggerInteract?: boolean;
}

const BASE = (import.meta as any).env.BASE_URL;

const HITBOXES = [
  {
    path: BASE + "/assets/models/hitbox/c_outer.glb",
    position: [0, 0, 0] as any,
    scale: 32,
  },
  {
    path: BASE + "/assets/models/hitbox/d_outer.glb",
    position: [0, 0, 0] as any,
    scale: 32,
  },
  {
    path: BASE + "/assets/models/hitbox/i_outer.glb",
    position: [0, 0, 0] as any,
    scale: 32,
  },
];

export default function Hitbox({ targetRef, triggerInteract }: Props) {
  const groupRefs = useRef<THREE.Group[]>([]);
  const navigate = useNavigate();

  const scenes = HITBOXES.map((hb) => useGLTF(hb.path).scene);

  const inHitboxRef = useRef(false);

  // Preallocated — never allocate inside useFrame
  const targetSphere = useRef(new THREE.Sphere());
  const tempVec = new THREE.Vector3();
  const tempBox = useRef(new THREE.Box3());
  const tempSphere = useRef(new THREE.Sphere());
  const tempMatrix = useRef(new THREE.Matrix4());
  const localSphere = useRef(new THREE.Sphere());

  // BUILD BVH ONCE
  useEffect(() => {
    scenes.forEach((scene) => {
      scene.traverse((child: any) => {
        if (child.isMesh) {
          child.material = new THREE.MeshBasicMaterial({
            color: "red",
            transparent: true,
            opacity: 0,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1,
          });

          if (!child.geometry.boundsTree) {
            child.geometry.computeBoundsTree();
          }
        }
      });
    });
  }, [scenes]);

  useFrame(() => {
    if (!targetRef.current) return;

    const target = targetRef.current;
    target.updateWorldMatrix(true, false);

    target.getWorldPosition(tempVec);
    targetSphere.current.center.copy(tempVec);
    targetSphere.current.radius = 8;

    let inside = false;

    for (const group of groupRefs.current) {
      if (!group) continue;

      group.updateWorldMatrix(true, true);

      // Reuse preallocated Box3 and Sphere for broad phase
      tempBox.current.setFromObject(group);
      tempBox.current.getBoundingSphere(tempSphere.current);

      // Quick reject
      if (!targetSphere.current.intersectsSphere(tempSphere.current)) continue;

      // BVH confirmation — reuse matrix and sphere
      group.traverse((child: any) => {
        if (!child.isMesh || !child.geometry?.boundsTree) return;

        const bvh = child.geometry.boundsTree;

        tempMatrix.current.copy(child.matrixWorld).invert();
        localSphere.current.copy(targetSphere.current);
        localSphere.current.applyMatrix4(tempMatrix.current);

        if (bvh.intersectsSphere(localSphere.current)) {
          inside = true;
        }
      });

      if (inside) break;
    }

    inHitboxRef.current = inside;

    if (inside) {
      PLANE_CONFIG.SPEEDS.IDLE = 0.15;
    } else {
      PLANE_CONFIG.SPEEDS.IDLE = 0.45;
    }
  });

  // Trigger from mobile button
  useEffect(() => {
    if (triggerInteract && inHitboxRef.current) {
      navigate("/");
    }
  }, [triggerInteract, navigate]);

  // Trigger from keyboard
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
