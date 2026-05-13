import React from "react";

/**
 * ProjectPagePlaceholder
 *
 * Drop this into a MenuItemData's `overlayContent` prop.
 * The component receives the project name + image via props so it can
 * render something meaningful even as a placeholder.
 *
 * Replace the contents with your real per-project page later — the
 * overlay animation wrapper in FlowingMenu handles all the expand/collapse.
 */

interface ProjectPageProps {
  /** Project title (same as MenuItemData.text) */
  title: string;
  /** Hero image URL (same as MenuItemData.image) */
  image: string;
  /** External link to live project */
  link?: string;
  /** Short one-liner */
  tagline?: string;
  /** Tech stack / tags */
  tags?: string[];
  /** Year */
  year?: string;
}

const ProjectPagePlaceholder: React.FC<ProjectPageProps> = ({
  title,
  image,
  link = "#",
  tagline = "Edit this component to describe the project.",
  tags = [],
  year,
}) => {
  return (
    <div
      className="w-full h-full flex flex-col overflow-auto"
      style={{
        background: "#111",
        color: "#f5f4ef",
        fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
        /* leave top-right room for the floating ✕ button */
        paddingTop: "clamp(1.5rem, 5vw, 4rem)",
        paddingRight: "clamp(1.5rem, 5vw, 4rem)",
        paddingBottom: "clamp(1.5rem, 5vw, 4rem)",
        paddingLeft: "clamp(1.5rem, 5vw, 4rem)",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mb-6" style={{ paddingRight: "clamp(3rem, 6vw, 5rem)" }}>
        {year && (
          <p
            style={{
              fontSize: "clamp(0.6rem, 1vw, 0.85rem)",
              letterSpacing: "0.35em",
              color: "#f5f4ef55",
              marginBottom: "0.4rem",
              textTransform: "uppercase",
            }}
          >
            {year}
          </p>
        )}
        <h1
          style={{
            fontSize: "clamp(3rem, 10vw, 9rem)",
            lineHeight: 0.88,
            letterSpacing: "-0.02em",
            color: "#f5f4ef",
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      {/* ── Thin divider ────────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid #f5f4ef1a", marginBottom: "2rem" }} />

      {/* ── Two-column body ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-10 min-h-0">

        {/* Left — hero image */}
        <div
          className="relative overflow-hidden rounded-2xl flex-shrink-0"
          style={{
            width: "100%",
            maxWidth: "clamp(260px, 48vw, 680px)",
            height: "clamp(180px, 38vh, 480px)",
          }}
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            style={{ display: "block" }}
          />
          {/* scanline grain */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
            }}
          />
          {/* bottom vignette */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
            style={{ background: "linear-gradient(to top, #111 0%, transparent 100%)" }}
          />
        </div>

        {/* Right — text body */}
        <div className="flex flex-col justify-between flex-1 gap-6">

          {/* Tagline / body copy area */}
          <div>
            <p
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(1rem, 1.6vw, 1.3rem)",
                lineHeight: 1.75,
                color: "#f5f4efbb",
                maxWidth: "540px",
                marginBottom: "1.5rem",
              }}
            >
              {tagline}
            </p>

            {/* Placeholder content blocks */}
            <div className="flex flex-col gap-3">
              {["Overview", "Tech Stack", "Highlights"].map((section) => (
                <div
                  key={section}
                  className="rounded-xl p-4"
                  style={{ border: "1px solid #f5f4ef0f", background: "#f5f4ef07" }}
                >
                  <p
                    style={{
                      fontSize: "0.62rem",
                      letterSpacing: "0.3em",
                      color: "#f5f4ef44",
                      textTransform: "uppercase",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {section}
                  </p>
                  <p
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontSize: "0.9rem",
                      color: "#f5f4ef55",
                      lineHeight: 1.6,
                    }}
                  >
                    Replace this with real content for the {title} project.
                  </p>
                </div>
              ))}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "0.65rem",
                      letterSpacing: "0.2em",
                      padding: "0.3em 0.85em",
                      border: "1px solid #f5f4ef22",
                      borderRadius: "999px",
                      color: "#f5f4ef77",
                      textTransform: "uppercase",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              cursor: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75em 1.8em",
              background: "#f5f4ef",
              color: "#111",
              borderRadius: "999px",
              fontSize: "clamp(0.8rem, 1.4vw, 1rem)",
              letterSpacing: "0.15em",
              textDecoration: "none",
              textTransform: "uppercase",
              alignSelf: "flex-start",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.75")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
          >
            View Live ↗
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProjectPagePlaceholder;
