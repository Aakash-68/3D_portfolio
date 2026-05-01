import React, { useRef, useCallback, useEffect } from "react";

interface JoystickOutput {
  x: number; // -1 to 1
  y: number; // -1 to 1
}

interface Props {
  onMove: (value: JoystickOutput | null) => void;
}

const RADIUS = 56; // outer radius px
const KNOB = 22; // inner knob radius px

export default function MobileJoystick({ onMove }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeTouch = useRef<number | null>(null);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const updateKnob = useCallback(
    (clientX: number, clientY: number) => {
      const cx = centerRef.current.x;
      const cy = centerRef.current.y;

      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clamped = Math.min(dist, RADIUS);
      const angle = Math.atan2(dy, dx);

      const kx = Math.cos(angle) * clamped;
      const ky = Math.sin(angle) * clamped;

      if (knobRef.current) {
        knobRef.current.style.transform = `translate(${kx}px, ${ky}px)`;
      }

      onMove({
        x: kx / RADIUS,
        y: ky / RADIUS,
      });
    },
    [onMove],
  );

  const resetKnob = useCallback(() => {
    if (knobRef.current) {
      knobRef.current.style.transform = "translate(0px, 0px)";
    }
    onMove(null);
    activeTouch.current = null;
  }, [onMove]);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (activeTouch.current !== null) return;
      const touch = e.changedTouches[0];
      activeTouch.current = touch.identifier;
      const rect = el.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      updateKnob(touch.clientX, touch.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouch.current) {
          updateKnob(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouch.current) {
          resetKnob();
          break;
        }
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [updateKnob, resetKnob]);

  return (
    <div
      ref={outerRef}
      style={{
        position: "absolute",
        bottom: 48,
        left: 48,
        width: RADIUS * 2,
        height: RADIUS * 2,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1.5px solid rgba(255,255,255,0.28)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "none",
        userSelect: "none",
        zIndex: 20,
      }}
    >
      {/* crosshair guides */}
      <div
        style={{
          position: "absolute",
          width: "60%",
          height: 1,
          background: "rgba(255,255,255,0.15)",
          borderRadius: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1,
          height: "60%",
          background: "rgba(255,255,255,0.15)",
          borderRadius: 1,
        }}
      />

      {/* knob */}
      <div
        ref={knobRef}
        style={{
          width: KNOB * 2,
          height: KNOB * 2,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          border: "1.5px solid rgba(255,255,255,0.7)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
          transition: "transform 0.05s ease",
          pointerEvents: "none",
          flexShrink: 0,
        }}
      />
    </div>
  );
}
