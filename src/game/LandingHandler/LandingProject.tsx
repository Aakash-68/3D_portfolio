"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Projects from "../../pages/projects";

// ============================================================
// ⚙️  GAME CONFIG — edit everything here
// ============================================================
const BASE = (import.meta as any).env.BASE_URL;

const CONFIG = {
  // ── Letter pool ──────────────────────────────────────────
  ALLOWED_KEYS: ["q", "w", "e", "a", "s", "d"] as const,

  // ── Letter combos per level per difficulty ───────────────
  COMBOS: {
    easy: {
      1: ["ed"],
      2: ["ewq"],
      3: [],
    },
    medium: {
      1: ["aa"],
      2: ["awq"],
      3: ["aawa"],
    },
    hard: {
      1: ["ada"],
      2: ["adqa"],
      3: ["aadq"],
    },
  } as Record<string, Record<number, string[]>>,

  // ── How long the prompt card is shown before auto-hiding (ms) ──
  PROMPT_DISPLAY_MS: 2500,

  // ── Time limits (ms) per difficulty for the typing window ──
  TIME_LIMIT: {
    easy: 4000,
    medium: 2500,
    hard: 1500,
  } as Record<string, number>,

  // ── Passes needed to win ─────────────────────────────────
  REQUIRED_PASSES: {
    easy: 1,
    medium: 2,
    hard: 3,
  } as Record<string, number>,

  // ── Videos — 3 interstitial videos shown between rounds ──
  // video1 plays as intro, video2 after round 1, video3 after round 2
  VIDEOS: {
    intro: BASE + "/assets/Videos/Dubai/video1.mp4",
    video2: BASE + "/assets/Videos/Dubai/video2.mp4",
    video3: BASE + "/assets/Videos/Dubai/video3.mp4",
  } as Record<string, string>,

  // ── Success component — shown on win ─────────────────────
  // Set to a React component or null to show a default card
  SUCCESS_COMPONENT: (<Projects />) as React.ReactNode,
  // ── Difficulty shown at start ─────────────────────────────
  DEFAULT_DIFFICULTY: "medium" as Difficulty,
};

// Levels used per round index per difficulty
const LEVELS_FOR_DIFFICULTY: Record<string, number[]> = {
  easy: [1, 2, 2],
  medium: [1, 2, 3],
  hard: [1, 2, 3],
};

// Which interstitial video plays BEFORE each round (index 0 = intro)
const VIDEO_BEFORE_ROUND: Record<number, string> = {
  0: CONFIG.VIDEOS.intro,
  1: CONFIG.VIDEOS.video2,
  2: CONFIG.VIDEOS.video3,
};

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const ROUND_COUNT = 3;

type Difficulty = "easy" | "medium" | "hard";
type GamePhase = "video" | "prompt" | "typing" | "result" | "success" | "fail";

// ============================================================
// 🎨 THEMES
// ============================================================
interface Theme {
  name: string;
  bg: string;
  panel: string;
  border: string;
  title: string;
  text: string;
  accent: string;
  keyBg: string;
  keyText: string;
  keyActive: string;
  lifeColor: string;
  timerBarFull: string;
  timerBarLow: string;
  diffCycle: string;
  promptCountdown: string;
}

