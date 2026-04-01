import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Character (Plane) Component
function Character({ position, onPositionChange, onRotationChange }) {
  const groupRef = useRef();
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
  });

  const velocity = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3(...position));
  const currentRotation = useRef(Math.PI / 2);
  const targetRotation = useRef(Math.PI / 2);
  const currentTilt = useRef(0);
  const targetTilt = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': setMovement(m => ({ ...m, forward: true })); break;
        case 'KeyS': setMovement(m => ({ ...m, backward: true })); break;
        case 'KeyA': setMovement(m => ({ ...m, left: true })); break;
        case 'KeyD': setMovement(m => ({ ...m, right: true })); break;
        case 'ShiftLeft': setMovement(m => ({ ...m, run: true })); break;
      }
    };
    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': setMovement(m => ({ ...m, forward: false })); break;
        case 'KeyS': setMovement(m => ({ ...m, backward: false })); break;
        case 'KeyA': setMovement(m => ({ ...m, left: false })); break;
        case 'KeyD': setMovement(m => ({ ...m, right: false })); break;
        case 'ShiftLeft': setMovement(m => ({ ...m, run: false })); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const speed = movement.run ? 8 : 4;
    const rotationSpeed = 1.5;
    const maxTilt = 0.5;

    // Yaw & Roll
    if (movement.left) {
      targetRotation.current += rotationSpeed * delta;
      targetTilt.current = -maxTilt;
    }
    if (movement.right) {
      targetRotation.current -= rotationSpeed * delta;
      targetTilt.current = maxTilt;
    }
    if (!movement.left && !movement.right) {
      targetTilt.current = 0;
    }

    // Smooth interpolation
    currentRotation.current = THREE.MathUtils.lerp(
      currentRotation.current,
      targetRotation.current,
      0.1
    );
    currentTilt.current = THREE.MathUtils.lerp(
      currentTilt.current,
      targetTilt.current,
      0.15
    );

    // Forward movement
    velocity.current.set(0, 0, 0);
    const baseSpeed = 2;
    let forwardSpeed = baseSpeed;
    if (movement.forward) forwardSpeed += speed;
    if (movement.backward) forwardSpeed *= 0.6;

    velocity.current.x = Math.sin(currentRotation.current) * forwardSpeed * delta;
    velocity.current.z = Math.cos(currentRotation.current) * forwardSpeed * delta;

    currentPosition.current.add(velocity.current);

    // 🔒 Limit Distance Constraint (mimicking Blender)
    const globeCenter = new THREE.Vector3(0, -190, 0); // Globe's position
    const globeRadius = 210; // Globe geometry radius
    const limitDistance = globeRadius ;

    const distToGlobe = currentPosition.current.distanceTo(globeCenter);

    if (distToGlobe > limitDistance) {
      const direction = currentPosition.current.clone().sub(globeCenter).normalize();
      currentPosition.current.copy(direction.multiplyScalar(limitDistance).add(globeCenter));
    }

    // Apply transform
    if (groupRef.current) {
      groupRef.current.position.copy(currentPosition.current);
      groupRef.current.rotation.set(0, currentRotation.current, currentTilt.current);

      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);
      onPositionChange(worldPos);
      onRotationChange(currentRotation.current);
    }
  });

  return (
    <group ref={groupRef} position={currentPosition.current}>
      {/* Plane Body */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[5, 1.2, 1]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 1.1, -2]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[1, 0.5, 1]} />
        <meshStandardMaterial color="grey" />
      </mesh>
      {/* Wings */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <boxGeometry args={[5, 0.3, 0.5]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </group>
  );
}

// Third-person camera
function ThirdPersonCamera({ target, targetRotation }) {
  const { camera } = useThree();

  useFrame(() => {
    if (!target) return;

    const distance = 25;
    const height = 15;

    const offsetX = Math.sin(targetRotation) * -distance;
    const offsetZ = Math.cos(targetRotation) * -distance;

    camera.position.set(
      target.x + offsetX,
      target.y + height,
      target.z + offsetZ
    );

    camera.lookAt(target);
  });

  return null;
}

// Globe (Planet)
function Globe() {
  const globeRef = useRef();

  

  return (
    <group ref={globeRef} position={[0, -190, 0]}>
      <mesh receiveShadow>
        <sphereGeometry args={[200, 64, 64]} />
        <meshStandardMaterial color="#3daee9" wireframe roughness={1} metalness={0} />
      </mesh>

      {/* Optional: Visualize constraint limit */}
      <mesh>
        <sphereGeometry args={[210, 64, 64]} />
        <meshBasicMaterial color="white" wireframe transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function Lighting() {
  return (
    <>
      <hemisphereLight args={['#b3e5ff', '#2b3a50', 0.8]} />
      <directionalLight
        position={[50, 100, 50]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={200}
      />
      <ambientLight intensity={0.2} />
    </>
  );
}

function Scene() {
  const [characterPosition, setCharacterPosition] = useState(new THREE.Vector3(0, 10, 0));
  const [characterRotation, setCharacterRotation] = useState(Math.PI / 2);

  return (
    <>
      <ThirdPersonCamera target={characterPosition} targetRotation={characterRotation} />
      <Lighting />
      <Globe />
      <Character
        position={[0, 10, 0]}
        onPositionChange={(pos) => setCharacterPosition(pos.clone())}
        onRotationChange={(rot) => setCharacterRotation(rot)}
      />
      <Text position={[0, 25, -12]} fontSize={0.8} color="white" anchorX="center" anchorY="middle">
        W/S: Forward/Back • A/D: Turn & Tilt • Shift: Run
      </Text>
    </>
  );
}

export default function Home() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(to bottom, #4da6ff 10%, #66ccff 30%, #99e6ff 80%)' }}>
      <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }} gl={{ antialias: true }}>
        <Scene />
      </Canvas>
    </div>
  );
}
