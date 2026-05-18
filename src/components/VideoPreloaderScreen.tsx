import React from "react";

interface Props {
  progress: number;
  label?: string;
  videoCount?: number;
}

export default function VideoPreloaderScreen({
  progress,
  label = "Loading flight assets",
  videoCount = 3,
}: Props) {
  const pct = Math.round(progress * 100);
  const dotsCompleted = Math.floor(progress * videoCount);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "linear-gradient(135deg, #e8e8ee 0%, #f4f4f8 40%, #dde0ea 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        fontFamily: "monospace",
        userSelect: "none",
      }}
    >
      {/* Ambient blur blobs */}
      <div style={{
        position: "absolute", width: 360, height: 360, borderRadius: "50%",
        top: "8%", left: "12%",
        background: "rgba(255,255,255,0.5)", filter: "blur(90px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 280, height: 280, borderRadius: "50%",
        bottom: "12%", right: "10%",
        background: "rgba(195,200,220,0.45)", filter: "blur(75px)", pointerEvents: "none",
      }} />

      {/* Glass card */}
      <div
        style={{
          position: "relative",
          background: "rgba(255,255,255,0.52)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.78)",
          borderRadius: 24,
          padding: "40px 52px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
          minWidth: 300,
          boxShadow:
            "0 8px 32px rgba(130,138,170,0.16), inset 0 1px 0 rgba(255,255,255,0.92)",
        }}
      >
        {/* Icon pill */}
        <div
          style={{
            width: 54, height: 54, borderRadius: 14,
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(255,255,255,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24,
            boxShadow: "0 2px 10px rgba(130,140,180,0.14)",
          }}
        >
          ✈
        </div>

        {/* Label */}
        <p style={{
          fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase",
          color: "rgba(85, 90, 118, 0.72)", margin: 0, fontWeight: 500,
        }}>
          {label}
        </p>

        {/* Progress bar */}
        <div style={{
          width: 220, height: 4,
          background: "rgba(175,180,210,0.28)",
          borderRadius: 9999, overflow: "hidden",
          border: "0.5px solid rgba(255,255,255,0.6)",
        }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            background: "rgba(140,148,192,0.75)",
            borderRadius: 9999,
            transition: "width 120ms linear",
          }} />
        </div>

        {/* Percentage */}
        <p style={{
          fontSize: 12, color: "rgba(100,108,145,0.6)",
          margin: "-6px 0 0", fontVariantNumeric: "tabular-nums",
          letterSpacing: "0.06em",
        }}>
          {pct}%
        </p>

        {/* Dots */}
        <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
          {Array.from({ length: videoCount }).map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: i < dotsCompleted
                ? "rgba(115,125,175,0.82)"
                : "rgba(175,180,210,0.32)",
              border: i < dotsCompleted
                ? "1px solid rgba(155,165,210,0.55)"
                : "1px solid rgba(215,220,235,0.5)",
              transition: "all 0.35s ease",
              boxShadow: i < dotsCompleted ? "0 0 6px rgba(135,145,200,0.35)" : "none",
            }} />
          ))}
        </div>
      </div>

      {/* Hint */}
      <p style={{
        marginTop: 28, fontSize: 11, letterSpacing: "0.12em",
        textTransform: "uppercase", color: "rgba(125,130,158,0.48)",
      }}>
        please wait
      </p>
    </div>
  );
}
