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

  // precomputed sphere (NO ALLOCATION IN LOOP)
  const targetSphere = useRef(new THREE.Sphere());
  const tempVec = new THREE.Vector3();

  // BUILD BVH ONCE
  useEffect(() => {
    scenes.forEach((scene) => {
      scene.traverse((child: any) => {
        if (child.isMesh) {
          child.material = new THREE.MeshBasicMaterial({
            color: "red",
            transparent: true,
            opacity: 0,
          });

          if (!child.geometry.boundsTree) {
            child.geometry.computeBoundsTree();
          }
        }
      });
    });
  }, [scenes]);

  // STABLE FRAME LOOP
  useFrame(() => {
    if (!targetRef.current) return;

    const target = targetRef.current;
    target.updateWorldMatrix(true, false);

    // STEP 1: FAST BROAD PHASE

    target.getWorldPosition(tempVec);

    targetSphere.current.center.copy(tempVec);
    targetSphere.current.radius = 8; // tune this to plane size

    let inside = false;

    // STEP 2: HITBOX CHECK

    for (const group of groupRefs.current) {
      if (!group) continue;

      group.updateWorldMatrix(true, true);

      // cheap bounding sphere per group
      const groupBox = new THREE.Box3().setFromObject(group);
      const groupSphere = groupBox.getBoundingSphere(new THREE.Sphere());

      // quick reject (VERY IMPORTANT)
      if (!targetSphere.current.intersectsSphere(groupSphere)) continue;

      // STEP 3: BVH CONFIRMATION
      group.traverse((child: any) => {
        if (!child.isMesh || !child.geometry?.boundsTree) return;

        const bvh = child.geometry.boundsTree;

        const invMatrix = new THREE.Matrix4().copy(child.matrixWorld).invert();

        const localSphere = targetSphere.current.clone();
        localSphere.applyMatrix4(invMatrix);

        if (bvh.intersectsSphere(localSphere)) {
          inside = true;
        }
      });

      if (inside) break;
    }

    inHitboxRef.current = inside;

    if (inside) {
      PLANE_CONFIG.SPEEDS.IDLE = 0.15;
      //console.log("INSIDE HITBOX");
    } else {
      PLANE_CONFIG.SPEEDS.IDLE = 0.45;
    }
  });

  // TRIGGERS
  useEffect(() => {
    if (triggerInteract && inHitboxRef.current) {
      navigate("/");
    }
  }, [triggerInteract, navigate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "e" && inHitboxRef.current) {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // RENDER
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
