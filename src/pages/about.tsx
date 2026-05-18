"use client";

import { useEffect, useRef, useState } from "react";
import RotatingText from "../components/Effects/RotatingText";
import { FloatingDockDemo } from "../components/Effects/FlocatingDockComp";
import CurvedLoop from "../components/Effects/Ribbon";
import { IconPlaneDeparture } from "@tabler/icons-react";

// ─── Tailwind config note ────────────────────────────────────────────────────
// Add to your tailwind.config.js:
//   fontFamily: { bebas: ['"Bebas Neue"', 'sans-serif'], mono: ['"Space Mono"', 'monospace'], serif: ['"DM Serif Display"', 'serif'] }
// Add to your globals.css:
//   @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=Space+Mono:wght@400;700&display=swap');
// ─────────────────────────────────────────────────────────────────────────────

const skills = [
  "React",
  "TypeScript",
  "Node.js",
  "Tailwind CSS",
  "Next.js",
  "PostgreSQL",
  "Python",
  "Java",
  "Blender",
  "Davinci Resolve",
  "Git",
  "Figma",
  "Machine Learning",
  "UI/UX Design",
  "3D Modeling",
  "Data Visualization",
  "SQL",
];

const links = [
  { label: "GitHub", href: "https://github.com/Aakash-68" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/aakash-yogabalu-0a85652a8/",
  },
  { label: "Email", href: "mailto: aakash27@unb.ca" },
  {
    label: "Resume",
    href: "https://drive.google.com/uc?export=download&id=16KnxyIdTcmNvti3dfnE6Rx2NERtx_qAO",
  },
];

