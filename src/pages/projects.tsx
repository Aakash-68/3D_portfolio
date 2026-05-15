import { IconPlaneDeparture, type IconGitCommit } from "@tabler/icons-react";
import FlowingMenu, { MenuItemData } from "../components/Effects/FlowingMenu";
import ProjectPagePlaceholder from "./ProjectDetails/ProjectPagePlaceholder";
import CommitPP from "./ProjectDetails/commitPP";
import FileSharingPagePlaceholder from "./ProjectDetails/P2P";
import DinoPagePlaceholder from "./ProjectDetails/Dino";

/*
 * Each item now carries an `overlayContent` React node.
 * Swap `<ProjectPagePlaceholder …/>` for your own page component whenever
 * you're ready — it will render inside the same expand/collapse animation.
 *
 * The `link` field is still used by the CTA button inside the overlay
 * (and by the legacy fallback layout). Keep it pointing at the live URL.
 */
const demoItems: MenuItemData[] = [
  {
    link: "https://stripe.com",
    text: "Movie Website",
    image: "/3D_portfolio/assets/Images/MovieWeb1.png",
    overlayContent: (
      <ProjectPagePlaceholder
        title="Movie Website"
        images={[
          "/3D_portfolio/assets/Images/MovieWeb1.png",
          "/3D_portfolio/assets/Images/MovieWeb2.png",
        ]}
        link="https://stripe.com"
        tagline="An interactive movie browsing platform developed using React.js, Vite, and the TMDB API. The website allows users to explore popular films, search movies instantly, and access detailed information with a sleek responsive design. Through this project, I gained hands-on experience with REST APIs, async data fetching, component-based architecture, and responsive frontend development."
        tags={["React", "TMDB API", "Vite"]}
        year="2024"
      />
    ),
  },
  {
    link: "#/contact",
    text: "P2P File Sharing",
    image: "/3D_portfolio/assets/Images/p2p2.png",
    overlayContent: (
      <FileSharingPagePlaceholder
        title="P2P File Sharing"
        images="/3D_portfolio/assets/Images/p2p1.png"
        link="https://github.com/UNB-SWE4403/wi26-prj09-team-16"
        tagline="A distributed peer-to-peer file sharing system built using Python, designed under a Peer-to-Peer (P2P) architecture as part of a Software Architecture & Design Patterns course. The system enables decentralized file discovery, search, and direct file transfer between peers without relying on a central server. It supports both local network and localhost communication using a combination of TCP for reliable data transfer and UDP for peer discovery. Through this project, I gained practical experience in distributed systems design, network programming, and architectural decision-making in real-world software systems."
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
    image: "/3D_portfolio/assets/Images/Dino1.png",
    overlayContent: (
      <DinoPagePlaceholder
        title="Google Dino With NEAT"
        images="/3D_portfolio/assets/Images/Dino1.png"
        link="https://apple.com"
        tagline="An AI-powered version of the Google Dino game enhanced with the NEAT (NeuroEvolution of Augmenting Topologies) algorithm. The project trains neural networks to learn optimal gameplay strategies through evolutionary techniques rather than traditional hard-coded logic. Over generations, the AI progressively improves its ability to survive obstacles by evolving better-performing neural structures, demonstrating concepts of machine learning, neuroevolution, and reinforcement learning in a visual and interactive environment."
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
    image: "/3D_portfolio/assets/Images/commit1.png",
    overlayContent: (
      <CommitPP
        title="Commit Clock"
        images={[
          "/3D_portfolio/assets/Images/commit1.png",
          "/3D_portfolio/assets/Images/commit2.png",
        ]}
        link="https://vercel.com"
        tagline="Commit Clock is a Visual Studio Code extension designed to automate Git commits at user-defined time intervals. The extension provides an intuitive interface for configuring commit frequency, selecting branches, and managing automated commit sessions directly within VS Code. Built to support both local and remote development environments, this project helped me gain deeper experience with VS Code extension development, Git automation, workspace integration, and user-focused tooling design."
        tags={["VS Code API", "TypeScript", "GitHub", "JavaScript"]}
        year="2025"
      />
    ),
  },
];

export default function Projects() {
  return (
    <>
      {/* Mobile: fullscreen, no title */}
      <div className="md:hidden" style={{ width: "100vw", height: "100vh" }}>
        <FlowingMenu items={demoItems} speed={14} />
      </div>

      {/* Desktop: page layout with title + centred card */}
      <div
        className="flowing-menu hidden md:flex flex-col items-center"
        style={{
          width: "100vw",
          minHeight: "100vh",
          background: "#f5f4ef",
          paddingTop: "3rem",
          paddingBottom: "3rem",
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
          {/* Fly-to-game button */}
          <button
            className="absolute right-4 top-4 z-10 rounded-full p-2 bg-[#ffbbbb] text-[#aaa] transition hover:bg-[#b9b9b9] hover:text-[#555]"
            aria-label="Take off"
          >
            <a
              href="#/"
              className="flex items-center gap-1 text-[13px] text-[#555]"
            >
              <IconPlaneDeparture className="h-6 w-6" name="plane-departure" />
            </a>
          </button>

          <FlowingMenu items={demoItems} speed={14} />
        </div>
      </div>
    </>
  );
}
