import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Constants
const GLOBE_RADIUS = 210;
const ALTITUDE = 10; // The plane should hover 10 units above the planet surface
const TOTAL_RADIUS = GLOBE_RADIUS + ALTITUDE;

function Character({ setCamTarget, setCamRotation }) {
  const groupRef = useRef();
  
  // Controls state
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
  });

  // Use References for physics state to avoid React re-renders on every frame
  // Start position: Top of the world
  const position = useRef(new THREE.Vector3(0, TOTAL_RADIUS, 0));
  // The plane's base quaternion (flat relative to the surface)
  const quaternion = useRef(new THREE.Quaternion(0, 0, 0, 1)); 
  const currentTilt = useRef(0);

  // Key handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': setMovement(m => ({ ...m, forward: true })); break;
        case 'KeyS': setMovement(m => ({ ...m, backward: true })); break;
        case 'KeyA': setMovement(m => ({ ...m, left: true })); break;
        case 'KeyD': setMovement(m => ({ ...m, right: true })); break;
        case 'ShiftLeft': setMovement(m => ({ ...m, boost: true })); break;
      }
    };
    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': setMovement(m => ({ ...m, forward: false })); break;
        case 'KeyS': setMovement(m => ({ ...m, backward: false })); break;
        case 'KeyA': setMovement(m => ({ ...m, left: false })); break;
        case 'KeyD': setMovement(m => ({ ...m, right: false })); break;
        case 'ShiftLeft': setMovement(m => ({ ...m, boost: false })); break;
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
    if (!groupRef.current) return;

    // 1. Settings
    const moveSpeed = movement.boost ? 25 : 15;
    const turnSpeed = 1.5;
    const tiltSpeed = 2.0;
    const maxTilt = 0.4; // Radians

    // 2. Handle Inputs & Tilt
    let targetTilt = 0;
    
    // Yaw (Turning Left/Right)
    // We rotate the object around its own LOCAL Y axis (which is the surface normal)
    if (movement.left) {
      const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), turnSpeed * delta);
      quaternion.current.multiply(qYaw);
      targetTilt = maxTilt; // Bank left
    }
    if (movement.right) {
      const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -turnSpeed * delta);
      quaternion.current.multiply(qYaw);
      targetTilt = -maxTilt; // Bank right
    }

    // Smoothly interpolate tilt
    currentTilt.current = THREE.MathUtils.lerp(currentTilt.current, targetTilt, tiltSpeed * delta);

    // 3. Handle Movement (Forward/Backward)
    // We rotate the position vector around the sphere center using the plane's Local Right vector as the axis.
    let speed = 0;
    if (movement.forward) speed = moveSpeed;
    if (movement.backward) speed = -moveSpeed * 0.5;

    if (speed !== 0) {
      // Calculate the axis to orbit around (The plane's local Right vector)
      // (1,0,0) is local Right. We apply current rotation to find it in World Space.
      const orbitAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion.current).normalize();
      
      // Calculate angle to move (Arc length formula: s = r * theta -> theta = s / r)
      const angle = (speed * delta) / TOTAL_RADIUS;
      
      // Create rotation quaternion for the orbit
      const qOrbit = new THREE.Quaternion().setFromAxisAngle(orbitAxis, -angle); 

      // Apply this rotation to the Position vector
      position.current.applyQuaternion(qOrbit);

      // Apply this rotation to the Plane's orientation so it stays flat to surface
      // We premultiply to apply the orbit rotation in World Space
      quaternion.current.premultiply(qOrbit);
    }

    // 4. Force Enforce Altitude (Drift Correction)
    // Ensure we are always exactly TOTAL_RADIUS away from center
    position.current.normalize().multiplyScalar(TOTAL_RADIUS);

    // 5. Apply Visuals
    groupRef.current.position.copy(position.current);
    
    // Combine structural rotation (quaternion) with visual tilt (qTilt)
    // We create a separate quaternion for the roll tilt (Rotation around local Z)
    const qTilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), currentTilt.current);
    const finalQuaternion = quaternion.current.clone().multiply(qTilt);
    
    groupRef.current.setRotationFromQuaternion(finalQuaternion);

    // 6. Update Camera Targets
    setCamTarget(position.current);
    // Pass the base quaternion (without tilt) to the camera for stable tracking
    setCamRotation(quaternion.current); 
  });

  return (
    <group ref={groupRef}>
      <axesHelper args={[2]} />
      
      {/* Visual Model */}
      <group>
        {/* Fuselage */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.5, 1, 4]} />
          <meshStandardMaterial color="#ffcc00" />
        </mesh>
        {/* Cockpit */}
        <mesh position={[0, 1, 0.5]}>
          <boxGeometry args={[1, 0.8, 2]} />
          <meshStandardMaterial color="#333" roughness={0.2} />
        </mesh>
        {/* Wings */}
        <mesh position={[0, 0.2, 0.5]}>
          <boxGeometry args={[6, 0.2, 1.5]} />
          <meshStandardMaterial color="#ff9900" />
        </mesh>
        {/* Tail */}
        <mesh position={[0, 1, -1.5]}>
          <boxGeometry args={[0.2, 1.5, 1]} />
          <meshStandardMaterial color="#ff9900" />
        </mesh>
      </group>
    </group>
  );
}

