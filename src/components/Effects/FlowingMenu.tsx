import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
export interface MenuItemData {
  link: string;
  text: string;
  image: string;
  /**
   * Pass any React node here and it will be rendered inside the
   * full-screen overlay when the row is clicked.
   * If omitted the legacy description/tags/year layout is used.
   */
  overlayContent?: React.ReactNode;
  // Legacy fallback fields
  description?: string;
  tags?: string[];
  year?: string;
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
  onExpand: (item: MenuItemData, rect: DOMRect) => void;
}

/* ─────────────────────────────────────────
   Custom Cursor
───────────────────────────────────────── */
const CustomCursor: React.FC<{ visible: boolean; image: string }> = ({
  visible,
  image,
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);

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
   Project Detail Overlay
───────────────────────────────────────── */
interface OverlayProps {
  item: MenuItemData | null;
  sourceRect: DOMRect | null;
  onClose: () => void;
}

const ProjectOverlay: React.FC<OverlayProps> = ({
  item,
  sourceRect,
  onClose,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  /* Expand in */
  useEffect(() => {
    if (!item || !sourceRect || !overlayRef.current || !contentRef.current)
      return;
    if (isAnimating.current) return;
    isAnimating.current = true;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    gsap.set(overlayRef.current, {
      display: "flex",
      top: sourceRect.top,
      left: sourceRect.left,
      width: sourceRect.width,
      height: sourceRect.height,
      borderRadius: 0,
      opacity: 1,
    });
    gsap.set(contentRef.current, { opacity: 0, y: 30 });

    gsap
      .timeline({
        onComplete: () => {
          isAnimating.current = false;
        },
      })
      .to(overlayRef.current, {
        top: 0,
        left: 0,
        width: vw,
        height: vh,
        duration: 0.65,
        ease: "expo.inOut",
      })
      .to(
        contentRef.current,
        { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" },
        "-=0.15",
      );
  }, [item, sourceRect]);

  /* Collapse out */
  const handleClose = useCallback(() => {
    if (!overlayRef.current || !contentRef.current || !sourceRect) return;
    if (isAnimating.current) return;
    isAnimating.current = true;

    gsap
      .timeline({
        onComplete: () => {
          isAnimating.current = false;
          onClose();
        },
      })
      .to(contentRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.25,
        ease: "power2.in",
      })
      .to(
        overlayRef.current,
        {
          top: sourceRect.top,
          left: sourceRect.left,
          width: sourceRect.width,
          height: sourceRect.height,
          duration: 0.55,
          ease: "expo.inOut",
        },
        "-=0.05",
      )
      .set(overlayRef.current, { display: "none" });
  }, [sourceRect, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  if (!item) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed z-[8888] overflow-hidden"
      style={{
        display: "none",
        background: "#111",
        color: "#f5f4ef",
        flexDirection: "column",
      }}
    >
      {/* Close button — always floats on top regardless of content */}
      <button
        onClick={handleClose}
        className="absolute z-10 flex items-center justify-center transition-all duration-200"
        style={{
          cursor: "none",
          top: "clamp(1rem, 3vw, 2.5rem)",
          right: "clamp(1rem, 3vw, 2.5rem)",
          background: "none",
          border: "1.5px solid #f5f4ef44",
          borderRadius: "50%",
          width: "clamp(2.5rem, 4vw, 3.5rem)",
          height: "clamp(2.5rem, 4vw, 3.5rem)",
          color: "#f5f4ef",
          fontSize: "1.2rem",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#f5f4ef22";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#f5f4ef";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "none";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "#f5f4ef44";
        }}
        aria-label="Close"
      >
        ✕
      </button>

      {/* Animated content wrapper */}
      <div ref={contentRef} className="w-full h-full overflow-auto">
        {item.overlayContent ? (
          /*
           * ── CUSTOM COMPONENT PATH ──────────────────────────────────────────
           * Render the React node the caller passed via `overlayContent`.
           * It fills the entire overlay canvas; the close button floats above.
           */
          <div className="w-full h-full">{item.overlayContent}</div>
        ) : (
          /*
           * ── LEGACY FALLBACK ────────────────────────────────────────────────
           * Original hardcoded layout using description / tags / year / link.
           */
          <div
            className="flex flex-col h-full w-full"
            style={{ padding: "clamp(1.5rem, 5vw, 4rem)" }}
          >
            {/* Top bar — right-padding accounts for the absolute close button */}
            <div
              className="flex items-start mb-8"
              style={{ paddingRight: "clamp(3.5rem, 7vw, 6rem)" }}
            >
              <div>
                <p
                  style={{
                    fontFamily:
                      "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
                    fontSize: "clamp(0.6rem, 1vw, 0.85rem)",
                    letterSpacing: "0.35em",
                    color: "#f5f4ef88",
                    marginBottom: "0.5rem",
                    textTransform: "uppercase",
                  }}
                >
                  {item.year ?? "Project"}
                </p>
                <h1
                  style={{
                    fontFamily:
                      "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
                    fontSize: "clamp(3.5rem, 12vw, 10rem)",
                    lineHeight: 0.9,
                    letterSpacing: "-0.02em",
                    color: "#f5f4ef",
                    margin: 0,
                  }}
                >
                  {item.text}
                </h1>
              </div>
            </div>

            <div
              style={{
                borderTop: "1.5px solid #f5f4ef22",
                marginBottom: "2rem",
              }}
            />

            <div className="flex-1 flex flex-col md:flex-row gap-8 min-h-0">
              <div
                className="relative overflow-hidden rounded-xl flex-shrink-0"
                style={{
                  width: "100%",
                  maxWidth: "clamp(280px, 45vw, 620px)",
                  height: "clamp(180px, 35vh, 420px)",
                }}
              >
                <img
                  src={item.image}
                  alt={item.text}
                  className="w-full h-full object-cover"
                  style={{ display: "block" }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
                    pointerEvents: "none",
                  }}
                />
              </div>

              <div className="flex flex-col justify-between flex-1">
                <div>
                  <p
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontSize: "clamp(0.95rem, 1.5vw, 1.2rem)",
                      lineHeight: 1.7,
                      color: "#f5f4efcc",
                      maxWidth: "520px",
                    }}
                  >
                    {item.description ??
                      "A carefully crafted project built with precision and intention. Click the link below to explore it fully."}
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6">
                      {item.tags.map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            fontFamily:
                              "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
                            fontSize: "0.7rem",
                            letterSpacing: "0.2em",
                            padding: "0.3em 0.9em",
                            border: "1px solid #f5f4ef33",
                            borderRadius: "999px",
                            color: "#f5f4ef99",
                            textTransform: "uppercase",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <a
                  href={item.link}
                  style={{
                    cursor: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: "2rem",
                    padding: "0.75em 1.8em",
                    background: "#f5f4ef",
                    color: "#111",
                    borderRadius: "999px",
                    fontFamily:
                      "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
                    fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)",
                    letterSpacing: "0.15em",
                    textDecoration: "none",
                    textTransform: "uppercase",
                    alignSelf: "flex-start",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.opacity =
                      "0.8")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
                  }
                >
                  View Project ↗
                </a>
              </div>
            </div>
          </div>
        )}
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
  description,
  tags,
  year,
  overlayContent,
  speed,
  onCursorEnter,
  onCursorLeave,
  isLast,
  onExpand,
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
          return prev === next ? prev : next;
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

  const handleClick = useCallback(
    (ev: React.MouseEvent<HTMLAnchorElement>) => {
      ev.preventDefault();
      if (!itemRef.current) return;
      const rect = itemRef.current.getBoundingClientRect();
      onExpand(
        { link, text, image, description, tags, year, overlayContent },
        rect,
      );
    },
    [link, text, image, description, tags, year, overlayContent, onExpand],
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
        onClick={handleClick}
      >
        {text}
        <span
          className="absolute right-8 md:right-14 bottom-3 text-xs font-mono text-black/20 tracking-widest"
          style={{ fontSize: "0.65rem" }}
        >
          ↗
        </span>
      </a>

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
  const [expandedItem, setExpandedItem] = useState<MenuItemData | null>(null);
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null);

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
  const handleExpand = useCallback((item: MenuItemData, rect: DOMRect) => {
    setSourceRect(rect);
    setExpandedItem(item);
    setCursorVisible(false);
  }, []);
  const handleClose = useCallback(() => {
    setExpandedItem(null);
    setSourceRect(null);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; }
        .flowing-menu, .flowing-menu * { cursor: none !important; }
      `}</style>

      <CustomCursor visible={cursorVisible} image={cursorImage} />
      <ProjectOverlay
        item={expandedItem}
        sourceRect={sourceRect}
        onClose={handleClose}
      />

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
              onExpand={handleExpand}
            />
          ))}
        </nav>
        <div style={{ borderBottom: "1.5px solid #111" }} />
      </div>
    </>
  );
};

export default FlowingMenu;
