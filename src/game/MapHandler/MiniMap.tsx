// src/components/MiniMap.tsx
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

interface Props {
  planeRef: React.RefObject<THREE.Group>;
}

const BASE = (import.meta as any).env.BASE_URL;

// ── Hitbox GLB paths (mirrors Hitbox.tsx exactly) ─────────────────────────────
const HITBOX_SOURCES = [
  {
    path: BASE + "assets/models/hitbox/c_outer.glb",
    label: "Contact",
    color: "#ef4444",
  },
  {
    path: BASE + "assets/models/hitbox/d_outer.glb",
    label: "About",
    color: "#ef4444",
  },
  {
    path: BASE + "assets/models/hitbox/i_outer.glb",
    label: "Projects",
    color: "#ef4444",
  },
] as const;

// ── Pre-compute world centroid from a loaded GLTF scene ──────────────────────
// The hitboxes sit at position [0,0,0] scale 32 in World.tsx, so we replicate
// that transform here to get the same world-space centre the plane sees.
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

// ── Inner canvas component — only rendered when visible ───────────────────────
function MapCanvas({ planeRef }: { planeRef: React.RefObject<THREE.Group> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Load all three hitbox scenes (hooks must be called unconditionally)
  const c = useGLTF(HITBOX_SOURCES[0].path);
  const d = useGLTF(HITBOX_SOURCES[1].path);
  const i = useGLTF(HITBOX_SOURCES[2].path);
  const loaded = [c, d, i];

  // Derive landmark canvas-space directions once per render cycle
  const landmarkDirs = loaded.map((gltf, idx) => {
    const center = getSceneCentroid(gltf.scene as THREE.Group, 32);
    // Normalise → same space as up.x / up.z used for the plane dot
    const len = center.length() || 1;
    return {
      label: HITBOX_SOURCES[idx].label,
      color: HITBOX_SOURCES[idx].color,
      dx: center.x / len, // maps to px  (horizontal on canvas)
      dz: center.z / len, // maps to py  (vertical   on canvas, inverted)
    };
  });

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const r = W / 2 - 2;

      ctx.clearRect(0, 0, W, H);

      // ── Globe background ────────────────────────────────────────────────
      const grad = ctx.createRadialGradient(
        cx - r * 0.2,
        cy - r * 0.2,
        0,
        cx,
        cy,
        r,
      );
      grad.addColorStop(0, "#5aa0d8");
      grad.addColorStop(0.5, "#2d6eaa");
      grad.addColorStop(1, "#1a4a7a");

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── Landmark dots ───────────────────────────────────────────────────
      // Uses identical projection to the plane dot: dx → +x on canvas, dz → -y on canvas
      landmarkDirs.forEach(({ label, color, dx, dz }) => {
        const lx = cx + dx * r * 0.78;
        const ly = cy - dz * r * 0.78;

        // Glow halo
        const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, 10);
        glow.addColorStop(0, color + "66");
        glow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(lx, ly, 10, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Solid dot
        ctx.beginPath();
        ctx.arc(lx, ly, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.font = "bold 7.5px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.textAlign = "center";
        ctx.fillText(label, lx, ly - 8);
      });

      // ── Plane dot ───────────────────────────────────────────────────────
      if (planeRef.current) {
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(
          planeRef.current.quaternion,
        );
        const px = cx + up.x * r * 0.85;
        const py = cy - up.z * r * 0.85;

        // Pulse ring
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fill();

        // White dot
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Direction tick — forward direction projected onto the map plane
        const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(
          planeRef.current.quaternion,
        );
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + fwd.x * 9, py - fwd.z * 9);
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [planeRef, landmarkDirs]);

  return (
    <canvas
      ref={canvasRef}
      width={175}
      height={175}
      className="w-full rounded-full"
    />
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function MiniMap({ planeRef }: Props) {
  const [visible, setVisible] = useState(true);

  // Toggle on M key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "m") setVisible((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!visible) {
    return (
      <div
        className="absolute top-4 right-4 z-50 flex items-center gap-2 
          bg-white/15 backdrop-blur-md border border-white/40 
          rounded-lg px-3 py-1.5 cursor-pointer select-none"
        onClick={() => setVisible(true)}
      >
        <span className="text-white/90 text-xs font-medium">Map</span>
        <kbd className="text-white/50 text-[10px] font-mono bg-white/10 px-1 rounded">
          M
        </kbd>
      </div>
    );
  }

  return (
    <div
      className="absolute top-4 right-4 z-50 w-[200px]
        bg-white/15 backdrop-blur-md border border-white/40
        rounded-xl overflow-hidden shadow-lg"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/25">
        <div className="flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <circle
              cx="6"
              cy="6"
              r="5"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="1.2"
            />
            <path
              d="M6 1v5l3 2"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[10px] font-medium text-white/90 uppercase tracking-widest">
            Map
          </span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="text-white/50 text-[10px] font-mono">M</kbd>
          <button
            onClick={() => setVisible(false)}
            className="w-4 h-4 rounded-full border border-white/35 bg-white/15 
              flex items-center justify-center text-white/80 text-[10px] 
              hover:bg-white/25 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Canvas — loaded inside Suspense so GLTFs don't block the rest of the UI */}
      <div className="p-2.5">
        <MapCanvas planeRef={planeRef} />

        {/* Legend */}
        <div className="mt-2 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white border border-white/40 flex-shrink-0" />
            <span className="text-[10px] text-white/70">You</span>
          </div>
          {HITBOX_SOURCES.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: color,
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              />
              <span className="text-[10px] text-white/70">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
