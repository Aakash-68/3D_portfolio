import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { GLOBE_RADIUS } from "../game/World";

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
  boost?: boolean;
  onMove: (pos: { x: number; y: number } | null) => void;
}

const PLANE_HEIGHT = -11;

const Plane = forwardRef<THREE.Group, Props>(
  ({ config, isLocked = false, joystick, boost }, ref) => {
    const groupRef = useRef<THREE.Group>(null!);
    const meshRef = useRef<THREE.Group>(null!);

    const { scene, animations } = useGLTF("/src/assets/models/plane.glb");
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
      const down = (e: KeyboardEvent) => (keys.current[e.code] = true);
      const up = (e: KeyboardEvent) => (keys.current[e.code] = false);

      window.addEventListener("keydown", down);
      window.addEventListener("keyup", up);

      return () => {
        window.removeEventListener("keydown", down);
        window.removeEventListener("keyup", up);
      };
    }, []);

    useEffect(() => {
      if (actions) {
        Object.values(actions).forEach((a) => a?.reset().play());
      }
    }, [actions]);

    const orientation = useRef(new THREE.Quaternion());
    const currentRoll = useRef(0);
    const currentTurn = useRef(0);
    const currentSpeed = useRef(0);

    useFrame((_, delta) => {
      if (!groupRef.current || isLocked) return;

      const jx = joystick?.x ?? 0;
      const jy = joystick?.y ?? 0;

      const isForward = joystick ? jy < -0.2 : keys.current["KeyW"];
      const isSlow = joystick ? jy > 0.2 : keys.current["KeyS"];
      const isLeft = joystick ? jx < -0.2 : keys.current["KeyA"];
      const isRight = joystick ? jx > 0.2 : keys.current["KeyD"];

      const baseSpeed = 0.45;
      let targetSpeed = baseSpeed;

      if (joystick) {
        targetSpeed = baseSpeed * (1 + -jy); // analog forward/back
      } else {
        if (boost) targetSpeed = baseSpeed * 1.8;
        else if (isSlow) targetSpeed = baseSpeed * 0.15;
        else if (!isForward) targetSpeed = baseSpeed * 0.35;
      }

      currentSpeed.current = THREE.MathUtils.lerp(
        currentSpeed.current,
        targetSpeed,
        0.05,
      );

      let targetTurn = 0;

      if (joystick) {
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
