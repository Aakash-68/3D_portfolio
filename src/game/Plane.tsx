import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { GLOBE_RADIUS } from "./World";

interface Config {
  forwardSpeed: number;
  slowSpeed: number;
  turnAmount: number;
  rollAmount: number;
}

interface Props {
  config: Config;
  isLocked?: boolean;
}

const PLANE_HEIGHT = -11;
const BASE = (import.meta as any).env.BASE_URL;

const Plane = forwardRef<THREE.Group, Props>(
  ({ config, isLocked = false }, ref) => {
    const groupRef = useRef<THREE.Group>(null!);
    const meshRef = useRef<THREE.Group>(null!);

    const { scene, animations } = useGLTF(BASE + "/assets/models/plane.glb");
    const { actions } = useAnimations(animations, meshRef);

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

    useImperativeHandle(ref, () => groupRef.current);

    const keys = useRef<{ [key: string]: boolean }>({});

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        keys.current[e.code] = true;
      };
      const handleKeyUp = (e: KeyboardEvent) => {
        keys.current[e.code] = false;
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, []);

    useEffect(() => {
      if (actions) {
        Object.values(actions).forEach((action) => {
          action?.reset().play();
        });
      }
    }, [actions]);

    const orientation = useRef(new THREE.Quaternion());
    const currentRoll = useRef(0);
    const currentTurn = useRef(0);
    const currentSpeed = useRef(0);

    useFrame((state, delta) => {
      if (!groupRef.current) return;
      if (isLocked) return;

      const isForward = keys.current["KeyW"] || keys.current["ArrowUp"];
      const isSlow = keys.current["KeyS"] || keys.current["ArrowDown"];
      const isLeft = keys.current["KeyA"] || keys.current["ArrowLeft"];
      const isRight = keys.current["KeyD"] || keys.current["ArrowRight"];

      const baseSpeed = 0.45;
      let targetSpeed = baseSpeed;

      if (isSlow) targetSpeed = baseSpeed * 0.15;
      else if (!isForward) targetSpeed = baseSpeed * 0.35;

      currentSpeed.current = THREE.MathUtils.lerp(
        currentSpeed.current,
        targetSpeed,
        0.05,
      );

      let targetTurn = 0;
      if (isLeft) targetTurn = config.turnAmount;
      if (isRight) targetTurn = -config.turnAmount;

      currentTurn.current = THREE.MathUtils.lerp(
        currentTurn.current,
        targetTurn,
        0.08,
      );

      const targetRoll = targetTurn * 2 * 10 * -1;

      currentRoll.current = THREE.MathUtils.lerp(
        currentRoll.current,
        targetRoll,
        0.05,
      );

      const turnQuat = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        currentTurn.current,
      );
      orientation.current.multiply(turnQuat);

      const forwardQuat = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        currentSpeed.current / GLOBE_RADIUS,
      );
      orientation.current.multiply(forwardQuat);

      groupRef.current.quaternion.copy(orientation.current);

      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(
        orientation.current,
      );

      groupRef.current.position.copy(
        up.multiplyScalar(GLOBE_RADIUS + PLANE_HEIGHT),
      );

      if (meshRef.current) {
        meshRef.current.rotation.z = currentRoll.current;
      }
    });

    return (
      <group ref={groupRef}>
        <group ref={meshRef} scale={0.3}>
          <primitive object={scene} />
        </group>
      </group>
    );
  },
);

export default Plane;
