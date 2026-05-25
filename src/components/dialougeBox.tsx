import { useState, useEffect, useRef } from "react";

interface PS2DialogBoxProps {
  text: string;
  onComplete?: () => void;
  wordDelay?: number;
}

export default function PS2DialogBox({
  text,
  onComplete,
  wordDelay = 120,
}: PS2DialogBoxProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);
  const words = text.split(" ");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setVisibleCount(0);
    setDone(false);
  }, [text]);

  useEffect(() => {
    if (visibleCount >= words.length) {
      setDone(true);
      onComplete?.();
      return;
    }
    intervalRef.current = setInterval(() => {
      setVisibleCount((c) => c + 1);
    }, wordDelay);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visibleCount, words.length, wordDelay, onComplete]);

  const handleSkip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVisibleCount(words.length);
  };

  /*
   * The pixel border is built from 9 divs (NW, N, NE, W, CENTER, E, SW, S, SE)
   * using absolute positioning — exactly like a 9-slice sprite, but pure CSS/Tailwind.
   * Each corner is 8px × 8px black square.
   * Each edge stretches on one axis; the center fills the rest.
   *
   * Corner anatomy (top-left shown, 8px grid):
   *   ░░████
   *   ░░████
   *   ████░░
   *   ████░░
   * where ░ = transparent (cut), █ = black
   * This gives the signature "notched" PS2/RPG corner.
   */

  const B = 4; // border thickness in px
  const C = 8; // corner size in px (2 × border)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        @keyframes ps2-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes ps2-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        .ps2-tower   { animation: ps2-float 2.8s ease-in-out infinite; }
        .ps2-cursor  { animation: ps2-blink 0.9s step-start infinite; }
        .ps2-font    { font-family: 'Press Start 2P', monospace; }

        /* ── 9-slice pixel frame ──────────────────────────────
           Uses outline + inset box-shadow to paint the border
           without any image assets.
           Corner clip is achieved with clip-path on each slice. */

        .ps2-frame {
          position: relative;
          /* clipped octagon — matches RPG dialog corners */
          clip-path: polygon(
            ${C}px 0%,
            calc(100% - ${C}px) 0%,
            100% ${C}px,
            100% calc(100% - ${C}px),
            calc(100% - ${C}px) 100%,
            ${C}px 100%,
            0% calc(100% - ${C}px),
            0% ${C}px
          );
          background: #ffffff;
        }

        /* Thick black border ring */
        .ps2-frame::before {
          content: '';
          position: absolute;
          inset: 0;
          clip-path: inherit;
          box-shadow: inset 0 0 0 ${B}px #000000;
          pointer-events: none;
          z-index: 3;
        }

        /* Blue bottom shelf — sits inside, near the bottom */
        .ps2-shelf {
          position: absolute;
          bottom: ${B + 2}px;
          left: ${C + 4}px;
          right: ${C + 4}px;
          height: 5px;
          background: linear-gradient(180deg, #c5ddf0 0%, #8db8d8 100%);
          border-radius: 1px;
          z-index: 2;
          pointer-events: none;
        }

        /* Second shelf line for depth */
        .ps2-shelf::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0; right: 0;
          height: 2px;
          background: #7aaac8;
          border-radius: 1px;
        }
      `}</style>

      {/* Root — transparent, positions tower relative to box */}
      <div
        className="relative flex items-end justify-center w-full select-none"
        style={{ background: "transparent" }}
        onClick={handleSkip}
      >
        {/* Floating tower character */}
        <div
          className="ps2-tower absolute z-10 pointer-events-none"
          style={{
            right: "-70px",
            bottom: "0px",
            width: "15vw",
            filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))",
          }}
        >
          <img
            src="/assets/Images/dialog/tower.png"
            alt="character"
            style={{ width: "100%", imageRendering: "pixelated" }}
          />
        </div>

        {/* Dialog box container */}
        <div
          className="w-full"
          style={{ maxWidth: "800px", padding: "0 10px 10px" }}
        >
          <div
            className="ps2-frame"
            style={{
              paddingTop: `clamp(16px, 3vw, 28px)`,
              paddingBottom: `clamp(20px, 4vw, 32px)`,
              paddingLeft: `clamp(24px, 5vw, 56px)`,
              /* right padding = left padding + tower width buffer so text wraps before tower */
              paddingRight: `10vw`,
              minHeight: "clamp(76px, 15vw, 124px)",
            }}
          >
            {/* Blue bottom shelf decoration */}
            <div className="ps2-shelf" />

            {/* Text content */}
            <p
              className="ps2-font relative"
              style={{
                zIndex: 4,
                fontSize: "clamp(6px, 1.15vw, 11px)",
                color: "#111122",
                letterSpacing: "0.03em",
                lineHeight: "2.4",
                margin: 0,
                minHeight: "2.4em",
                whiteSpace: "normal",
              }}
            >
              {words.map((word, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block", // prevents mid-word breaks
                    whiteSpace: "nowrap", // keeps each word as one unit
                    opacity: i < visibleCount ? 1 : 0,
                    transition: "opacity 0.07s ease",
                    marginRight: "0.38em",
                  }}
                >
                  {word}
                </span>
              ))}

              {done && (
                <span
                  className="ps2-cursor ps2-font inline-block ml-1 align-middle"
                  style={{ color: "#4a8fc2", fontSize: "0.75em" }}
                >
                  ▼
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
