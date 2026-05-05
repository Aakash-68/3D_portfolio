// src/game/PipCameraPanel.tsx

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
import { useNavigate } from "react-router-dom";
import { HITBOXES } from "./Hitbox";

const BASE = (import.meta as any).env.BASE_URL;

function getSceneCentroid(scene: THREE.Group, scale: number): THREE.Vector3 {
  const box = new THREE.Box3();
  const scaled = scene.clone();
  scaled.scale.setScalar(scale);
  scaled.updateWorldMatrix(true, true);
  box.setFromObject(scaled);
  const center = new THREE.Vector3();
  box.getCenter(center);
  return center;
}
// ── Scene cloning helper ──────────────────────────────────────────────────────
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

// ── Globe ─────────────────────────────────────────────────────────────────────
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

// ── Plane mirror ──────────────────────────────────────────────────────────────
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

// ── Transparent background ────────────────────────────────────────────────────
function TransparentBg() {
  const { gl, scene } = useThree();
  useEffect(() => {
    gl.setClearColor(0x000000, 0);
    scene.background = null;
  }, [gl, scene]);
  return null;
}

// ── Hitbox 3D markers: invisible spheres that can be raycasted ───────────────
// We store their world positions each frame and project to screen for the HTML overlay
interface HitboxMarkersProps {
  onPositionsUpdate: (
    positions: Array<{ x: number; y: number; visible: boolean }>,
  ) => void;
  activeIndex: number;
}

function HitboxMarkers({ onPositionsUpdate }: HitboxMarkersProps) {
  const { camera, size } = useThree();

  // Load hitbox GLBs (same as MiniMap)
  const c = useGLTF(BASE + "/assets/models/hitbox/c_outer.glb");
  const d = useGLTF(BASE + "/assets/models/hitbox/d_outer.glb");
  const i = useGLTF(BASE + "/assets/models/hitbox/i_outer.glb");

  const gltfs = [c, d, i];

  // Compute world positions ONCE
  const worldPositions = useRef<THREE.Vector3[]>([]);

  useEffect(() => {
    worldPositions.current = gltfs.map((gltf) =>
      getSceneCentroid(gltf.scene as THREE.Group, 32),
    );
  }, [c, d, i]);

  useFrame(() => {
    if (worldPositions.current.length === 0) return;

    const projected = worldPositions.current.map((worldPos) => {
      const vec = worldPos.clone().project(camera);

      const visible = vec.z < 1;
      const x = (vec.x * 0.5 + 0.5) * size.width;
      const y = (-vec.y * 0.5 + 0.5) * size.height;

      return { x, y, visible };
    });

    onPositionsUpdate(projected);
  });

  return null;
}

// ── OrbitControls ─────────────────────────────────────────────────────────────
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
    />
  );
}

