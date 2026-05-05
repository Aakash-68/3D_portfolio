// src/game/PipCameraPanel.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Self-contained orbital "picture-in-picture" camera panel.
// Drop <PipCameraPanel planeRef={planeRef} /> anywhere above the main Canvas.
// Toggle with the V key or the ✕ button.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  Suspense,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  useGLTF,
  useAnimations,
} from "@react-three/drei";
import * as THREE from "three";

const BASE = (import.meta as any).env.BASE_URL;

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers (not exported — only PipCameraPanel is the public API)
// ─────────────────────────────────────────────────────────────────────────────

/** Clones a GLTF scene and deep-clones every material so the PiP WebGL
 *  context never shares GPU objects with the main Canvas. */
function cloneScene(src: THREE.Group): THREE.Group {
  const clone = src.clone(true);
  clone.traverse((child: any) => {
    if (child.isMesh && child.material) {
      child.material = child.material.clone();
      child.material.metalness = 0;
      child.material.roughness = 1;
      child.material.envMapIntensity = 0;
      child.material.needsUpdate = true;
    }
  });
  return clone;
}

// ── Globe — loads its own copy of the GLB ────────────────────────────────────
function PipGlobe() {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF(BASE + "/assets/models/globe.glb");

  const cloned = useRef<THREE.Group | null>(null);
  if (!cloned.current) cloned.current = cloneScene(scene);

  const { actions } = useAnimations(animations, groupRef);
  useEffect(() => {
    if (actions) Object.values(actions).forEach((a) => a?.reset().play());
  }, [actions]);

  return (
    <group ref={groupRef} scale={32}>
      <primitive object={cloned.current} />
    </group>
  );
}

// ── Plane — mirrors the main plane's world transform every frame ──────────────
function PipPlane({ planeRef }: { planeRef: React.RefObject<THREE.Group> }) {
  const mirrorRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF(BASE + "/assets/models/plane.glb");

  const cloned = useRef<THREE.Group | null>(null);
  if (!cloned.current) cloned.current = cloneScene(scene);

  const { actions } = useAnimations(animations, meshRef);
  useEffect(() => {
    if (actions) Object.values(actions).forEach((a) => a?.reset().play());
  }, [actions]);

  useFrame(() => {
    if (!mirrorRef.current || !planeRef.current) return;
    mirrorRef.current.position.copy(planeRef.current.position);
    mirrorRef.current.quaternion.copy(planeRef.current.quaternion);
  });

  return (
    <group ref={mirrorRef}>
      <group ref={meshRef} scale={0.3}>
        <primitive object={cloned.current} />
      </group>
    </group>
  );
}

// ── Ensures the PiP Canvas is fully transparent (no sky / clear colour) ──────
function TransparentBg() {
  const { gl, scene } = useThree();
  useEffect(() => {
    gl.setClearColor(0x000000, 0);
    scene.background = null;
  }, [gl, scene]);
  return null;
}

// ── OrbitControls that stream camera state up and log to console on change ────
type CamInfo = { position: string; target: string; zoom: string };

function OrbitLogger({ onChange }: { onChange: (info: CamInfo) => void }) {
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (!controlsRef.current) return;
    const cam = controlsRef.current.object as THREE.PerspectiveCamera;
    const tgt = controlsRef.current.target as THREE.Vector3;
    onChange({
      position: `${cam.position.x.toFixed(1)}, ${cam.position.y.toFixed(1)}, ${cam.position.z.toFixed(1)}`,
      target: `${tgt.x.toFixed(1)}, ${tgt.y.toFixed(1)}, ${tgt.z.toFixed(1)}`,
      zoom: cam.zoom.toFixed(3),
    });
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableRotate
      enablePan={false}
      enableZoom={false}
      onChange={() => {
        if (!controlsRef.current) return;
        const cam = controlsRef.current.object as THREE.PerspectiveCamera;
        const tgt = controlsRef.current.target as THREE.Vector3;
        console.group("[OrbitCam]");
        console.log(
          "position:",
          cam.position.toArray().map((v) => +v.toFixed(3)),
        );
        console.log(
          "target:  ",
          tgt.toArray().map((v) => +v.toFixed(3)),
        );
        console.log("fov:     ", (cam as any).fov?.toFixed(2));
        console.groupEnd();
      }}
    />
  );
}

