"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import AboutPage from "../../pages/about";

const BASE = (import.meta as any).env.BASE_URL;
import { useVideoPreloader } from "./../../components/useVideoPreloader";
import VideoPreloaderScreen from "./../../components/VideoPreloaderScreen";

const CONFIG = {
  ALLOWED_KEYS: ["q", "w", "e", "a", "s", "d"] as const,
  COMBOS: {
    easy: { 1: ["ws"], 2: ["asd"], 3: [] },
    medium: { 1: ["qa"], 2: ["qwa"], 3: ["qqsa"] },
    hard: { 1: ["qss"], 2: ["qsse"], 3: ["qdqqe"] },
  } as Record<string, Record<number, string[]>>,
  PROMPT_DISPLAY_MS: 2500,
  TIME_LIMIT: { easy: 4000, medium: 2500, hard: 1500 } as Record<
    string,
    number
  >,
  REQUIRED_PASSES: { easy: 1, medium: 2, hard: 3 } as Record<string, number>,
  VIDEOS: {
    intro: BASE + "assets/Videos/India/video1.mp4",
    video2: BASE + "assets/Videos/India/video2.mp4",
    video3: BASE + "assets/Videos/India/video3.mp4",
  } as Record<string, string>,
  SUCCESS_COMPONENT: (<AboutPage />) as React.ReactNode,
  DEFAULT_DIFFICULTY: "medium" as Difficulty,
};

const VIDEO_URLS = [
  CONFIG.VIDEOS.intro,
  CONFIG.VIDEOS.video2,
  CONFIG.VIDEOS.video3,
];
const LEVELS_FOR_DIFFICULTY: Record<string, number[]> = {
  easy: [1, 2, 2],
  medium: [1, 2, 3],
  hard: [1, 2, 3],
};
const VIDEO_KEY_MAP: Record<number, string> = {
  0: "intro",
  1: "video2",
  2: "video3",
};
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const ROUND_COUNT = 3;

type Difficulty = "easy" | "medium" | "hard";
type GamePhase = "video" | "prompt" | "typing" | "result" | "success" | "fail";

// ── Glassmorphism style tokens ──────────────────────────────
const G = {
  bg: "linear-gradient(135deg,#e8e8ee 0%,#f4f4f8 40%,#dde0ea 100%)",
  card: "rgba(255,255,255,0.52)",
  cardBorder: "1px solid rgba(255,255,255,0.78)",
  cardShadow:
    "0 8px 32px rgba(130,138,170,0.16),inset 0 1px 0 rgba(255,255,255,0.92)",
  pill: "rgba(255,255,255,0.70)",
  pillBorder: "1px solid rgba(255,255,255,0.90)",
  track: "rgba(175,180,210,0.28)",
  bar: "rgba(140,148,192,0.75)",
  txtTitle: "rgba(60,65,100,0.88)",
  txtSub: "rgba(85,90,118,0.72)",
  txtHint: "rgba(120,128,160,0.55)",
  dotOff: "rgba(175,180,210,0.32)",
  dotOn: "rgba(115,125,175,0.82)",
  success: "rgba(80,160,120,0.82)",
  danger: "rgba(200,80,80,0.82)",
  btnHover: "rgba(255,255,255,0.72)",
};

