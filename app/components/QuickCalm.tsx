"use client";

import { useEffect, useRef, useState } from "react";
import { getEngine } from "@/lib/audio";
import { useI18n } from "@/lib/i18n";

// An always-available "panic SOS" — one tap opens a fullscreen grounding space:
// a 4-7-8 breathing orb plus rotating 5-4-3-2-1 sensory cues.

const PHASES = [
  { label: "Breathe in", secs: 4, scale: 1 },
  { label: "Hold", secs: 7, scale: 1 },
  { label: "Breathe out", secs: 8, scale: 0.5 },
] as const;

const GROUNDING = [
  "Name 5 things you can see",
  "4 things you can feel",
  "3 things you can hear",
  "2 things you can smell",
  "1 slow breath, just for you",
];

export default function QuickCalm() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [ground, setGround] = useState(0);
  const timer = useRef<number | null>(null);

  // breathing cycle
  useEffect(() => {
    if (!open) return;
    const phase = PHASES[phaseIdx];
    if (phaseIdx === 0) getEngine().bell(136.1);
    timer.current = window.setTimeout(() => {
      setPhaseIdx((i) => (i + 1) % PHASES.length);
    }, phase.secs * 1000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [open, phaseIdx]);

  // rotate grounding cues
  useEffect(() => {
    if (!open) return;
    const id = setInterval(
      () => setGround((g) => (g + 1) % GROUNDING.length),
      6500,
    );
    return () => clearInterval(id);
  }, [open]);

  const start = () => {
    setPhaseIdx(0);
    setGround(0);
    setOpen(true);
  };

  const phase = PHASES[phaseIdx];

  return (
    <>
      {/* floating SOS button */}
      <button
        onClick={start}
        className="press fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/15 bg-[var(--color-sindoor)]/80 px-5 py-2.5 text-sm font-medium text-white shadow-2xl backdrop-blur-md transition hover:bg-[var(--color-sindoor)]"
        style={{ boxShadow: "0 0 28px rgba(192,57,43,0.45)" }}
      >
        ✸ {t("quickCalm")}
      </button>

      {open && (
        <div className="animate-fade-up fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1a0f0c]/95 px-6 backdrop-blur-xl">
          <p className="font-display text-2xl">{t("sos.title")}</p>
          <p className="text-dim mt-1 text-center text-sm">{t("sos.subtitle")}</p>

          <div className="relative my-12 flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div
              className="absolute rounded-full bg-gradient-to-br from-[var(--color-marigold)]/60 to-[var(--color-peacock)]/50 blur-[2px]"
              style={{
                width: "100%",
                height: "100%",
                transform: `scale(${phase.scale})`,
                transition: `transform ${phase.secs}s ${
                  phase.label === "Hold"
                    ? "linear"
                    : "cubic-bezier(0.4,0,0.2,1)"
                }`,
              }}
            />
            <div className="relative z-10 text-center">
              <p className="font-display text-2xl">{phase.label}</p>
              <p className="text-dim mt-1 text-sm">{phase.secs}s</p>
            </div>
          </div>

          <p
            key={ground}
            className="animate-fade-up font-display max-w-xs text-center text-lg"
          >
            {GROUNDING[ground]}
          </p>

          <button
            onClick={() => setOpen(false)}
            className="press mt-10 rounded-full bg-white/15 px-8 py-3 text-sm font-medium transition hover:bg-white/25"
          >
            {t("sos.close")}
          </button>
        </div>
      )}
    </>
  );
}
