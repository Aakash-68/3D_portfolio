import { IconPlaneDeparture } from "@tabler/icons-react";
import { Icon } from "lucide-react";
import { useState } from "react";

const TO = "aakash.27@unb.ca";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [sent, setSent] = useState<boolean>(false);

  const onChange = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
  };

  const handleSend = (): void => {
    const mailto =
      `mailto:${TO}` +
      `?subject=${encodeURIComponent(form.subject || "(no subject)")}` +
      `&body=${encodeURIComponent(
        `Hi, my name is ${form.name}.\n\n${form.message}\n\nReply to: ${form.email}`,
      )}`;

    window.location.href = mailto;

    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#fdf8f5] px-5 py-10">
      {/* Orbs */}
      <div className="pointer-events-none absolute left-[15%] top-[10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(255,180,140,0.45)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-[10%] right-[15%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(220,160,200,0.35)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,210,170,0.3)_0%,transparent_70%)]" />

      {/* Header */}
      <div className="z-10 mb-3 text-[13px] font-semibold uppercase tracking-[0.04em] text-[#aaa]">
        Let&apos;s create something together.
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] rounded-[20px] border border-black/5 bg-white/90 p-9 shadow-[0_8px_40px_rgba(0,0,0,0.06)] backdrop-blur-[20px]">
        <button
          className="absolute right-4 top-4 rounded-full p-2 bg-[#eee] text-[#aaa] transition hover:bg-[#b9b9b9] hover:text-[#555]"
          aria-label="Take off"
        >
          <a
            href="#/t"
            className="flex items-center gap-1 text-[13px] text-[#555]"
          >
            <IconPlaneDeparture className="h-4 w-4" name="plane-departure" />
          </a>
        </button>
        <h2 className="m-0 text-[22px] font-bold tracking-[-0.3px] text-[#111]">
          Send me a mail ✉️
        </h2>

        <p className="mt-1.5 text-[13.5px] text-[#888]">
          Drop a message and I&apos;ll get back soon ✨
        </p>

        <div className="my-5 h-px bg-[#f0eded]" />

        {/* Fields */}
        <div className="flex flex-col gap-[18px]">
          {/* Name */}
          <div className="flex flex-col gap-[7px]">
            <label className="flex items-center gap-1 text-[13px] font-semibold text-[#222]">
              Your Name <span className="text-[#e55]">*</span>
            </label>

            <input
              className="w-full rounded-[10px] border border-[#e8e4e0] bg-[#fdfcfb] px-3.5 py-2.5 text-[14px] text-[#333] outline-none transition focus:border-black/20"
              type="text"
              placeholder="Alex Ratner"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-[7px]">
            <label className="flex items-center gap-1 text-[13px] font-semibold text-[#222]">
              Your Email <span className="text-[#e55]">*</span>
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-[13px] text-[#aaa]">
                ✉
              </span>

              <input
                className="w-full rounded-[10px] border border-[#e8e4e0] bg-[#fdfcfb] py-2.5 pl-9 pr-3.5 text-[14px] text-[#333] outline-none transition focus:border-black/20"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
              />
            </div>
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] font-semibold text-[#222]">
              Subject
            </label>

            <input
              className="w-full rounded-[10px] border border-[#e8e4e0] bg-[#fdfcfb] px-3.5 py-2.5 text-[14px] text-[#333] outline-none transition focus:border-black/20"
              type="text"
              placeholder="What's on your mind?"
              value={form.subject}
              onChange={(e) => onChange("subject", e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="flex flex-col gap-[7px]">
            <label className="flex items-center gap-1 text-[13px] font-semibold text-[#222]">
              Message <span className="text-[#e55]">*</span>
            </label>

            <textarea
              className="min-h-[100px] w-full resize-y rounded-[10px] border border-[#e8e4e0] bg-[#fdfcfb] px-3.5 py-2.5 text-[14px] text-[#333] outline-none transition focus:border-black/20"
              placeholder="Tell me everything…"
              value={form.message}
              onChange={(e) => onChange("message", e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-7 flex items-center justify-between">
          <span className="text-[12px] text-[#bbb]">→ {TO}</span>

          <button
            onClick={handleSend}
            className={`rounded-[10px] px-[22px] py-2.5 text-[13.5px] font-medium tracking-[0.2px] text-white transition-all duration-200 ${
              sent
                ? "bg-[#555]"
                : "bg-[#111] hover:scale-[1.02] hover:bg-black active:scale-[0.98]"
            }`}
          >
            {sent ? "Opening mail… ✓" : "Send mail →"}
          </button>
        </div>
      </div>
    </div>
  );
}
