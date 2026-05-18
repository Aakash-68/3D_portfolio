"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, ValidationError } from "@formspree/react";

const socialLinks = [
  {
    label: "Email",
    value: "aakash.yogabalu@gmail.com",
    href: "mailto:aakash.yogabalu@gmail.com",
  },
  {
    label: "GitHub",
    value: "github.com/aakash-68",
    href: "https://github.com/Aakash-68",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/aakash-yogabalu",
    href: "https://www.linkedin.com/in/aakash-yogabalu-0a85652a8/",
  },
];

export default function ContactPage() {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  // ── Formspree hook ────────────────────────────────────────────────────────
  const [state, handleSubmit] = useForm("meedqrae");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // ── Shared transition helper ──────────────────────────────────────────────
  const fade = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  });

  // ── Underline-on-focus input style ───────────────────────────────────────
  const inputBase: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #1a1a18",
    padding: "6px 0 8px",
    fontFamily: '"DM Serif Display", serif',
    fontSize: "16px",
    color: "#1a1a18",
    outline: "none",
    borderRadius: 0,
  };

  return (
    <main className="min-h-screen w-full" style={{ background: "#ECEAE3" }}>
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header
        className="w-full flex items-center justify-center pt-8"
        style={fade(0)}
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
          Contact
        </span>
      </header>

      {/* ── Top rule ─────────────────────────────────────────────────── */}
      <div
        className="mx-auto mt-6"
        style={{
          maxWidth: "860px",
          borderTop: "1px solid #1a1a18",
          ...fade(0.08),
        }}
      />

      <div
        className="mx-auto px-8 md:px-12 relative"
        style={{ maxWidth: "860px" }}
      >
        <div
          className="absolute top-0 right-8 md:right-12 flex justify-end"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.7)",
            transition: "opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s",
          }}
        ></div>

        {/* ── Headline ─────────────────────────────────────────────── */}
        <div style={fade(0.12)} className="mt-4">
          <h1
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: "clamp(72px, 14vw, 124px)",
              lineHeight: "0.88",
              letterSpacing: "0.02em",
              color: "#1a1a18",
            }}
          >
            LET'S
            <br />
            TALK
          </h1>
        </div>

        {/* ── Subline ──────────────────────────────────────────────── */}
        <div
          style={{ ...fade(0.22), marginTop: "1rem", marginBottom: "1.75rem" }}
        >
          <span
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: "10px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#888880",
            }}
          >
            Let's build something together.
          </span>
        </div>

        {/* ── Rule ─────────────────────────────────────────────────── */}
        <div
          style={{
            borderTop: "1px solid #1a1a18",
            ...fade(0.26),
          }}
        />

        {/* ── Two-column layout ────────────────────────────────────── */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mt-10 pb-16"
          style={fade(0.32)}
        >
          {/* ── LEFT — Form ────────────────────────────────────────── */}
          <div>
            {state.succeeded ? (
              /* ── Success state ─────────────────────────────────── */
              <div className="pt-4">
                <p
                  style={{
                    fontFamily: '"Bebas Neue", sans-serif',
                    fontSize: "48px",
                    lineHeight: "0.9",
                    color: "#1a1a18",
                    marginBottom: "1rem",
                  }}
                >
                  MESSAGE
                  <br />
                  SENT ✓
                </p>
                <p
                  style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontStyle: "italic",
                    fontSize: "15px",
                    color: "#555550",
                    lineHeight: "1.6",
                  }}
                >
                  Thanks for reaching out — I'll get back to you as soon as I
                  can.
                </p>
              </div>
            ) : (
              /* ── Form ──────────────────────────────────────────── */
              <form onSubmit={handleSubmit} noValidate>
                {/* Name */}
                <div className="mb-7">
                  <label
                    htmlFor="name"
                    style={{
                      fontFamily: '"Space Mono", monospace',
                      fontSize: "9px",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#888880",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                    placeholder="Your name"
                    style={{
                      ...inputBase,
                      borderBottomColor:
                        focused === "name" ? "#F2A7A0" : "#1a1a18",
                      borderBottomWidth: focused === "name" ? "2px" : "1px",
                      transition: "border-color 0.2s, border-width 0.2s",
                    }}
                  />
                  <ValidationError
                    field="name"
                    prefix="Name"
                    errors={state.errors}
                    style={{
                      fontFamily: '"Space Mono", monospace',
                      fontSize: "9px",
                      color: "#c0392b",
                      marginTop: "4px",
                      display: "block",
                    }}
                  />
                </div>

                {/* Email */}
                <div className="mb-7">
                  <label
                    htmlFor="email"
                    style={{
                      fontFamily: '"Space Mono", monospace',
                      fontSize: "9px",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#888880",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    placeholder="your@email.com"
                    style={{
                      ...inputBase,
                      borderBottomColor:
                        focused === "email" ? "#F2A7A0" : "#1a1a18",
                      borderBottomWidth: focused === "email" ? "2px" : "1px",
                      transition: "border-color 0.2s, border-width 0.2s",
                    }}
                  />
                  <ValidationError
                    field="email"
                    prefix="Email"
                    errors={state.errors}
                    style={{
                      fontFamily: '"Space Mono", monospace',
                      fontSize: "9px",
                      color: "#c0392b",
                      marginTop: "4px",
                      display: "block",
                    }}
                  />
                </div>

                {/* Message */}
                <div className="mb-2">
                  <label
                    htmlFor="message"
                    style={{
                      fontFamily: '"Space Mono", monospace',
                      fontSize: "9px",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#888880",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    onFocus={() => setFocused("message")}
                    onBlur={() => setFocused(null)}
                    placeholder="Tell me what you're building..."
                    style={{
                      ...inputBase,
                      resize: "none",
                      borderBottomColor:
                        focused === "message" ? "#F2A7A0" : "#1a1a18",
                      borderBottomWidth: focused === "message" ? "2px" : "1px",
                      transition: "border-color 0.2s, border-width 0.2s",
                    }}
                  />
                  <ValidationError
                    field="message"
                    prefix="Message"
                    errors={state.errors}
                    style={{
                      fontFamily: '"Space Mono", monospace',
                      fontSize: "9px",
                      color: "#c0392b",
                      marginTop: "4px",
                      display: "block",
                    }}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={state.submitting}
                  style={{
                    marginTop: "1.75rem",
                    fontFamily: '"Bebas Neue", sans-serif',
                    fontSize: "24px",
                    letterSpacing: "0.08em",
                    background: state.submitting ? "#555550" : "#1a1a18",
                    color: "#ECEAE3",
                    border: "none",
                    padding: "10px 28px",
                    cursor: state.submitting ? "not-allowed" : "pointer",
                    borderRadius: "1px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    transition: "background 0.2s, letter-spacing 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!state.submitting)
                      (
                        e.currentTarget as HTMLButtonElement
                      ).style.letterSpacing = "0.14em";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.letterSpacing =
                      "0.08em";
                  }}
                >
                  {state.submitting ? "SENDING..." : "SEND IT"}
                  {!state.submitting && <span>→</span>}
                </button>
              </form>
            )}
          </div>

          {/* ── RIGHT — Links ───────────────────────────────────────── */}
          <div className="pt-1">
            {socialLinks.map((link, i) => (
              <div
                key={link.label}
                className="mb-6"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(10px)",
                  transition: `opacity 0.5s ease ${0.4 + i * 0.07}s, transform 0.5s ease ${0.4 + i * 0.07}s`,
                }}
              >
                <span
                  style={{
                    fontFamily: '"Space Mono", monospace',
                    fontSize: "9px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#888880",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  {link.label}
                </span>
                <a
                  href={link.href}
                  target={link.href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontSize: "17px",
                    color: "#1a1a18",
                    textDecoration: "none",
                    display: "inline-block",
                    borderBottom: "1px solid transparent",
                    paddingBottom: "1px",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((
                      e.currentTarget as HTMLAnchorElement
                    ).style.borderBottomColor = "#1a1a18")
                  }
                  onMouseLeave={(e) =>
                    ((
                      e.currentTarget as HTMLAnchorElement
                    ).style.borderBottomColor = "transparent")
                  }
                >
                  {link.value}
                </a>
              </div>
            ))}

            {/* ── Availability badge ─────────────────────────────── */}
            <div
              style={{
                marginTop: "2rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: '"Space Mono", monospace',
                fontSize: "9px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#1a1a18",
                border: "1px solid #1a1a18",
                padding: "6px 14px",
                borderRadius: "1px",
                opacity: visible ? 1 : 0,
                transition: "opacity 0.5s ease 0.7s",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  background: "#4a7c59",
                  borderRadius: "50%",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              Available for work
            </div>
          </div>
        </div>

        {/* ── Bottom rule ──────────────────────────────────────────── */}
        <div
          style={{
            borderTop: "1px solid #1a1a18",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.5s ease 0.75s",
          }}
        />

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
