import { IconPlaneDeparture } from "@tabler/icons-react";
import { useState } from "react";

const contactDetails = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-5 h-5"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: "Email",
    value: "aakash.27@unb.ca",
    href: "mailto:aakash.27@unb.ca",
    stamp: "📮",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-5 h-5"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
    label: "LinkedIn",
    value: "https://www.linkedin.com/in/aakash-yogabalu-0a85652a8/",
    href: "https://www.linkedin.com/in/aakash-yogabalu-0a85652a8/",
    stamp: "🔗",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-5 h-5"
      >
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
    label: "GitHub",
    value: "github.com/aakash-68",
    href: "https://github.com/Aakash-68",
    stamp: "💻",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        className="w-5 h-5"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: "Location",
    value: "Fredericton, NB, Canada",
    href: "https://maps.google.com/?q=Fredericton,NB",
    stamp: "📍",
  },
];

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setFormState({ name: "", email: "", message: "" });
  };
  const BASE = (import.meta as any).env.BASE_URL;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-y-auto overflow-auto rounded-lg shadow-lg bg-white/80 backdrop-blur-sm border border-[#5a3825]/20 lg:scale-[.8] lg:origin-center">
      {/* Background image */}
      <div
        className="hidden lg:block sm:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${BASE}/assets/Images/ContactBg.png)`,
        }}
      />
      {/* subtle warm overlay to unify */}
      <div className="   inset-0 bg-amber-50/10" />

      {/* Main postcard content — right half */}
      <div className="relative z-10 w-full min-h-screen flex">
        {/* Left spacer — left half belongs to the background art */}
        <div className="hidden lg:block lg:w-1/2" />

        {/* Right panel */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-12 py-16 gap-8">
          {/* ── Contact detail cards ── */}
          <button
            className="absolute left-4 top-4 rounded-full p-2 bg-[#ffbbbb] text-[#aaa] transition hover:bg-[#b9b9b9] hover:text-[#555]"
            aria-label="Take off"
          >
            <a
              href="#/"
              className="flex items-center gap-1 text-[13px] text-[#555]"
            >
              <IconPlaneDeparture className="h-6 w-6" name="plane-departure" />
            </a>
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contactDetails.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 bg-white/70 backdrop-blur-sm border border-[#5a3825]/20 rounded-sm px-4 py-3 shadow-sm hover:bg-white/90 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* stamp-corner */}
                <span className="text-base leading-none mt-0.5 select-none">
                  {item.stamp}
                </span>
                <div className="flex flex-col min-w-0">
                  <span
                    className="text-[10px] uppercase tracking-widest font-semibold"
                    style={{ color: "#5a3825", fontFamily: "monospace" }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="text-sm truncate mt-0.5 group-hover:underline"
                    style={{ color: "#2c1a0e" }}
                  >
                    {item.value}
                  </span>
                </div>
                <span
                  className="ml-auto text-[#5a3825]/40 group-hover:text-[#5a3825] transition-colors text-xs mt-1"
                  style={{ fontFamily: "monospace" }}
                >
                  →
                </span>
              </a>
            ))}
          </div>

          {/* ── Postcard ruled-line divider ── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-[#5a3825]/30" />
            <span
              className="text-[11px] uppercase tracking-[0.2em] text-[#5a3825]/60"
              style={{ fontFamily: "monospace" }}
            >
              write back
            </span>
            <div className="flex-1 border-t border-[#5a3825]/30" />
          </div>
        </div>
      </div>
    </section>
  );
}
