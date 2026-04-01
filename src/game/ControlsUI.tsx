import React from "react";

interface Config {
  globeRotationSpeed: number;
  forwardSpeed: number;
  slowSpeed: number;
  turnAmount: number;
  rollAmount: number;
  cameraMode: "follow" | "dev";
}

interface Props {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
}

export default function ControlsUI({ config, setConfig }: Props) {
  const handleChange = (key: keyof Config, value: number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="absolute bottom-4 right-4 z-10 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl w-72 border border-white/20">
      <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-widest">
        Dev Settings
      </h3>

      <div className="space-y-4">
        <Slider
          label="Forward Speed (W)"
          value={config.forwardSpeed}
          min={0.01}
          max={0.2}
          step={0.001}
          onChange={(v) => handleChange("forwardSpeed", v)}
        />
        <Slider
          label="Slow Speed (S)"
          value={config.slowSpeed}
          min={0.005}
          max={0.1}
          step={0.001}
          onChange={(v) => handleChange("slowSpeed", v)}
        />
        <Slider
          label="Turn Amount (A/D)"
          value={config.turnAmount}
          min={0.01}
          max={0.1}
          step={0.001}
          onChange={(v) => handleChange("turnAmount", v)}
        />
        <Slider
          label="Roll Amount (A/D)"
          value={config.rollAmount}
          min={0.1}
          max={1.5}
          step={0.01}
          onChange={(v) => handleChange("rollAmount", v)}
        />
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        <span>{label}</span>
        <span className="font-mono">{value.toFixed(4)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />
    </div>
  );
}
