import React, { useState, useEffect, useCallback, useRef } from "react";
import PlaneGame from "./PlaneGame";
import MobileJoystick from "../components/MobileJoystick";
import InteractButton from "../components/InteractButton";

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

  // triggerInteract is a pulse: true for one render cycle, then resets
  const [triggerInteract, setTriggerInteract] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
    check();
  }, []);

  const handleInteract = useCallback(() => {
    setTriggerInteract(true);
    // reset after a short delay so Hitbox picks up the rising edge
    setTimeout(() => setTriggerInteract(false), 100);
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-sky-300">
      <PlaneGame
        config={config}
        joystick={joystick}
        triggerInteract={triggerInteract}
      />

      {/* Mobile-only overlay controls */}
      {isMobile && (
        <>
          <MobileJoystick onMove={setJoystick} />
          <InteractButton onInteract={handleInteract} />
        </>
      )}

      {/* Keyboard hint for desktop */}
      {!isMobile && (
        <div className="absolute top-4 left-4 z-10 text-xs bg-white/50 backdrop-blur-sm px-3 py-2 rounded-lg">
          WASD → fly &nbsp;·&nbsp; E → interact &nbsp;·&nbsp; 1 / 2 → camera
        </div>
      )}
    </div>
  );
}