const THEMES: Theme[] = [
  {
    name: "Cockpit Night",
    bg: "bg-slate-950",
    panel: "bg-slate-900/85 backdrop-blur-xl border border-cyan-500/30",
    border: "border-cyan-500/50",
    title: "text-cyan-300",
    text: "text-slate-200",
    accent: "text-cyan-400",
    keyBg: "bg-slate-700 border-2 border-slate-500",
    keyText: "text-slate-200",
    keyActive:
      "!bg-cyan-400 !border-cyan-200 !text-slate-900 scale-90 shadow-lg shadow-cyan-500/50",
    lifeColor: "text-red-400",
    timerBarFull: "bg-cyan-400",
    timerBarLow: "bg-red-500",
    diffCycle:
      "bg-cyan-700/80 border border-cyan-400/60 text-cyan-100 hover:bg-cyan-600/80",
    promptCountdown: "bg-cyan-500",
  },
  {
    name: "Sunset Danger",
    bg: "bg-orange-950",
    panel: "bg-orange-900/80 backdrop-blur-xl border border-amber-400/30",
    border: "border-amber-400/50",
    title: "text-amber-300",
    text: "text-orange-100",
    accent: "text-amber-400",
    keyBg: "bg-orange-800 border-2 border-orange-600",
    keyText: "text-orange-100",
    keyActive:
      "!bg-amber-400 !border-amber-200 !text-orange-950 scale-90 shadow-lg shadow-amber-400/50",
    lifeColor: "text-red-400",
    timerBarFull: "bg-amber-400",
    timerBarLow: "bg-red-500",
    diffCycle:
      "bg-amber-700/80 border border-amber-400/60 text-amber-100 hover:bg-amber-600/80",
    promptCountdown: "bg-amber-400",
  },
  {
    name: "Arctic Snow",
    bg: "bg-sky-50",
    panel: "bg-white/85 backdrop-blur-xl border border-sky-200",
    border: "border-sky-400",
    title: "text-sky-700",
    text: "text-slate-700",
    accent: "text-sky-600",
    keyBg: "bg-slate-100 border-2 border-slate-300",
    keyText: "text-slate-700",
    keyActive:
      "!bg-sky-500 !border-sky-300 !text-white scale-90 shadow-lg shadow-sky-400/50",
    lifeColor: "text-red-500",
    timerBarFull: "bg-sky-500",
    timerBarLow: "bg-red-500",
    diffCycle:
      "bg-sky-600/90 border border-sky-400 text-white hover:bg-sky-500/90",
    promptCountdown: "bg-sky-500",
  },
];

// ============================================================
// 🛠  HELPERS
// ============================================================
function getRandomCombo(difficulty: Difficulty, levelNum: number): string {
  const pool = CONFIG.COMBOS[difficulty][levelNum];
  if (!pool || pool.length === 0) return "qa";
  return pool[Math.floor(Math.random() * pool.length)];
}

