import React, { useEffect, useRef, useState } from "react";

interface Props {
  activeHitboxIndex: number;
  onMobileLand: () => void;
}

export default function LandPrompt({ activeHitboxIndex, onMobileLand }: Props) {
  const isInside = activeHitboxIndex !== -1;
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isInside) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setVisible(true);
      requestAnimationFrame(() => setAnimating(true));
    } else {
      setAnimating(false);
      timeoutRef.current = setTimeout(() => setVisible(false), 400);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isInside]);

  if (!visible) return null;

  return (
    <>
      <div
        className={[
          "pointer-events-none select-none",
          "absolute top-3 left-1/2 z-[60]",
          "-translate-x-1/2",
          "land-pill flex items-center gap-2.5",
          "rounded-full px-5 py-2.5 pl-3.5",
          "bg-black/40 border border-white/20",
          "backdrop-blur-md",
          "transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]",
          animating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        ].join(" ")}
      >
        {/* Pulsing dot */}
        <span className="relative flex items-center justify-center size-3">
          <span className="absolute inset-0 rounded-full bg-green-400/40 animate-ping" />
          <span className="size-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
        </span>

        {/* Keyboard key badge */}
        <kbd className="inline-flex items-center justify-center size-[26px] rounded bg-white/10 border border-white/25 border-b-[3px] text-white font-mono text-xs font-bold leading-none">
          E
        </kbd>

        <span className="text-white/85 text-sm font-medium tracking-wide whitespace-nowrap">
          Press to land
        </span>
      </div>
      <div
        className={[
          "land-mobile",
          "pointer-events-auto select-auto",
          "absolute top-5 left-1/2 z-[60]",
          "-translate-x-1/2",
          "flex items-center gap-2.5",
          "rounded-full px-5 py-3",
          "bg-white/40 border border-white/20",
          "backdrop-blur-md",
          "text-white/85 text-sm font-medium tracking-wide",
        ].join(" ")}
      >
        Click the button to land
      </div>
      <style>{`
        @media (pointer: fine) {
          .land-mobile { display: none !important; }
        }
        @media (pointer: coarse) {
          .land-pill { display: none !important; }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </>
  );
}
