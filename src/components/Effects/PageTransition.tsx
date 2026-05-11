import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { animate } from "motion/react";

// Only trigger transition when navigating to/from these routes
const TRANSITION_ROUTES = new Set(["/about", "/contact"]);

const ROUTE_LABELS: Record<string, string> = {
  "/about": "About",
  "/contact": "Contact",
};

const EASE_QUART = [0.76, 0, 0.24, 1] as [number, number, number, number];

function makePath(w: number, h: number, curved: boolean) {
  const bump = curved ? 300 : 0;
  return `M0 300 Q${w / 2} ${bump} ${w} 300 L${w} ${h + 300} Q${w / 2} ${h + 300 + bump} 0 ${h + 300} Z`;
}

// ─── TransitionOverlay — mount this ONCE at the app root, outside <Routes> ───
export function TransitionOverlay() {
  const location = useLocation();
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [labelText, setLabelText] = useState("");
  const [labelVisible, setLabelVisible] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const prevPath = useRef(location.pathname);
  const running = useRef(false);

  // Track window size
  useEffect(() => {
    const onResize = () =>
      setDims({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Fix 1: useLayoutEffect runs before paint, preventing the flicker
  // where the new route content is briefly visible under the overlay.
  useLayoutEffect(() => {
    const incoming = location.pathname;
    const outgoing = prevPath.current;
    prevPath.current = incoming;

    const shouldRun =
      TRANSITION_ROUTES.has(incoming) || TRANSITION_ROUTES.has(outgoing);

    if (!shouldRun || dims.w === 0 || running.current) return;

    const panel = panelRef.current;
    const svg = svgRef.current;
    const pathEl = pathRef.current;
    if (!panel || !svg || !pathEl) return;

    running.current = true;
    const { w, h } = dims;

    setLabelText(ROUTE_LABELS[incoming] ?? "");
    setLabelVisible(false);

    // Fix 2: Suppress any in-flight CSS transitions and force a reflow
    // before repositioning, so the browser doesn't interpolate from the
    // previous position and paint a stray frame.
    panel.style.transition = "none";
    svg.style.transition = "none";

    // Fix 3: Use transform: translateY() instead of `top`.
    // Animating `top` triggers layout recalculation on every frame.
    // translateY() is compositor-only — zero layout cost, buttery smooth.
    panel.style.transform = "translateY(calc(100vh + 300px))";
    svg.style.transform = "translateY(calc(100vh))";
    pathEl.setAttribute("d", makePath(w, h, true));

    // Force reflow so the reset above is committed before animation starts.
    // Without this, the browser might batch the reset + first animation frame,
    // which can produce a single visible flash of the new page.
    panel.getBoundingClientRect();

    // ── Phase 1: slide UP into view, curve flattens ──
    Promise.all([
      animate(
        panel,
        { transform: "translateY(-300px)" },
        { duration: 0.75, ease: EASE_QUART },
      ),
      animate(
        svg,
        { transform: "translateY(-300px)" },
        { duration: 0.75, ease: EASE_QUART },
      ),
      animate(
        pathEl,
        { d: makePath(w, h, false) },
        { duration: 0.75, ease: EASE_QUART },
      ),
    ]).then(() => {
      // ── Phase 2: show label, hold ──
      setLabelVisible(true);

      setTimeout(() => {
        setLabelVisible(false);

        // ── Phase 3: slide UP & OFF ──
        // Keep the path FLAT (curved: false) on exit.
        // Re-bulging the curve here (curved: true) scoops the bottom edge
        // upward by 300px, creating a gap at the corners that leaks the
        // incoming page before the overlay has fully cleared the screen.
        Promise.all([
          animate(
            panel,
            { transform: "translateY(calc(-100vh - 600px))" },
            { duration: 0.75, ease: EASE_QUART },
          ),
          animate(
            svg,
            { transform: "translateY(calc(-100vh - 600px))" },
            { duration: 0.75, ease: EASE_QUART },
          ),
          animate(
            pathEl,
            { d: makePath(w, h, false) },
            { duration: 0.75, ease: EASE_QUART },
          ),
        ]).then(() => {
          running.current = false;
        });
      }, 350);
    });
  }, [location.pathname, dims]);

  if (dims.w === 0) return null;

  const { w, h } = dims;

  return (
    <>
      {/* ── Dark rectangle ── */}
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "100vw",
          height: `calc(100vh + 600px)`,
          background: "#0c0c0c",
          zIndex: 9998,
          pointerEvents: "none",
          // Start off-screen below via transform (set properly in effect)
          transform: "translateY(calc(100vh + 300px))",
          willChange: "transform",
        }}
      />

      {/* ── Morphing SVG curve cap ── */}
      <svg
        ref={svgRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: "100vw",
          height: `calc(100vh + 600px)`,
          zIndex: 9999,
          pointerEvents: "none",
          overflow: "visible",
          // Start off-screen below via transform (set properly in effect)
          transform: "translateY(calc(100vh))",
          willChange: "transform",
        }}
      >
        <path ref={pathRef} d={makePath(w, h, true)} fill="#0c0c0c" />
      </svg>

      {/* ── Destination label ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          pointerEvents: "none",
          transition: "opacity 0.3s ease",
          opacity: labelVisible ? 1 : 0,
        }}
      >
        <p
          style={{
            color: "#f5f0eb",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 300,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            letterSpacing: "0.12em",
            margin: 0,
            transform: labelVisible ? "translateY(0)" : "translateY(12px)",
            transition: "transform 0.35s ease",
          }}
        >
          {labelText}
        </p>
      </div>
    </>
  );
}
