import React, { useState, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface KeyBadgeProps {
  keys: string[];
}

interface ControlRowProps {
  keys: string[];
  label: string;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function KeyBadge({ keys }: KeyBadgeProps) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((k) => (
        <kbd
          key={k}
          className="
            inline-flex items-center justify-center
            min-w-[26px] h-[26px] px-1.5
            rounded-md text-[11px] font-semibold tracking-wide
            text-white/80
            bg-white/10 border border-white/20
            shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_3px_rgba(0,0,0,0.35)]
            select-none
          "
        >
          {k}
        </kbd>
      ))}
    </div>
  );
}

function ControlRow({ keys, label }: ControlRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <KeyBadge keys={keys} />
      <span className="text-[11px] text-white/55 font-medium tracking-wide text-right">
        {label}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ControlsUI() {
  const [open, setOpen] = useState(true);

  // Toggle on H key (desktop only)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === "h" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Pill (collapsed state) ─────────────────────────────────────────────────
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="
          hidden md:flex
          absolute top-4 left-4 z-50
          items-center gap-2
          px-3 py-1.5
          rounded-full
          bg-white/10 backdrop-blur-md
          border border-white/20
          shadow-[0_2px_16px_rgba(0,0,0,0.25)]
          text-white/70 text-[11px] font-medium tracking-widest uppercase
          hover:bg-white/18 hover:text-white/90
          transition-all duration-200 ease-out
          cursor-pointer select-none
          group
        "
        title="Show controls (H)"
      >
        {/* Gamepad icon */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          className="opacity-70 group-hover:opacity-100 transition-opacity"
        >
          <rect
            x="1"
            y="4"
            width="14"
            height="8"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path
            d="M5 8H7M6 7V9"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <circle cx="10" cy="8" r="0.8" fill="currentColor" />
          <circle cx="12" cy="8" r="0.8" fill="currentColor" />
        </svg>
        Controls
        <kbd className="ml-0.5 text-[9px] font-mono bg-white/10 border border-white/15 px-1 py-0.5 rounded text-white/40">
          H
        </kbd>
      </button>
    );
  }

  // ── Full card (open state) ─────────────────────────────────────────────────
  return (
    <div
      className="
        hidden md:block
        absolute top-4 left-4 z-50
        w-[230px]
        rounded-2xl overflow-hidden
        border border-white/20
        shadow-[0_4px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)]
        animate-[fadeSlideIn_0.18s_ease-out]
      "
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)",
        backdropFilter: "blur(20px) saturate(1.6)",
        WebkitBackdropFilter: "blur(20px) saturate(1.6)",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* Gamepad icon */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            className="text-white/60"
          >
            <rect
              x="1"
              y="4"
              width="14"
              height="8"
              rx="3"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M5 8H7M6 7V9"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <circle cx="10" cy="8" r="0.8" fill="currentColor" />
            <circle cx="12" cy="8" r="0.8" fill="currentColor" />
          </svg>
          <span className="text-[11px] font-semibold text-white/80 uppercase tracking-[0.12em]">
            Controls
          </span>
        </div>

        <button
          onClick={() => setOpen(false)}
          title="Close (H)"
          className="
    w-5 h-5 rounded-full
    flex items-center justify-center
    backdrop-blur-md
    bg-[#ff5f57]/50 border border-white/20
    text-white/40 text-[10px]
    hover:brightness-110
    transition-all duration-150 cursor-pointer
  "
        >
          ✕
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 flex flex-col gap-1">
        {/* Section label */}
        <div className="flex items-center gap-1.5 mb-1.5">
          {/* keyboard icon */}
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            className="text-white/35"
          >
            <rect
              x="0.5"
              y="2.5"
              width="11"
              height="7"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M3 5.5h1M5 5.5h1M7 5.5h1M9 5.5h1M4 7.5h4"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[9px] text-white/35 font-semibold uppercase tracking-[0.15em]">
            Keyboard
          </span>
        </div>

        <ControlRow keys={["W", "A", "S", "D"]} label="Fly" />

        <div className="my-0.5 h-px bg-white/8" />

        <ControlRow keys={["Shift"]} label="Boost" />

        <div className="my-0.5 h-px bg-white/8" />

        <ControlRow keys={["E"]} label="Land at country" />

        <div className="my-0.5 h-px bg-white/8" />

        <ControlRow keys={["M"]} label="Toggle map" />

        <div className="my-0.5 h-px bg-white/8" />
      </div>

      {/* ── Footer hint ────────────────────────────────────────────────────── */}
      <div className="px-4 pb-3 pt-0.5 flex items-center justify-end gap-1">
        <span className="text-[9px] text-white/25 font-mono">H</span>
        <span className="text-[9px] text-white/20">to hide</span>
      </div>

      {/* Inline keyframe animation */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}
