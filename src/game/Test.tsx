import React, { useState, useEffect, useCallback, useRef } from "react";
import PlaneGame from "./PlaneGame";
import MobileJoystick from "../components/MobileJoystick";
import InteractButton from "../components/InteractButton";
import Bottomblur from "../components/Effects/Bottomblur";

// ── Nav items
const NAV_ITEMS = [
  { label: "About", fontSize: "12px", fontWeight: 400 },
  { label: "Projects", fontSize: "12px", fontWeight: 400 },
  { label: "Contact", fontSize: "12px", fontWeight: 400 },
];

export default function Test() {
  const [config] = useState({
    globeRotationSpeed: 0.001,
    forwardSpeed: 0.05,
    slowSpeed: 0.02,
    turnAmount: 0.03,
    rollAmount: 0.5,
    cameraMode: "follow" as "follow" | "dev",
  });

  const [isMobile, setIsMobile] = useState(false);
  const [joystick, setJoystick] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [triggerInteract, setTriggerInteract] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
    check();
  }, []);

  const handleInteract = useCallback(() => {
    setTriggerInteract(true);
    setTimeout(() => setTriggerInteract(false), 100);
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-sky-300">
      {/* ── 3D game canvas ─────────────────────────────────────────── */}
      <PlaneGame
        config={config}
        joystick={joystick}
        triggerInteract={triggerInteract}
      />
      <Bottomblur
        target="parent"
        position="bottom"
        strength={1}
        divCount={5}
        curve="bezier"
        exponential
        opacity={1}
        className="md:hidden"
      />
      {/* ── Mobile controls ────────────────────────────────────────── */}
      {isMobile && (
        <>
          <MobileJoystick onMove={setJoystick} />
          <InteractButton onInteract={handleInteract} />
        </>
      )}
    </div>
  );
}
