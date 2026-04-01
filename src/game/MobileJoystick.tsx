import React, { useRef } from "react";

interface Props {
  onMove: (x: number, y: number) => void;
  onRelease: () => void;
}

export default function MobileJoystick({ onMove, onRelease }: Props) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);

  const maxDistance = 45;

  const move = (e: PointerEvent) => {
    if (!baseRef.current || !knobRef.current) return;

    const rect = baseRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const dist = Math.sqrt(x * x + y * y);

    let cx = x;
    let cy = y;

    if (dist > maxDistance) {
      const a = Math.atan2(y, x);
      cx = Math.cos(a) * maxDistance;
      cy = Math.sin(a) * maxDistance;
    }

    knobRef.current.style.transform = `translate(${cx}px, ${cy}px)`;

    onMove(cx / maxDistance, cy / maxDistance);
  };

  const start = () => {
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
  };

  const end = () => {
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(0px,0px)`;
    }

    onRelease();

    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
  };

  return (
    <div
      ref={baseRef}
      onPointerDown={start}
      style={{
        position: "absolute",
        bottom: 40,
        left: 40,
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(6px)",
        touchAction: "none",
        zIndex: 20,
      }}
    >
      <div
        ref={knobRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 50,
          height: 50,
          marginLeft: -25,
          marginTop: -25,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.6)",
        }}
      />
    </div>
  );
}
