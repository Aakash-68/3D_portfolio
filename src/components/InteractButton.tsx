import React from "react";

interface Props {
  onInteract: () => void;
}

export default function InteractButton({ onInteract }: Props) {
  return (
    <button
      onTouchStart={onInteract}
      onMouseDown={onInteract}
      className="absolute bottom-10 right-10 w-20 h-20 rounded-full bg-white/20 backdrop-blur-md text-white text-xl font-bold border border-white/30 active:scale-90 transition"
    >
      E
    </button>
  );
}