// ── Full PiP scene ────────────────────────────────────────────────────────────
function PipScene({
  planeRef,
  onCamInfo,
  onMarkerPositions,
  activeIndex,
}: {
  planeRef: React.RefObject<THREE.Group>;
  onCamInfo: (info: CamInfo) => void;
  onMarkerPositions: (
    positions: Array<{ x: number; y: number; visible: boolean }>,
  ) => void;
  activeIndex: number;
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
      <HitboxMarkers
        onPositionsUpdate={onMarkerPositions}
        activeIndex={activeIndex}
      />
      <OrbitLogger onChange={onCamInfo} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public export
// ─────────────────────────────────────────────────────────────────────────────
interface PipCameraPanelProps {
  planeRef: React.RefObject<THREE.Group>;
  activeHitboxIndex?: number;
}

const PANEL_WIDTH = 260;
const VIEWPORT_HEIGHT = 250;

// Color palette per hitbox
const HITBOX_COLORS = [
  {
    base: "rgba(99,202,183,0.9)",
    glow: "rgba(99,202,183,0.4)",
    ring: "#63cab7",
  }, // teal - Contact
  {
    base: "rgba(147,130,255,0.9)",
    glow: "rgba(147,130,255,0.4)",
    ring: "#9382ff",
  }, // purple - About
  {
    base: "rgba(255,180,80,0.9)",
    glow: "rgba(255,180,80,0.4)",
    ring: "#ffb450",
  }, // amber - Projects
];

export default function PipCameraPanel({
  planeRef,
  activeHitboxIndex = -1,
}: PipCameraPanelProps) {
  const [visible, setVisible] = useState(true);
  const [camInfo, setCamInfo] = useState<CamInfo>({
    position: "0, 120, 60",
    target: "0, 0, 0",
    zoom: "1.000",
  });
  const [markerPositions, setMarkerPositions] = useState<
    Array<{ x: number; y: number; visible: boolean }>
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "m") setVisible((p) => !p);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleCamInfo = useCallback((info: CamInfo) => setCamInfo(info), []);
  const handleMarkerPositions = useCallback(
    (positions: Array<{ x: number; y: number; visible: boolean }>) => {
      setMarkerPositions(positions);
    },
    [],
  );

  const handleMarkerClick = useCallback(
    (index: number) => {
      navigate(HITBOXES[index].route);
    },
    [navigate],
  );

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
      className="absolute top-4 right-4 z-50 rounded-xl overflow-hidden shadow-2xl border border-white/40"
      style={{
        width: `${PANEL_WIDTH}px`,
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

      {/* 3-D viewport + HTML overlay */}
      <div className="relative" style={{ height: `${VIEWPORT_HEIGHT}px` }}>
        {/* Three.js canvas */}
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
            <PipScene
              planeRef={planeRef}
              onCamInfo={handleCamInfo}
              onMarkerPositions={handleMarkerPositions}
              activeIndex={activeHitboxIndex}
            />
          </Suspense>
        </Canvas>

        {/* HTML overlay: clickable hitbox dots */}
        <div className="absolute inset-0 pointer-events-none">
          {HITBOXES.map((hb, i) => {
            const pos = markerPositions[i];
            if (!pos || !pos.visible) return null;

            const isActive = activeHitboxIndex === i;
            const colors = HITBOX_COLORS[i];

            return (
              <button
                key={i}
                onClick={() => handleMarkerClick(i)}
                style={{
                  position: "absolute",
                  left: pos.x,
                  top: pos.y,
                  transform: "translate(-50%, -50%)",
                  pointerEvents: "auto",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: 0,
                }}
              >
                {/* Outer glow ring (pulses when active) */}
                <span
                  style={{
                    position: "absolute",
                    inset: "-6px",
                    borderRadius: "50%",
                    background: isActive ? colors.glow : "transparent",
                    border: `1.5px solid ${isActive ? colors.ring : "rgba(255,255,255,0.25)"}`,
                    animation: isActive
                      ? "pip-pulse 1.2s ease-in-out infinite"
                      : "none",
                    transition: "all 0.3s ease",
                  }}
                />
                {/* Dot */}
                <span
                  style={{
                    display: "block",
                    width: isActive ? 12 : 9,
                    height: isActive ? 12 : 9,
                    borderRadius: "50%",
                    background: isActive
                      ? colors.base
                      : "rgba(255,255,255,0.55)",
                    border: `1.5px solid ${isActive ? colors.ring : "rgba(255,255,255,0.6)"}`,
                    boxShadow: isActive
                      ? `0 0 10px ${colors.glow}`
                      : "0 1px 3px rgba(0,0,0,0.4)",
                    transition: "all 0.25s ease",
                  }}
                />
                {/* Label */}
                <span
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "calc(100% + 6px)",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                    fontSize: "9px",
                    fontFamily: "monospace",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    color: isActive ? colors.ring : "rgba(255,255,255,0.55)",
                    textShadow: "0 1px 3px rgba(0,0,0,0.7)",
                    padding: "1px 4px",
                    borderRadius: "3px",
                    background: isActive
                      ? "rgba(0,0,0,0.45)"
                      : "rgba(0,0,0,0.25)",
                    transition: "all 0.25s ease",
                    pointerEvents: "none",
                  }}
                >
                  {hb.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-1.5 right-0 flex justify-center pointer-events-none">
          <span className="text-[9px] text-white/40 font-mono bg-black/20 px-1.5 py-0.5 rounded">
            · drag to orbit · click dot to navigate
          </span>
        </div>
      </div>

      {/* Legend strip */}
      <div
        className="flex items-center justify-around px-3 py-2 border-t border-white/15"
        style={{ background: "rgba(0,0,0,0.15)" }}
      >
        {HITBOXES.map((hb, i) => {
          const colors = HITBOX_COLORS[i];
          const isActive = activeHitboxIndex === i;
          return (
            <button
              key={i}
              onClick={() => handleMarkerClick(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                border: `1px solid ${isActive ? "rgba(255,255,255,0.25)" : "transparent"}`,
                borderRadius: 6,
                padding: "2px 6px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isActive ? colors.base : "rgba(255,255,255,0.4)",
                  flexShrink: 0,
                  boxShadow: isActive ? `0 0 6px ${colors.glow}` : "none",
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  fontFamily: "monospace",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: isActive ? colors.ring : "rgba(255,255,255,0.45)",
                  transition: "color 0.2s ease",
                }}
              >
                {hb.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pulse keyframe injected once */}
      <style>{`
        @keyframes pip-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.35); }
        }
      `}</style>
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
