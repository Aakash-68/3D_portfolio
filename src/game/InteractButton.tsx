import React from "react";

interface Props {
  onInteract: () => void;
}

export default function InteractButton({ onInteract }: Props) {
  return (
    <button
      onPointerDown={onInteract}
      style={{
        position: "absolute",
        bottom: 60,
        right: 40,
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.25)",
        backdropFilter: "blur(6px)",
        border: "2px solid rgba(255,255,255,0.5)",
        fontSize: "22px",
        fontWeight: "bold",
        color: "white",
        zIndex: 20,
      }}
    >
      E
    </button>
  );
}
