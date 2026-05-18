import { IconPlaneDeparture, type IconGitCommit } from "@tabler/icons-react";
import FlowingMenu, { MenuItemData } from "../components/Effects/FlowingMenu";
import ProjectPagePlaceholder from "./ProjectDetails/ProjectPagePlaceholder";
import CommitPP from "./ProjectDetails/commitPP";
import FileSharingPagePlaceholder from "./ProjectDetails/P2P";
import DinoPagePlaceholder from "./ProjectDetails/Dino";

import { useEffect, useRef, useState } from "react";

/*
 * Each item now carries an `overlayContent` React node.
 * Swap `<ProjectPagePlaceholder …/>` for your own page component whenever
 * you're ready — it will render inside the same expand/collapse animation.
 *
 * The `link` field is still used by the CTA button inside the overlay
 * (and by the legacy fallback layout). Keep it pointing at the live URL.
 */
const BASE = (import.meta as any).env.BASE_URL;

const demoItems: MenuItemData[] = [
  {
    link: "https://stripe.com",
    text: "Movie Website",
    image: `${BASE}assets/Images/MovieWeb1.png`,
    overlayContent: (
      <ProjectPagePlaceholder
        title="Movie Website"
        images={[
          `${BASE}assets/Images/MovieWeb1.png`,
          `${BASE}assets/Images/MovieWeb2.png`,
        ]}
        link="https://stripe.com"
        tagline="An interactive movie browsing platform developed using React.js, Vite, and the TMDB API..."
        tags={["React", "TMDB API", "Vite"]}
        year="2024"
      />
    ),
  },
  {
    link: "#/contact",
    text: "P2P File Sharing",
    image: `${BASE}assets/Images/p2p2.png`,
    overlayContent: (
      <FileSharingPagePlaceholder
        title="P2P File Sharing"
        images={`${BASE}assets/Images/p2p1.png`}
        link="https://github.com/UNB-SWE4403/wi26-prj09-team-16"
        tagline="A distributed peer-to-peer file sharing system..."
        tags={[
          "Python",
          "P2P Architecture",
          "TCP/UDP Networking",
          "Distributed Systems",
          "Socket Programming",
        ]}
        year="2024"
      />
    ),
  },
  {
    link: "https://apple.com",
    text: "Google Dino With NEAT",
    image: `${BASE}assets/Images/Dino1.png`,
    overlayContent: (
      <DinoPagePlaceholder
        title="Google Dino With NEAT"
        images={`${BASE}assets/Images/Dino1.png`}
        link="https://apple.com"
        tagline="An AI-powered version of the Google Dino game..."
        tags={[
          "Python",
          "NEAT Algorithm",
          "Machine Learning",
          "Neuroevolution",
          "Pygame",
        ]}
        year="2023"
      />
    ),
  },
  {
    link: "https://vercel.com",
    text: "Commit Clock",
    image: `${BASE}assets/Images/commit1.png`,
    overlayContent: (
      <CommitPP
        title="Commit Clock"
        images={[
          `${BASE}assets/Images/commit1.png`,
          `${BASE}assets/Images/commit2.png`,
        ]}
        link="https://vercel.com"
        tagline="Commit Clock is a VS Code extension..."
        tags={["VS Code API", "TypeScript", "GitHub", "JavaScript"]}
        year="2025"
      />
    ),
  },
];

export default function Projects() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Staggered entry animation on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      {/* Mobile: fullscreen, no title */}
      <div className="md:hidden" style={{ width: "100vw", height: "100vh" }}>
        <FlowingMenu items={demoItems} speed={14} />
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

      {/* Desktop: page layout with title + centred card */}
      {/* Desktop: page layout with title + centred card */}
      <div
        className="flowing-menu hidden md:flex flex-col items-center"
        style={{
          width: "100vw",
          minHeight: "100vh",
          background: "#f5f4ef",
          paddingTop: "3rem",
          paddingBottom: "0", // ← remove bottom padding; footer handles its own
          boxSizing: "border-box",
        }}
      >
        <p
          style={{
            fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
            fontSize: "clamp(0.75rem, 1vw, 1rem)",
            letterSpacing: "0.3em",
            color: "#111",
            marginBottom: "2.5rem",
            textTransform: "uppercase",
          }}
        >
          Projects
        </p>

        <div
          style={{
            width: "80%",
            maxWidth: "1100px",
            height: "70vh",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <FlowingMenu items={demoItems} speed={14} />
        </div>

        {/* ── Divider ───────────────────────────────────────────────── */}
        <div
          style={{
            width: "80%",
            maxWidth: "1100px",
            borderTop: "1px solid #1a1a18",
            marginTop: "2rem", // ← gap between menu and line
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease 0.7s",
          }}
        />

        {/* ── Footer line ───────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between"
          style={{
            width: "80%",
            maxWidth: "1100px",
            paddingTop: "1.75rem",
            paddingBottom: "1.75rem",
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
    </>
  );
}
