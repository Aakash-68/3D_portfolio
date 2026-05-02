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
  joystick?: { x: number; y: number } | null;
}

export const PLANE_CONFIG = {
  BASE_SPEED: 0.45,

  SPEEDS: {
    FORWARD: 0.7,
    CRUISE: 0.6,
    IDLE: 0.35,
    SLOW: 0.15,
    BOOST: 1.2,
  },
};
const PLANE_HEIGHT = -11;
const BASE = (import.meta as any).env.BASE_URL;

const Plane = forwardRef<THREE.Group, Props>(
  ({ config, isLocked = false, joystick }, ref) => {
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

    useFrame((_, delta) => {
      if (!groupRef.current || isLocked) return;

      const usingJoystick = joystick != null;
      const jx = joystick?.x ?? 0;
      const jy = joystick?.y ?? 0;

      // =========================
      // INPUT LOGIC
      // =========================
      const isForward = usingJoystick
        ? jy < -0.2
        : keys.current["KeyW"] || keys.current["ArrowUp"];

      const isSlow = usingJoystick
        ? jy > 0.2
        : keys.current["KeyS"] || keys.current["ArrowDown"];

      const isLeft = usingJoystick
        ? jx < -0.2
        : keys.current["KeyA"] || keys.current["ArrowLeft"];

      const isRight = usingJoystick
        ? jx > 0.2
        : keys.current["KeyD"] || keys.current["ArrowRight"];

      const isBoost = keys.current["ShiftLeft"] || keys.current["ShiftRight"];
      // =========================
      // SPEED SYSTEM (FIXED STATES)
      // =========================
      let speedMultiplier = PLANE_CONFIG.SPEEDS.CRUISE;

      if (usingJoystick) {
        const forwardAxis = -jy;

        if (forwardAxis > 0.1) speedMultiplier = PLANE_CONFIG.SPEEDS.FORWARD;
        else if (forwardAxis < -0.1) speedMultiplier = PLANE_CONFIG.SPEEDS.SLOW;
        else speedMultiplier = PLANE_CONFIG.SPEEDS.IDLE;
      } else {
        if (isBoost) {
          speedMultiplier = PLANE_CONFIG.SPEEDS.BOOST;
        } else if (isSlow) {
          speedMultiplier = PLANE_CONFIG.SPEEDS.SLOW;
        } else if (!isForward) {
          speedMultiplier = PLANE_CONFIG.SPEEDS.IDLE;
        } else if (isForward) {
          speedMultiplier = PLANE_CONFIG.SPEEDS.FORWARD;
        }
      }

      const targetSpeed = PLANE_CONFIG.BASE_SPEED * speedMultiplier;

      currentSpeed.current = THREE.MathUtils.lerp(
        currentSpeed.current,
        targetSpeed,
        0.05,
      );

      // TURN SYSTEM
      let targetTurn = 0;

      if (usingJoystick) {
        targetTurn = -jx * config.turnAmount;
      } else {
        if (isLeft) targetTurn = config.turnAmount;
        if (isRight) targetTurn = -config.turnAmount;
      }

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

      // =========================
      // ORIENTATION UPDATE
      // =========================
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
