"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getEngine } from "@/lib/audio";

type Phase = { label: string; secs: number; scale: number };

const PATTERNS: Record<string, { name: string; hi: string; phases: Phase[] }> = {
  sama: {
    name: "Sama Vritti",
    hi: "सम वृत्ति · equal breath",
    phases: [
      { label: "Breathe in", secs: 4, scale: 1 },
      { label: "Hold", secs: 4, scale: 1 },
      { label: "Breathe out", secs: 4, scale: 0.45 },
      { label: "Hold", secs: 4, scale: 0.45 },
    ],
  },
  relax: {
    name: "4·7·8 Shanti",
    hi: "शांति · deep calm",
    phases: [
      { label: "Breathe in", secs: 4, scale: 1 },
      { label: "Hold", secs: 7, scale: 1 },
      { label: "Breathe out", secs: 8, scale: 0.45 },
    ],
  },
  deergha: {
    name: "Deergha (5·5)",
    hi: "दीर्घ श्वास · long breath",
    phases: [
      { label: "Breathe in", secs: 5, scale: 1 },
      { label: "Breathe out", secs: 5, scale: 0.45 },
    ],
  },
};

export default function Breathe() {
  const [key, setKey] = useState<keyof typeof PATTERNS>("sama");
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [chime, setChime] = useState(true);
  const timer = useRef<number | null>(null);

  const pattern = PATTERNS[key];
  const phase = pattern.phases[phaseIdx];

  const stop = useCallback(() => {
    setRunning(false);
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // advance through phases while running
  useEffect(() => {
    if (!running) return;
    if (chime) getEngine().bell(136.1 * (phaseIdx % 2 === 0 ? 2 : 1.5));
    timer.current = window.setTimeout(() => {
      setPhaseIdx((i) => {
        const next = (i + 1) % pattern.phases.length;
        if (next === 0) setCycles((c) => c + 1);
        return next;
      });
    }, phase.secs * 1000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [running, phaseIdx, phase.secs, pattern.phases.length, chime]);

  const start = () => {
    setPhaseIdx(0);
    setCycles(0);
    setRunning(true);
  };

  const switchPattern = (k: keyof typeof PATTERNS) => {
    stop();
    setKey(k);
    setPhaseIdx(0);
    setCycles(0);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center py-6">
      <h2 className="font-display text-2xl">Pranayama · प्राणायाम</h2>
      <p className="text-dim mt-1 text-sm">
        {pattern.hi} — follow the circle and let your breath match it
      </p>

      <div className="mt-2 flex gap-2">
        {Object.entries(PATTERNS).map(([k, p]) => (
          <button
            key={k}
            onClick={() => switchPattern(k as keyof typeof PATTERNS)}
            className={`rounded-full px-3 py-1.5 text-xs transition ${
              k === key
                ? "bg-[var(--color-sakura)]/30 text-white"
                : "glass text-dim hover:text-white"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* breathing orb */}
      <div className="relative my-10 flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
        <div className="absolute inset-0 rounded-full border border-white/10" />
        <div
          className="absolute rounded-full bg-gradient-to-br from-[var(--color-sakura)]/70 to-[var(--color-indigo)]/70 blur-[2px]"
          style={{
            width: "100%",
            height: "100%",
            transform: `scale(${running ? phase.scale : 0.7})`,
            transition: `transform ${running ? phase.secs : 0.8}s ${
              phase.label === "Hold" ? "linear" : "cubic-bezier(0.4,0,0.2,1)"
            }`,
          }}
        />
        <div className="relative z-10 text-center">
          <p className="font-display text-2xl">
            {running ? phase.label : "Ready"}
          </p>
          {running && (
            <p className="text-dim mt-1 text-sm">{phase.secs}s</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={running ? stop : start}
          className="rounded-full bg-white/15 px-8 py-3 font-medium transition hover:bg-white/25"
        >
          {running ? "Pause" : "Begin"}
        </button>
        <label className="text-dim flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={chime}
            onChange={(e) => setChime(e.target.checked)}
            className="accent-[var(--color-marigold)]"
          />
          Om chime
        </label>
      </div>

      <p className="text-dim mt-6 text-sm">
        Cycles completed: <span className="text-white">{cycles}</span>
      </p>
    </div>
  );
}