// ============================================================
// 🎮 MAIN COMPONENT
// ============================================================
export default function PLandGame({ themeIndex = 0 }: { themeIndex?: number }) {
  const theme = THEMES[themeIndex % THEMES.length];

  const [difficulty, setDifficulty] = useState<Difficulty>(
    CONFIG.DEFAULT_DIFFICULTY,
  );
  const [phase, setPhase] = useState<GamePhase>("video");
  const [roundIndex, setRoundIndex] = useState(0);
  const [currentCombo, setCurrentCombo] = useState("");
  const [typed, setTyped] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [passes, setPasses] = useState(0);
  const [roundResults, setRoundResults] = useState<boolean[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [flash, setFlash] = useState<"green" | "red" | null>(null);
  const [promptProgress, setPromptProgress] = useState(0);
  const [showPromptCard, setShowPromptCard] = useState(false);
  // Which video is currently playing (for skip button label)
  const [currentVideoKey, setCurrentVideoKey] = useState("intro");

  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const promptTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingRef = useRef(false);

  const roundIndexRef = useRef(0);
  const difficultyRef = useRef<Difficulty>(CONFIG.DEFAULT_DIFFICULTY);
  const passesRef = useRef(0);
  const roundResultsRef = useRef<boolean[]>([]);

  useEffect(() => {
    roundIndexRef.current = roundIndex;
  }, [roundIndex]);
  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);
  useEffect(() => {
    passesRef.current = passes;
  }, [passes]);
  useEffect(() => {
    roundResultsRef.current = roundResults;
  }, [roundResults]);

  // ── Play a video by src ───────────────────────────────────
  const playVideo = useCallback((key: string) => {
    setCurrentVideoKey(key);
    const src = CONFIG.VIDEOS[key] || CONFIG.VIDEOS.intro;
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.src = src;
        videoRef.current.load();
        videoRef.current.play().catch(() => {});
      }
    }, 50);
  }, []);

  // ── Bootstrap: auto-start intro on mount ─────────────────
  useEffect(() => {
    setPasses(0);
    passesRef.current = 0;
    setRoundResults([]);
    roundResultsRef.current = [];
    setRoundIndex(0);
    setPhase("video");
    playVideo("intro");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Show prompt card then auto-start typing ───────────────
  const beginRound = useCallback((idx: number, diff?: Difficulty) => {
    const d = diff ?? difficultyRef.current;
    const levelList = LEVELS_FOR_DIFFICULTY[d];
    const levelNum = levelList[Math.min(idx, levelList.length - 1)];
    const combo = getRandomCombo(d, levelNum);

    setCurrentCombo(combo);
    currentComboRef.current = combo;
    setTyped("");
    setRoundIndex(idx);
    roundIndexRef.current = idx;
    setPromptProgress(0);
    setShowPromptCard(true);
    setPhase("prompt");

    const step = 50;
    const total = CONFIG.PROMPT_DISPLAY_MS;
    let elapsed = 0;
    if (promptTimerRef.current) clearInterval(promptTimerRef.current);
    promptTimerRef.current = setInterval(() => {
      elapsed += step;
      setPromptProgress(Math.min(elapsed / total, 1));
      if (elapsed >= total) {
        clearInterval(promptTimerRef.current!);
        setShowPromptCard(false);
        setTimeout(() => startTypingPhase(combo, d), 300);
      }
    }, step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Typing phase ──────────────────────────────────────────
  const startTypingPhase = (combo: string, diff: Difficulty) => {
    setPhase("typing");
    setTyped("");
    typingRef.current = true;
    const limit = CONFIG.TIME_LIMIT[diff];
    setTimeLeft(limit);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          clearInterval(timerRef.current!);
          typingRef.current = false;
          endRound(false);
          return 0;
        }
        return prev - 100;
      });
    }, 100);
  };

  // ── End a round ───────────────────────────────────────────
  const endRound = (success: boolean) => {
    typingRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);

    const idx = roundIndexRef.current;

    if (success) {
      passesRef.current += 1;
      setPasses(passesRef.current);
      setFlash("green");
    } else {
      setFlash("red");
    }
    setTimeout(() => setFlash(null), 600);

    const newResults = [...roundResultsRef.current, success];
    roundResultsRef.current = newResults;
    setRoundResults(newResults);

    // Show result card briefly, then advance
    setPhase("result");
  };

  // ── After result card: play next video or finish ──────────
  const advanceAfterResult = useCallback(() => {
    const next = roundIndexRef.current + 1;

    if (next >= ROUND_COUNT) {
      // All rounds done — evaluate
      const totalPasses = roundResultsRef.current.filter(Boolean).length;
      const req = CONFIG.REQUIRED_PASSES[difficultyRef.current];
      const won = totalPasses >= req;

      if (won) {
        setPhase("success");
      } else {
        setPhase("fail");
      }
    } else {
      // Play interstitial then begin next round
      const videoKey = VIDEO_BEFORE_ROUND[next] ? `video${next + 1}` : "intro";
      // Map round index to config key
      const keyMap: Record<number, string> = {
        0: "intro",
        1: "video2",
        2: "video3",
      };
      playVideo(keyMap[next] || "intro");
      pendingRoundRef.current = next;
      setPhase("video");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playVideo]);

  const pendingRoundRef = useRef<number | null>(null);

  // ── Video ended ───────────────────────────────────────────
  const handleVideoEnd = () => {
    if (pendingRoundRef.current !== null) {
      const idx = pendingRoundRef.current;
      pendingRoundRef.current = null;
      beginRound(idx);
      return;
    }
    // Intro video ended — start round 0
    beginRound(0);
  };

  // ── Restart everything ────────────────────────────────────
  const restartGame = () => {
    setPasses(0);
    passesRef.current = 0;
    setRoundResults([]);
    roundResultsRef.current = [];
    setRoundIndex(0);
    pendingRoundRef.current = null;
    setPhase("video");
    playVideo("intro");
  };

  // ── Key input handler ─────────────────────────────────────
  const handleKeyInput = useCallback(
    (key: string) => {
      if (phase !== "typing" || !typingRef.current) return;
      setActiveKey(key);
      setTimeout(() => setActiveKey(null), 150);

      setTyped((prev) => {
        const combo = currentComboRef.current;
        if (key !== combo[prev.length]) return "";
        const next = prev + key;
        if (next === combo) {
          typingRef.current = false;
          if (timerRef.current) clearInterval(timerRef.current);
          endRound(true);
        }
        return next;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [phase],
  );

  const currentComboRef = useRef("");
  useEffect(() => {
    currentComboRef.current = currentCombo;
  }, [currentCombo]);

  // Desktop keyboard listener
  useEffect(() => {
    if (phase !== "typing") return;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!(CONFIG.ALLOWED_KEYS as readonly string[]).includes(key)) return;
      handleKeyInput(key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, handleKeyInput]);

  // ── Timer bar ─────────────────────────────────────────────
  const timerPct = CONFIG.TIME_LIMIT[difficulty]
    ? (timeLeft / CONFIG.TIME_LIMIT[difficulty]) * 100
    : 0;

  // ── Combo tiles ───────────────────────────────────────────
  const renderCombo = (forPrompt = false) => (
    <div className="flex gap-2 justify-center items-center">
      {currentCombo.split("").map((ch, i) => {
        const done = !forPrompt && i < typed.length;
        const active = !forPrompt && i === typed.length;
        return (
          <span
            key={i}
            className={`
              w-11 h-11 md:w-14 md:h-14 flex items-center justify-center rounded-xl
              text-xl md:text-2xl font-black uppercase border-2 transition-all duration-100
              ${
                forPrompt
                  ? `${theme.border} ${theme.accent}`
                  : done
                    ? "bg-green-500/40 border-green-400 scale-105"
                    : active
                      ? `${theme.border} ${theme.accent} animate-pulse`
                      : "bg-white/5 border-white/15 text-white/30"
              }
            `}
          >
            {forPrompt ? ch : done ? "✓" : ""}
          </span>
        );
      })}
    </div>
  );

  // ── Mobile keyboard ───────────────────────────────────────
  const KB_ROWS = [
    ["q", "w", "e"],
    ["a", "s", "d"],
  ];
  const renderMobileKeyboard = () => {
    const kw = isLandscape ? 38 : 52;
    const kh = isLandscape ? 34 : 48;
    const gap = isLandscape ? 4 : 6;
    const rowOffset = isLandscape ? 16 : 22;
    const fs = isLandscape ? 12 : 15;
    const outerPad = isLandscape ? "7px 9px 9px 9px" : "10px 12px 12px 12px";
    const innerPad = isLandscape ? "5px 5px 7px 5px" : "8px 8px 10px 8px";
    return (
      <div
        style={{
          background:
            "linear-gradient(160deg, #d1d5db 0%, #9ca3af 40%, #6b7280 100%)",
          borderRadius: "14px",
          padding: outerPad,
          boxShadow:
            "0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.2)",
          border: "1px solid #4b5563",
        }}
      >
        <div
          style={{
            background: "linear-gradient(180deg, #6b7280 0%, #4b5563 100%)",
            borderRadius: "8px",
            padding: innerPad,
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.4)",
            display: "flex",
            flexDirection: "column",
            gap: `${gap}px`,
          }}
        >
          {KB_ROWS.map((row, ri) => (
            <div
              key={ri}
              style={{
                display: "flex",
                gap: `${gap}px`,
                marginLeft: ri === 1 ? `${rowOffset}px` : "0px",
              }}
            >
              {row.map((k) => {
                const isActive = activeKey === k;
                return (
                  <button
                    key={k}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleKeyInput(k);
                    }}
                    style={{
                      width: `${kw}px`,
                      height: `${kh}px`,
                      borderRadius: "7px",
                      fontSize: `${fs}px`,
                      fontWeight: "600",
                      fontFamily: "inherit",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: isActive ? "#ffffff" : "#111827",
                      background: isActive
                        ? "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)"
                        : "linear-gradient(180deg, #ffffff 0%, #e5e7eb 60%, #d1d5db 100%)",
                      border: isActive
                        ? "1px solid #93c5fd"
                        : "1px solid #9ca3af",
                      boxShadow: isActive
                        ? "0 0 0 2px rgba(96,165,250,0.5), 0 1px 0 rgba(0,0,0,0.3)"
                        : "0 3px 0 #9ca3af, 0 4px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.9)",
                      transform: isActive
                        ? "translateY(2px)"
                        : "translateY(0px)",
                      transition: "all 0.07s ease",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Difficulty cycle badge ────────────────────────────────
  const cycleDifficulty = () => {
    const idx = DIFFICULTIES.indexOf(difficulty);
    const next = DIFFICULTIES[(idx + 1) % DIFFICULTIES.length];
    setDifficulty(next);
    difficultyRef.current = next;
  };

  const diffLabel: Record<Difficulty, string> = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
  };

  // ============================================================
  // 🖼  RENDER
  // ============================================================
  return (
    <div
      className={`relative w-full h-screen overflow-hidden ${theme.bg} font-mono select-none`}
    >
      {/* ── Background video — always mounted ── */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
        onEnded={handleVideoEnd}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/40 pointer-events-none" />

      {/* Flash feedback */}
      {flash && (
        <div
          className={`absolute inset-0 pointer-events-none z-40 transition-opacity duration-200 ${flash === "green" ? "bg-green-500/20" : "bg-red-500/25"}`}
        />
      )}

      {/* Difficulty badge — always visible */}
      <button
        onClick={cycleDifficulty}
        className={`
          absolute top-4 right-4 z-30
          px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest
          backdrop-blur transition-all duration-150
          cursor-pointer hover:scale-105 active:scale-95
          ${theme.diffCycle}
        `}
      >
        {diffLabel[difficulty]} <span className="opacity-50">↻</span>
      </button>

      {/* ══════════════════════════════════════════════
          VIDEO — interstitial; show skip button
      ══════════════════════════════════════════════ */}
      {phase === "video" && (
        <div className="absolute inset-0 flex flex-col items-center justify-end z-10 pb-10">
          <button
            onClick={() => {
              if (videoRef.current) videoRef.current.pause();
              handleVideoEnd();
            }}
            className="px-6 py-3 rounded-xl bg-black/40 backdrop-blur text-white/80 text-sm font-bold hover:bg-black/60 transition border border-white/20"
          >
            Skip ›
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          PROMPT — memorise the combo
      ══════════════════════════════════════════════ */}
      {phase === "prompt" && (
        <div className="absolute inset-0 flex flex-col z-10">
          <div
            className="flex-1 flex items-center justify-center transition-all duration-400"
            style={{
              opacity: showPromptCard ? 1 : 0,
              transform: showPromptCard ? "scale(1)" : "scale(0.94)",
            }}
          >
            <div
              className={`${theme.panel} rounded-3xl px-8 py-6 max-w-xs w-full mx-4 flex flex-col items-center gap-4`}
            >
              {/* Radio tower icon */}
              <div className="text-3xl opacity-70">📡</div>

              <p
                className={`text-xs uppercase tracking-widest opacity-40 ${theme.text}`}
              >
                Round {roundIndex + 1} of {ROUND_COUNT}
              </p>

              <p
                className={`text-center font-bold text-base leading-snug ${theme.title}`}
              >
                Pilot, retype the combination
                <br />
                to stabilise the plane
              </p>

              {renderCombo(true)}

              {/* Draining countdown bar */}
              <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${theme.promptCountdown}`}
                  style={{
                    width: `${(1 - promptProgress) * 100}%`,
                    transition: "width 50ms linear",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TYPING
      ══════════════════════════════════════════════ */}
      {phase === "typing" && (
        <div className="absolute inset-0 flex flex-col z-10">
          {/* Timer bar */}
          <div className="mx-6 mt-6 h-2.5 bg-white/15 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-100 ${timerPct < 30 ? theme.timerBarLow + " animate-pulse" : theme.timerBarFull}`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
          <p
            className={`text-center text-xs mt-1.5 tabular-nums opacity-40 ${theme.text}`}
          >
            {(timeLeft / 1000).toFixed(1)}s
          </p>

          {/* Combo in center */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            {renderCombo()}
            {typed.length > 0 && (
              <p
                className={`text-xs opacity-30 tracking-widest uppercase ${theme.text}`}
              >
                {typed}
              </p>
            )}
          </div>

          {/* Mobile keyboard */}
          <div className="lg:hidden fixed bottom-4 left-4 z-50">
            {renderMobileKeyboard()}
          </div>

          {/* Desktop hint */}
          <p
            className={`hidden lg:block text-center text-xs mb-5 opacity-20 ${theme.text}`}
          >
            Keyboard: Q W E · A S D
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          RESULT — brief pass/fail card
      ══════════════════════════════════════════════ */}
      {phase === "result" && (
        <div className="absolute inset-0 flex flex-col items-center justify-end z-10 pb-10">
          <div
            className={`${theme.panel} rounded-2xl px-6 py-4 flex flex-col items-center gap-2`}
          >
            <p className={`font-bold text-base ${theme.title}`}>
              {roundResults[roundResults.length - 1]
                ? "✅ Stabilised!"
                : "❌ Failed!"}
            </p>
            <button
              onClick={advanceAfterResult}
              className="text-xs px-5 py-2 rounded-xl bg-white/20 backdrop-blur text-white font-bold hover:bg-white/30 transition border border-white/20"
            >
              Continue ›
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          SUCCESS
      ══════════════════════════════════════════════ */}
      {phase === "success" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
          {CONFIG.SUCCESS_COMPONENT ? (
            // Render custom success component from config
            <>{CONFIG.SUCCESS_COMPONENT}</>
          ) : (
            // Default success card
            <div
              className={`${theme.panel} rounded-3xl p-8 max-w-xs w-full flex flex-col items-center gap-5`}
            >
              <div
                className={`w-full rounded-2xl border border-dashed ${theme.border} p-4 text-center opacity-40`}
              >
                (set in CONFIG.SUCCESS_COMPONENT)
              </div>

              <button
                onClick={restartGame}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                Fly Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          FAIL — retry or home
      ══════════════════════════════════════════════ */}
      {phase === "fail" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
          <div
            className={`${theme.panel} rounded-3xl p-8 max-w-xs w-full flex flex-col items-center gap-5`}
          >
            <div className="text-6xl">💥</div>
            <h2
              className={`text-3xl font-black uppercase tracking-widest ${theme.title}`}
            >
              Crashed!
            </h2>
            <p
              className={`text-center text-xs leading-relaxed ${theme.text} opacity-60`}
            >
              {passes} pass{passes !== 1 ? "es" : ""} — needed{" "}
              {CONFIG.REQUIRED_PASSES[difficulty]}.
              <br />
              Take the controls again.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={restartGame}
                className="flex-1 py-3 rounded-xl bg-white/15 text-white font-bold text-sm hover:bg-white/25 transition border border-white/20"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  // "Home" — just restart fresh (replace with router.push("/") if needed)
                  restartGame();
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