function getRandomCombo(difficulty: Difficulty, levelNum: number): string {
  const pool = CONFIG.COMBOS[difficulty][levelNum];
  if (!pool || pool.length === 0) return "qa";
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Reusable glass card wrapper ─────────────────────────────
function GlassCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: G.card,
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: G.cardBorder,
        borderRadius: 20,
        boxShadow: G.cardShadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function ALandGame({ themeIndex = 0 }: { themeIndex?: number }) {
  const { ready, progress, objectUrls } = useVideoPreloader(VIDEO_URLS);

  const resolveUrl = (key: string) => {
    const orig = CONFIG.VIDEOS[key] ?? CONFIG.VIDEOS.intro;
    return objectUrls[orig] ?? orig;
  };

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
  const currentComboRef = useRef("");
  const roundIndexRef = useRef(0);
  const difficultyRef = useRef<Difficulty>(CONFIG.DEFAULT_DIFFICULTY);
  const passesRef = useRef(0);
  const roundResultsRef = useRef<boolean[]>([]);
  const pendingRoundRef = useRef<number | null>(null);

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
  useEffect(() => {
    currentComboRef.current = currentCombo;
  }, [currentCombo]);

  const playVideo = useCallback(
    (key: string) => {
      const src = resolveUrl(key);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.src = src;
          videoRef.current.load();
          videoRef.current.play().catch(() => {});
        }
      }, 50);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [objectUrls],
  );

  useEffect(() => {
    if (!ready) return;
    setPasses(0);
    passesRef.current = 0;
    setRoundResults([]);
    roundResultsRef.current = [];
    setRoundIndex(0);
    setPhase("video");
    playVideo("intro");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const endRound = (success: boolean) => {
    typingRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    if (success) {
      passesRef.current += 1;
      setPasses(passesRef.current);
      setFlash("green");
    } else setFlash("red");
    setTimeout(() => setFlash(null), 600);
    const newResults = [...roundResultsRef.current, success];
    roundResultsRef.current = newResults;
    setRoundResults(newResults);
    setPhase("result");
  };

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
    const step = 50,
      total = CONFIG.PROMPT_DISPLAY_MS;
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

  const advanceAfterResult = useCallback(() => {
    const next = roundIndexRef.current + 1;
    if (next >= ROUND_COUNT) {
      const won =
        roundResultsRef.current.filter(Boolean).length >=
        CONFIG.REQUIRED_PASSES[difficultyRef.current];
      setPhase(won ? "success" : "fail");
    } else {
      playVideo(VIDEO_KEY_MAP[next] || "intro");
      pendingRoundRef.current = next;
      setPhase("video");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playVideo]);

  const handleVideoEnd = () => {
    if (pendingRoundRef.current !== null) {
      const idx = pendingRoundRef.current;
      pendingRoundRef.current = null;
      beginRound(idx);
      return;
    }
    beginRound(0);
  };

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

  useEffect(() => {
    if (phase !== "typing") return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((CONFIG.ALLOWED_KEYS as readonly string[]).includes(k))
        handleKeyInput(k);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, handleKeyInput]);

  const timerPct = CONFIG.TIME_LIMIT[difficulty]
    ? (timeLeft / CONFIG.TIME_LIMIT[difficulty]) * 100
    : 0;

  // ── Combo tiles ─────────────────────────────────────────
  const renderCombo = (forPrompt = false) => (
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {currentCombo.split("").map((ch, i) => {
        const done = !forPrompt && i < typed.length;
        const active = !forPrompt && i === typed.length;
        return (
          <span
            key={i}
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              fontSize: 18,
              fontWeight: 900,
              textTransform: "uppercase",
              border: done
                ? "1.5px solid rgba(80,160,120,0.5)"
                : active
                  ? "1.5px solid rgba(115,125,175,0.7)"
                  : "1.5px solid rgba(175,180,210,0.35)",
              background: done
                ? "rgba(80,160,120,0.12)"
                : active
                  ? "rgba(140,148,192,0.12)"
                  : "rgba(255,255,255,0.28)",
              color: done ? G.success : active ? G.dotOn : G.txtHint,
              transition: "all 0.1s",
              backdropFilter: "blur(8px)",
            }}
          >
            {forPrompt ? ch : done ? "✓" : ""}
          </span>
        );
      })}
    </div>
  );

  // ── Mobile keyboard ──────────────────────────────────────
  const KB_ROWS = [
    ["q", "w", "e"],
    ["a", "s", "d"],
  ];
  const renderMobileKeyboard = () => {
    const kw = isLandscape ? 38 : 52,
      kh = isLandscape ? 34 : 48;
    const gap = isLandscape ? 4 : 6,
      rowOffset = isLandscape ? 16 : 22,
      fs = isLandscape ? 12 : 15;
    const outerPad = isLandscape ? "6px 8px 8px 8px" : "10px 12px 12px 12px";
    const innerPad = isLandscape ? "5px 5px 7px 5px" : "8px 8px 10px 8px";
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 16,
          padding: outerPad,
          boxShadow:
            "0 8px 28px rgba(130,138,170,0.18),inset 0 1px 0 rgba(255,255,255,0.9)",
          border: "1px solid rgba(255,255,255,0.78)",
        }}
      >
        <div
          style={{
            background: "rgba(220,222,235,0.35)",
            borderRadius: 10,
            padding: innerPad,
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
                      borderRadius: 9,
                      fontSize: `${fs}px`,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: isActive ? "rgba(255,255,255,0.95)" : G.txtTitle,
                      background: isActive
                        ? "rgba(115,125,175,0.75)"
                        : "rgba(255,255,255,0.82)",
                      border: isActive
                        ? "1px solid rgba(155,165,210,0.6)"
                        : "1px solid rgba(255,255,255,0.9)",
                      boxShadow: isActive
                        ? "0 2px 8px rgba(115,125,175,0.35)"
                        : "0 3px 0 rgba(175,180,210,0.4),0 4px 8px rgba(130,138,170,0.15),inset 0 1px 0 rgba(255,255,255,0.95)",
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

  if (!ready)
    return (
      <VideoPreloaderScreen
        progress={progress}
        label="Loading flight assets"
        videoCount={3}
      />
    );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "monospace",
        userSelect: "none",
      }}
    >
      {/* Video background */}
      <video
        ref={videoRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        autoPlay
        playsInline
        muted
        onEnded={handleVideoEnd}
      />

      {/* Frosted vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(230,232,240,0.55) 0%, rgba(240,242,248,0.08) 50%, rgba(225,228,238,0.38) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Flash */}
      {flash && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 40,
            background:
              flash === "green"
                ? "rgba(80,180,120,0.18)"
                : "rgba(200,80,80,0.18)",
            transition: "opacity 0.2s",
          }}
        />
      )}

      {/* Difficulty badge */}
      <button
        onClick={cycleDifficulty}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 30,
          padding: "6px 16px",
          borderRadius: 9999,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.8)",
          color: G.txtSub,
          boxShadow: "0 2px 12px rgba(130,138,170,0.14)",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        {diffLabel[difficulty]} <span style={{ opacity: 0.4 }}>↻</span>
      </button>

      {/* VIDEO phase — skip button */}
      {phase === "video" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            zIndex: 10,
            paddingBottom: 40,
          }}
        >
          <button
            onClick={() => {
              if (videoRef.current) videoRef.current.pause();
              handleVideoEnd();
            }}
            style={{
              padding: "12px 28px",
              borderRadius: 14,
              fontSize: 13,
              fontWeight: 700,
              background: "rgba(255,255,255,0.52)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.78)",
              color: G.txtTitle,
              boxShadow: "0 4px 20px rgba(130,138,170,0.16)",
              cursor: "pointer",
            }}
          >
            Skip ›
          </button>
        </div>
      )}

      {/* PROMPT phase */}
      {phase === "prompt" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <GlassCard
            style={{
              padding: "32px 40px",
              maxWidth: 320,
              width: "calc(100% - 32px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              opacity: showPromptCard ? 1 : 0,
              transform: showPromptCard ? "scale(1)" : "scale(0.94)",
              transition: "all 0.3s",
            }}
          >
            <div style={{ fontSize: 28, opacity: 0.6 }}>📡</div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: G.txtHint,
                margin: 0,
              }}
            >
              Round {roundIndex + 1} of {ROUND_COUNT}
            </p>
            <p
              style={{
                textAlign: "center",
                fontWeight: 700,
                fontSize: 14,
                lineHeight: 1.5,
                color: G.txtTitle,
                margin: 0,
              }}
            >
              Pilot, retype the combination
              <br />
              to stabilise the plane
            </p>
            {renderCombo(true)}
            {/* Countdown bar */}
            <div
              style={{
                width: "100%",
                height: 3,
                background: G.track,
                borderRadius: 9999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(1 - promptProgress) * 100}%`,
                  background: G.bar,
                  borderRadius: 9999,
                  transition: "width 50ms linear",
                }}
              />
            </div>
          </GlassCard>
        </div>
      )}

      {/* TYPING phase */}
      {phase === "typing" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            zIndex: 10,
          }}
        >
          {/* Timer bar */}
          <div
            style={{
              margin: "24px 24px 0",
              height: 4,
              background: G.track,
              borderRadius: 9999,
              overflow: "hidden",
              border: "0.5px solid rgba(255,255,255,0.5)",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 9999,
                transition: "width 0.1s",
                width: `${timerPct}%`,
                background: timerPct < 30 ? "rgba(200,80,80,0.75)" : G.bar,
              }}
            />
          </div>
          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              marginTop: 6,
              color: G.txtHint,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {(timeLeft / 1000).toFixed(1)}s
          </p>

          {/* Combo */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {renderCombo()}
            {typed.length > 0 && (
              <p
                style={{
                  fontSize: 11,
                  color: G.txtHint,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                {typed}
              </p>
            )}
          </div>

          {/* Mobile keyboard */}
          <div
            className="lg:hidden"
            style={{ position: "fixed", bottom: 16, left: 16, zIndex: 50 }}
          >
            {renderMobileKeyboard()}
          </div>

          <p
            className="hidden lg:block"
            style={{
              textAlign: "center",
              fontSize: 11,
              marginBottom: 20,
              color: G.txtHint,
              opacity: 0.6,
            }}
          >
            Keyboard: Q W E · A S D
          </p>
        </div>
      )}

      {/* RESULT phase */}
      {phase === "result" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 10,
            paddingBottom: 40,
          }}
        >
          <GlassCard
            style={{
              padding: "20px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <p
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: roundResults[roundResults.length - 1]
                  ? G.success
                  : G.danger,
                margin: 0,
              }}
            >
              {roundResults[roundResults.length - 1]
                ? "✅ Stabilised!"
                : "❌ Failed!"}
            </p>
            <button
              onClick={advanceAfterResult}
              style={{
                padding: "8px 24px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                background: "rgba(255,255,255,0.65)",
                border: "1px solid rgba(255,255,255,0.85)",
                color: G.txtTitle,
                cursor: "pointer",
                backdropFilter: "blur(12px)",
              }}
            >
              Continue ›
            </button>
          </GlassCard>
        </div>
      )}

      {/* SUCCESS phase */}
      {phase === "success" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            padding: 16,
          }}
        >
          {CONFIG.SUCCESS_COMPONENT ? (
            <>{CONFIG.SUCCESS_COMPONENT}</>
          ) : (
            <GlassCard
              style={{
                padding: "32px 40px",
                maxWidth: 320,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <button
                onClick={restartGame}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 900,
                  background: "rgba(115,125,175,0.75)",
                  color: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(155,165,210,0.5)",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(115,125,175,0.25)",
                }}
              >
                Fly Again
              </button>
            </GlassCard>
          )}
        </div>
      )}

      {/* FAIL phase */}
      {phase === "fail" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            padding: 16,
          }}
        >
          <GlassCard
            style={{
              padding: "36px 40px",
              maxWidth: 320,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ fontSize: 52 }}>💥</div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: G.txtTitle,
                margin: 0,
              }}
            >
              Crashed!
            </h2>
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                lineHeight: 1.7,
                color: G.txtSub,
                margin: 0,
              }}
            >
              {passes} pass{passes !== 1 ? "es" : ""} — needed{" "}
              {CONFIG.REQUIRED_PASSES[difficulty]}.<br />
              Take the controls again.
            </p>
            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button
                onClick={restartGame}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  background: "rgba(255,255,255,0.65)",
                  border: "1px solid rgba(255,255,255,0.85)",
                  color: G.txtTitle,
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
              <button
                onClick={restartGame}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 900,
                  background: "rgba(115,125,175,0.75)",
                  color: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(155,165,210,0.5)",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(115,125,175,0.25)",
                }}
              >
                Home
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