function FollowCamera({ targetPosition, targetQuaternion }) {
  const { camera } = useThree();
  
  // *** ADJUSTED CAMERA SETTINGS FOR THIRD-PERSON VIEW ***
  const distance = 40; 
  const height = 15;
  const localOffset = new THREE.Vector3(0, height, distance); // Local Offset: Up 15, Back 40

  const lookAheadFactor = 0.5; // Look slightly ahead of the plane

  useFrame((state, delta) => {
    if (!targetPosition || !targetQuaternion) return;

    // 1. Calculate ideal position (offset from the plane, rotated by plane's quaternion)
    // We use the inverse quaternion for the camera offset to face the plane correctly
    const inverseQuaternion = targetQuaternion.clone().invert();
    const idealPosition = localOffset.clone().applyQuaternion(inverseQuaternion).add(targetPosition);

    // 2. Calculate the point the camera should look at (slightly in front of the plane)
    const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(targetQuaternion);
    const idealLookAt = targetPosition.clone().add(forwardVector.multiplyScalar(lookAheadFactor));

    // 3. Smoothly interpolate (lerp) camera position and orientation (slerp)
    camera.position.lerp(idealPosition, 0.08); // Reduced speed for smoother follow
    
    const dummy = new THREE.Object3D();
    dummy.position.copy(camera.position);
    dummy.lookAt(idealLookAt);
    
    camera.quaternion.slerp(dummy.quaternion, 0.1);
  });

  return null;
}

function Globe() {
  return (
    <group rotation={[0,0,0]}>
      {/* The Planet */}
      <mesh receiveShadow>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial 
          color="#1E293B" 
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Wireframe Grid */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS + 0.1, 32, 32]} />
        <meshBasicMaterial color="#334155" wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function Scene() {
  const [camTarget, setCamTarget] = useState(null);
  const [camRotation, setCamRotation] = useState(null);

  return (
    <>
      <directionalLight position={[100, 100, 50]} intensity={2} castShadow />
      <ambientLight intensity={0.5} />
      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Character setCamTarget={setCamTarget} setCamRotation={setCamRotation} />
      
      <FollowCamera targetPosition={camTarget} targetQuaternion={camRotation} />
      
      <Globe />
      
      <Text position={[0, GLOBE_RADIUS + 30, 0]} fontSize={2} color="white" anchorX="center" anchorY="middle">
        WASD to Fly - Shift to Boost
      </Text>
    </>
  );
}

export default function two() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0f172a' }}>
      <Canvas shadows camera={{ fov: 60, near: 0.1, far: 2000 }}>
        <Scene />
      </Canvas>
    </div>
  );
}