// ── The Three.js scene that lives inside the PiP Canvas ──────────────────────
function PipScene({
  planeRef,
  onCamInfo,
}: {
  planeRef: React.RefObject<THREE.Group>;
  onCamInfo: (info: CamInfo) => void;
}) {
  return (
    <>
      <TransparentBg />
      <Environment preset="sunset" environmentIntensity={0.3} />
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[80, 160, 80]}
        intensity={1}
        castShadow={false}
      />
      <directionalLight position={[-80, 80, -80]} intensity={0.4} />
      <PipGlobe />
      <PipPlane planeRef={planeRef} />
      <OrbitLogger onChange={onCamInfo} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public export — the only thing PlaneGame.tsx needs to import
// ─────────────────────────────────────────────────────────────────────────────
interface PipCameraPanelProps {
  planeRef: React.RefObject<THREE.Group>;
}

export default function PipCameraPanel({ planeRef }: PipCameraPanelProps) {
  const [visible, setVisible] = useState(true);
  const [camInfo, setCamInfo] = useState<CamInfo>({
    position: "0, 120, 60",
    target: "0, 0, 0",
    zoom: "1.000",
  });

  // V key toggles the panel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "m") setVisible((p) => !p);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleCamInfo = useCallback((info: CamInfo) => setCamInfo(info), []);

  // ── Collapsed pill ──────────────────────────────────────────────────────────
  if (!visible) {
    return (
      <div
        className="absolute top-4 right-4 z-50 flex items-center gap-2
          bg-white/15 backdrop-blur-md border border-white/40
          rounded-lg px-3 py-1.5 cursor-pointer select-none"
        onClick={() => setVisible(true)}
      >
        <PipIcon />
        <span className="text-white/90 text-xs font-medium">Orbit View</span>
        <kbd className="text-white/50 text-[10px] font-mono bg-white/10 px-1 rounded">
          M
        </kbd>
      </div>
    );
  }

  // ── Full panel ──────────────────────────────────────────────────────────────
  return (
    <div
      className="absolute top-4 right-4 z-50 w-[260px] rounded-xl overflow-hidden shadow-2xl border border-white/40"
      style={{
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        background: "rgba(255,255,255,0.08)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-white/25"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-1.5">
          <PipIcon />
          <span className="text-[10px] font-medium text-white/90 uppercase tracking-widest">
            Orbit View
          </span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="text-white/50 text-[10px] font-mono">M</kbd>
          <button
            onClick={() => setVisible(false)}
            className="w-4 h-4 rounded-full border border-white/35 bg-white/15
              flex items-center justify-center text-white/80 text-[10px]
              hover:bg-white/30 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 3-D viewport */}
      <div className="relative" style={{ height: "250px" }}>
        <Canvas
          camera={{
            position: [53.2, 67.3, -23.1],

            fov: 55,
            near: 0.1,
            far: 10000,
          }}
          gl={{
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
            alpha: true,
            antialias: true,
            premultipliedAlpha: false,
          }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          style={{ width: "100%", height: "100%", background: "transparent" }}
        >
          <Suspense fallback={null}>
            <PipScene planeRef={planeRef} onCamInfo={handleCamInfo} />
          </Suspense>
        </Canvas>

        <div className="absolute bottom-1.5 right-0 right-0 flex justify-center pointer-events-none">
          <span className="text-[9px] text-white/40 font-mono bg-black/20 px-1.5 py-0.5 rounded">
            · right-drag pan
          </span>
        </div>
      </div>

      {/* Camera debug readout
      <div
        className="px-3 py-2.5 border-t border-white/20 space-y-1.5"
        style={{ background: "rgba(0,0,0,0.18)" }}
      >
        <p className="text-[9px] text-white/35 uppercase tracking-widest font-mono mb-1">
          Camera Debug
        </p>
        {(
          [
            { label: "pos", value: camInfo.position },
            { label: "tgt", value: camInfo.target },
            { label: "zoom", value: camInfo.zoom },
          ] as const
        ).map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-2">
            <span className="text-[10px] text-white/45 font-mono shrink-0">
              {label}
            </span>
            <span className="text-[10px] text-white/80 font-mono text-right truncate">
              {value}
            </span>
          </div>
        ))}
      </div> */}
    </div>
  );
}

// ── Shared icon ───────────────────────────────────────────────────────────────
function PipIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <rect
        x="1"
        y="1"
        width="10"
        height="10"
        rx="1.5"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.2"
      />
      <circle cx="6" cy="6" r="2.5" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}
