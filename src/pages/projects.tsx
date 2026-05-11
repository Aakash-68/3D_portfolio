import { IconPlaneDeparture } from "@tabler/icons-react";
import FlowingMenu from "../components/Effects/FlowingMenu";

const demoItems = [
  {
    link: "https://stripe.com",
    text: "Movie APP",
    image: "https://picsum.photos/600/400?random=22",
  },
  {
    link: "#/contact",
    text: "ML Pipeline",
    image: "https://picsum.photos/600/400?random=44",
  },
  {
    link: "https://apple.com",
    text: "Google Dino With NEAT",
    image: "https://picsum.photos/600/400?random=11",
  },
  {
    link: "https://vercel.com",
    text: "Commit Clock- Vs Code extension",
    image: "https://picsum.photos/600/400?random=33",
  },
];

export default function Projects() {
  return (
    <>
      {/* Mobile: fullscreen, no title */}
      <div className="md:hidden" style={{ width: "100vw", height: "100vh" }}>
        <FlowingMenu items={demoItems} speed={14} />
      </div>

      {/* Desktop: page layout with title + centered/zoomed-out card */}
      {/*
        ↓ "flowing-menu" class added here so cursor: none !important
          covers the button and everything else on this page,
          not just the FlowingMenu div itself.
      */}
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
        {/* Title */}
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

        {/* Zoomed-out container */}
        <div
          style={{
            width: "80%",
            maxWidth: "1100px",
            height: "70vh",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Button is now inside the flowing-menu scope → no native cursor */}
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
