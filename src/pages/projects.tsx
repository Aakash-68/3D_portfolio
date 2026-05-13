import { IconPlaneDeparture } from "@tabler/icons-react";
import FlowingMenu, { MenuItemData } from "../components/Effects/FlowingMenu";
import ProjectPagePlaceholder from "./ProjectPagePlaceholder";

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
        image="/3D_portfolio/assets/Images/MovieWeb2.png"
        link="https://stripe.com"
        tagline="A sleek, cinematic browsing experience for discovering and tracking films."
        tags={["React", "TMDB API", "TailwindCSS"]}
        year="2024"
      />
    ),
  },
  {
    link: "#/contact",
    text: "P2P File Sharing",
    image: "https://picsum.photos/600/400?random=44",
    overlayContent: (
      <ProjectPagePlaceholder
        title="P2P File Sharing"
        image="https://picsum.photos/600/400?random=44"
        link="#/contact"
        tagline="Browser-native peer-to-peer file transfer with zero server storage."
        tags={["WebRTC", "Node.js", "TypeScript"]}
        year="2024"
      />
    ),
  },
  {
    link: "https://apple.com",
    text: "Google Dino With NEAT",
    image: "/3D_portfolio/assets/Images/Dino1.png",
    overlayContent: (
      <ProjectPagePlaceholder
        title="Google Dino With NEAT"
        image="/3D_portfolio/assets/Images/Dino1.png"
        link="https://apple.com"
        tagline="Teaching a neural network to play Chrome's offline dinosaur game via neuroevolution."
        tags={["Python", "NEAT", "Pygame"]}
        year="2023"
      />
    ),
  },
  {
    link: "https://vercel.com",
    text: "Commit Clock",
    image: "https://picsum.photos/600/400?random=33",
    overlayContent: (
      <ProjectPagePlaceholder
        title="Commit Clock"
        image="https://picsum.photos/600/400?random=33"
        link="https://vercel.com"
        tagline="A VS Code extension that visualises your coding sessions as a living commit timeline."
        tags={["VS Code API", "TypeScript", "GitHub"]}
        year="2023"
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
            className="absolute right-4 top-4 z-10 rounded-full p-2 bg-[#eee] text-[#aaa] transition hover:bg-[#b9b9b9] hover:text-[#555]"
            aria-label="Take off"
          >
            <a
              href="#/t"
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
