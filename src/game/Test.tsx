import React, { useState, useEffect } from "react";
import PlaneGame from "./PlaneGame";

export default function Test() {
  const [config, setConfig] = useState({
    globeRotationSpeed: 0.001,
    forwardSpeed: 0.05,
    slowSpeed: 0.02,
    turnAmount: 0.03,
    rollAmount: 0.5,
    cameraMode: "follow" as "follow" | "dev",
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsMobile("ontouchstart" in window || navigator.maxTouchPoints > 0);
    check();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1")
        setConfig((prev) => ({ ...prev, cameraMode: "follow" }));
      if (e.key === "2") setConfig((prev) => ({ ...prev, cameraMode: "dev" }));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-sky-300">
      <PlaneGame config={config} />

      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={() =>
            setConfig((prev) => ({
              ...prev,
              cameraMode: prev.cameraMode === "follow" ? "dev" : "follow",
            }))
          }
          className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-lg shadow-sm"
        >
          Camera: {config.cameraMode === "follow" ? "Third Person" : "Dev Mode"}
        </button>

        <div className="text-xs bg-white/50 p-2 rounded-lg">
          {isMobile ? (
            <>Mobile Controls Joystick → steer E → interact</>
          ) : (
            <>Keyboard Controls WASD → fly 1 / 2 → camera E → interact</>
          )}
        </div>
      </div>
    </div>
  );
}