export default function About() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Staggered entry animation on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <main
      className="min-h-screen w-full"
      style={{ background: "#ECEAE3", fontFamily: "inherit" }}
    >
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header
        className="w-full flex items-center justify-center pt-8 pb-0"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <span
          style={{
            fontFamily: '"Space Mono", monospace',
            fontSize: "11px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#1a1a18",
          }}
        >
          About
        </span>
      </header>

      {/* ── Top rule ─────────────────────────────────────────────────── */}
      <div
        className="mx-auto mt-6"
        style={{
          maxWidth: "820px",
          borderTop: "1px solid #1a1a18",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.5s ease 0.1s",
        }}
      />

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div
        ref={ref}
        className="mx-auto px-8 md:px-12"
        style={{ maxWidth: "820px" }}
      >
        {/* Pink accent icon — top right, matching Projects page */}
        <div
          className="flex justify-end"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.7)",
            transition: "opacity 0.4s ease 0.25s, transform 0.4s ease 0.25s",
          }}
        >
          <div
            className="flex items-center justify-center mt-6"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              fontSize: "18px",
              userSelect: "none",
            }}
          ></div>
        </div>

        {/* ── Name — the centrepiece ───────────────────────────────────── */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s",
          }}
        >
          <h1
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: "clamp(72px, 14vw, 128px)",
              lineHeight: "0.88",
              letterSpacing: "0.02em",
              color: "#1a1a18",
              marginTop: "-0.15em",
            }}
          >
            HI, I'M
            <br />
            AAKASH
          </h1>
        </div>

        {/* ── Role tag ─────────────────────────────────────────────────── */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s",
            marginTop: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <span
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: "20px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#888880",
            }}
          >
            <RotatingText
              texts={["Software Engineer", "Web-Devloper", "3D-Artist"]}
              mainClassName="text-black overflow-hidden  rounded-lg"
              staggerFrom="first"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 400,
              }}
              rotationInterval={4000}
              splitBy="characters"
              elementLevelClassName="italic"
              auto
              loop
            />
          </span>
        </div>

        {/* ── Rule ─────────────────────────────────────────────────────── */}
        <div
          style={{
            borderTop: "1px solid #1a1a18",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease 0.35s",
          }}
        />

        {/* ── Bio ──────────────────────────────────────────────────────── */}
        <div
          className="grid md:grid-cols-2 gap-12 mt-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s",
          }}
        >
          <div>
            <span
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: "18px",
                lineHeight: "1.65",
                color: "#333330",
              }}
            >
              I’m a Software Engineering student at the University of New
              Brunswick with a strong interest in{" "}
            </span>

            <span
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontStyle: "italic",
                fontSize: "16px",
                lineHeight: "1.65",
                color: "#555550",
                marginTop: "1rem",
              }}
            >
              3D art, UI design, and machine learning.{" "}
            </span>
            <span
              style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: "18px",
                lineHeight: "1.65",
                color: "#333330",
              }}
            >
              I enjoy blending creativity with technical problem-solving,
              exploring visual design systems, and building data-driven
              solutions through ML.
            </span>
          </div>

          {/* ── Skills ─────────────────────────────────────────────────── */}
          <div>
            <p
              style={{
                fontFamily: '"Space Mono", monospace',
                fontSize: "10px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#888880",
                marginBottom: "0.75rem",
              }}
            >
              Stack
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <span
                  key={s}
                  style={{
                    fontFamily: '"Space Mono", monospace',
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    border: "1px solid #1a1a18",
                    color: "#1a1a18",
                    padding: "5px 12px",
                    borderRadius: "1px",
                    background: "transparent",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(8px)",
                    transition: `opacity 0.4s ease ${0.45 + i * 0.06}s, transform 0.4s ease ${0.45 + i * 0.06}s`,
                    display: "inline-block",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Rule ─────────────────────────────────────────────────────── */}
        <div
          style={{
            borderTop: "1px solid #1a1a18",
            marginTop: "3rem",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease 0.6s",
          }}
        />

        {/* ── CTA row ──────────────────────────────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between py-6 gap-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.5s ease 0.65s, transform 0.5s ease 0.65s",
          }}
        >
          {/* Primary CTA */}
          <a
            href="#projects"
            className="group inline-flex items-center gap-3"
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: "28px",
              letterSpacing: "0.06em",
              color: "#1a1a18",
              textDecoration: "none",
              transition: "letter-spacing 0.25s ease",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.letterSpacing =
                "0.12em")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.letterSpacing =
                "0.06em")
            }
          >
            SEE MY WORK
            <span
              style={{
                display: "inline-block",
                transition: "transform 0.25s ease",
              }}
              className="group-hover:translate-x-2"
            >
              →
            </span>
          </a>

          {/* Secondary links */}
          <div className="flex gap-6">
            {links.map((link) => (
              <a
                target="_blank"
                key={link.label}
                href={link.href}
                style={{
                  fontFamily: '"Space Mono", monospace',
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#888880",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "#1a1a18")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color =
                    "#888880")
                }
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* ── Bottom rule ──────────────────────────────────────────────── */}
        <div
          style={{
            borderTop: "1px solid #1a1a18",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease 0.7s",
          }}
        />
        <footer
          className="pt-10 "
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(-8px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <CurvedLoop
            marqueeText="SQL ✦ Blender ✦ Davinci ✦ React ✦ Java ✦ Python ✦ HTML/CSS ✦ Java ✦"
            speed={2}
            curveAmount={0}
            direction="right"
            interactive
            className="custom-text-style"
          />
        </footer>
        {/* ── Footer line ──────────────────────────────────────────── */}
        <div
          className="py-6 flex items-center justify-between"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease 0.8s",
          }}
        >
          <span
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: "9px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#888880",
            }}
          >
            © {new Date().getFullYear()} Aakash
          </span>
          <a
            href="/"
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: "20px",
              letterSpacing: "0.06em",
              color: "#1a1a18",
              textDecoration: "none",
              transition: "letter-spacing 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.letterSpacing =
                "0.12em")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.letterSpacing =
                "0.06em")
            }
          >
            ← BACK HOME
          </a>
        </div>
      </div>
    </main>
  );
}
