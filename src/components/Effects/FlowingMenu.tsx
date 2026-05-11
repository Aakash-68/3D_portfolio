import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
export interface MenuItemData {
  link: string;
  text: string;
  image: string;
}

interface FlowingMenuProps {
  items?: MenuItemData[];
  speed?: number;
}

interface MenuItemProps extends MenuItemData {
  speed: number;
  onCursorEnter: (image: string) => void;
  onCursorLeave: () => void;
  isLast: boolean;
}

/* ─────────────────────────────────────────
   Custom Cursor
   – Uses gsap.quickTo for smooth, allocation-free tracking
   – Hides the native cursor via a <style> injected once at root level
───────────────────────────────────────── */
const CustomCursor: React.FC<{ visible: boolean; image: string }> = ({
  visible,
  image,
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);

  /* Build quickTo functions once */
  useEffect(() => {
    if (!cursorRef.current) return;
    quickX.current = gsap.quickTo(cursorRef.current, "x", {
      duration: 0.18,
      ease: "power2.out",
    });
    quickY.current = gsap.quickTo(cursorRef.current, "y", {
      duration: 0.18,
      ease: "power2.out",
    });
  }, []);

  /* Single global mousemove listener – zero React state updates */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      quickX.current?.(e.clientX);
      quickY.current?.(e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[9999]"
      style={{ top: 0, left: 0, willChange: "transform" }}
    >
      {/* Arrow cursor */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <path
          fill="#111"
          stroke="#fff"
          strokeWidth="1.5"
          d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z"
        />
      </svg>

      {/* Preview card */}
      <div className="absolute" style={{ left: "22px", top: "-10px" }}>
        <div
          className="overflow-hidden rounded-2xl shadow-2xl border border-white/10"
          style={{
            width: "180px",
            height: "120px",
            background: "#111",
            transition: "opacity 0.25s ease, transform 0.25s ease",
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.88)",
            transformOrigin: "top left",
          }}
        >
          {image && (
            <img
              src={image}
              alt="preview"
              className="w-full h-full object-cover opacity-90"
              style={{ display: "block" }}
            />
          )}
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   MenuItem
───────────────────────────────────────── */
const MenuItem: React.FC<MenuItemProps> = ({
  link,
  text,
  image,
  speed,
  onCursorEnter,
  onCursorLeave,
  isLast,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const marqueeTween = useRef<gsap.core.Tween | null>(null);
  const [repetitions, setRepetitions] = useState(5);

  const animationDefaults = { duration: 0.55, ease: "expo.out" };

  const findClosestEdge = (
    mouseX: number,
    mouseY: number,
    width: number,
    height: number,
  ): "top" | "bottom" => {
    const top = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
    const bot = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
    return top < bot ? "top" : "bottom";
  };

  /* Repetition calculation — debounced resize */
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!marqueeInnerRef.current) return;
        const part = marqueeInnerRef.current.querySelector(
          ".marquee-part",
        ) as HTMLElement | null;
        if (!part) return;
        const needed =
          Math.ceil(window.innerWidth / (part.offsetWidth || 1)) + 3;
        setRepetitions((prev) => {
          const next = Math.max(5, needed);
          return prev === next ? prev : next; // avoid redundant re-renders
        });
      });
    };
    calc();
    window.addEventListener("resize", calc, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", calc);
    };
  }, [text, image]);

  /* Marquee tween — recreated only when repetitions / speed change */
  useEffect(() => {
    const setup = () => {
      if (!marqueeInnerRef.current) return;
      const part = marqueeInnerRef.current.querySelector(
        ".marquee-part",
      ) as HTMLElement | null;
      if (!part || part.offsetWidth === 0) return;
      marqueeTween.current?.kill();
      marqueeTween.current = gsap.to(marqueeInnerRef.current, {
        x: -part.offsetWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    };
    const id = setTimeout(setup, 60);
    return () => {
      clearTimeout(id);
      marqueeTween.current?.kill();
    };
  }, [repetitions, speed]);

  const handleMouseEnter = useCallback(
    (ev: React.MouseEvent<HTMLAnchorElement>) => {
      if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
        return;
      const r = itemRef.current.getBoundingClientRect();
      const edge = findClosestEdge(
        ev.clientX - r.left,
        ev.clientY - r.top,
        r.width,
        r.height,
      );
      gsap
        .timeline({ defaults: animationDefaults })
        .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
        .set(
          marqueeInnerRef.current,
          { y: edge === "top" ? "101%" : "-101%" },
          0,
        )
        .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);

      onCursorEnter(image);
    },
    [image, onCursorEnter],
  );

  const handleMouseLeave = useCallback(
    (ev: React.MouseEvent<HTMLAnchorElement>) => {
      if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
        return;
      const r = itemRef.current.getBoundingClientRect();
      const edge = findClosestEdge(
        ev.clientX - r.left,
        ev.clientY - r.top,
        r.width,
        r.height,
      );
      gsap
        .timeline({ defaults: animationDefaults })
        .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
        .to(
          marqueeInnerRef.current,
          { y: edge === "top" ? "101%" : "-101%" },
          0,
        );

      onCursorLeave();
    },
    [onCursorLeave],
  );

  return (
    <div
      ref={itemRef}
      className="flex-1 relative overflow-hidden"
      style={{ borderBottom: !isLast ? "1.5px solid #111" : "none" }}
    >
      <a
        href={link}
        className="flex items-center justify-start h-full relative uppercase font-black tracking-tight select-none px-10 md:px-16"
        style={{
          cursor: "none",
          color: "#111",
          fontSize: "clamp(2rem, 5.5vw, 5rem)",
          fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
          letterSpacing: "-0.01em",
          lineHeight: 1,
          textDecoration: "none",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        /* onMouseMove removed — no longer needed here */
      >
        {text}
        <span
          className="absolute right-8 md:right-14 bottom-3 text-xs font-mono text-black/20 tracking-widest"
          style={{ fontSize: "0.65rem" }}
        >
          ↗
        </span>
      </a>

      {/* Marquee overlay */}
      <div
        ref={marqueeRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ backgroundColor: "#111", transform: "translateY(101%)" }}
      >
        <div
          ref={marqueeInnerRef}
          className="flex h-full w-max items-center"
          style={{ transform: "translateY(-101%)" }}
        >
          {Array.from({ length: repetitions }, (_, idx) => (
            <div
              key={idx}
              className="marquee-part flex items-center flex-shrink-0"
            >
              <span
                className="whitespace-nowrap uppercase font-black px-8 text-white"
                style={{
                  fontSize: "clamp(2rem, 5.5vw, 5rem)",
                  fontFamily:
                    "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
                  letterSpacing: "-0.01em",
                }}
              >
                {text}
              </span>
              <div
                className="flex-shrink-0 rounded-full overflow-hidden mx-6 border-2 border-white/20"
                style={{
                  width: "clamp(100px, 14vw, 200px)",
                  height: "clamp(44px, 6.5vh, 80px)",
                  backgroundImage: `url(${image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   FlowingMenu (root)
───────────────────────────────────────── */
const FlowingMenu: React.FC<FlowingMenuProps> = ({
  items = [],
  speed = 14,
}) => {
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorImage, setCursorImage] = useState("");

  /* Preload all images so the cursor preview has no first-hover flash */
  useEffect(() => {
    items.forEach(({ image }) => {
      const img = new Image();
      img.src = image;
    });
  }, [items]);

  const handleCursorEnter = useCallback((image: string) => {
    setCursorImage(image);
    setCursorVisible(true);
  }, []);

  const handleCursorLeave = useCallback(() => {
    setCursorVisible(false);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; }
        /* Hide the native cursor across the entire menu */
        .flowing-menu, .flowing-menu * { cursor: none !important; }
      `}</style>

      <CustomCursor visible={cursorVisible} image={cursorImage} />

      <div
        className="flowing-menu w-full h-full overflow-hidden"
        style={{ backgroundColor: "#f5f4ef" }}
      >
        <div style={{ borderTop: "1.5px solid #111" }} />

        <nav className="flex flex-col h-full m-0 p-0">
          {items.map((item, idx) => (
            <MenuItem
              key={idx}
              {...item}
              speed={speed}
              onCursorEnter={handleCursorEnter}
              onCursorLeave={handleCursorLeave}
              isLast={idx === items.length - 1}
            />
          ))}
        </nav>

        <div style={{ borderBottom: "1.5px solid #111" }} />
      </div>
    </>
  );
};

export default FlowingMenu;
