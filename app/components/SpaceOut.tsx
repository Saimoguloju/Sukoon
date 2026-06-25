"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getEngine } from "@/lib/audio";

// Mung (멍때리기) — the Korean art of "spacing out": deliberately doing
// absolutely nothing. It's so valued there's an annual Space-Out Competition in
// Seoul where the calmest, stillest person wins. Here the goal is simple: start,
// then stay perfectly still. The moment you move, click, scroll or type, your
// session ends. Beat your own record.

const KEY = "sukoon.mung.best";
const MOVE_THRESHOLD = 34; // px of accumulated pointer travel before it counts as "moving"

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function SpaceOut() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState(0);
  const [ended, setEnded] = useState(false);
  const [lastRun, setLastRun] = useState(0);

  const startTime = useRef(0);
  const raf = useRef(0);
  const moveAcc = useRef(0);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const b = Number(localStorage.getItem(KEY) || 0);
    if (!Number.isNaN(b)) setBest(b);
  }, []);

  const stop = useCallback((record: boolean) => {
    cancelAnimationFrame(raf.current);
    getEngine().setVolume("tanpura", 0);
    setRunning(false);
    if (record) {
      const secs = (performance.now() - startTime.current) / 1000;
      setLastRun(secs);
      setEnded(true);
      getEngine().bell(174);
      setBest((prev) => {
        if (secs > prev) {
          localStorage.setItem(KEY, String(secs));
          return secs;
        }
        return prev;
      });
    }
  }, []);

  // global listeners that end the session on any interaction
  useEffect(() => {
    if (!running) return;

    const onMove = (e: PointerEvent | MouseEvent) => {
      const p = { x: e.clientX, y: e.clientY };
      if (lastPos.current) {
        moveAcc.current += Math.hypot(
          p.x - lastPos.current.x,
          p.y - lastPos.current.y,
        );
      }
      lastPos.current = p;
      if (moveAcc.current > MOVE_THRESHOLD) stop(true);
    };
    const onBreak = () => stop(true);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onBreak);
    window.addEventListener("keydown", onBreak);
    window.addEventListener("wheel", onBreak, { passive: true });
    window.addEventListener("touchmove", onBreak, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onBreak);
      window.removeEventListener("keydown", onBreak);
      window.removeEventListener("wheel", onBreak);
      window.removeEventListener("touchmove", onBreak);
    };
  }, [running, stop]);

  // clean up the drone if we navigate away mid-session
  useEffect(() => {
    return () => {
      getEngine().setVolume("tanpura", 0);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const begin = () => {
    moveAcc.current = 0;
    lastPos.current = null;
    startTime.current = performance.now();
    setElapsed(0);
    setEnded(false);
    setRunning(true);
    getEngine().setVolume("tanpura", 0.32);
    const tick = () => {
      setElapsed((performance.now() - startTime.current) / 1000);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const isRecord = ended && lastRun >= best && lastRun > 0;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center py-6">
      <h2 className="font-display text-2xl">Space-out · 멍때리기</h2>
      <p className="text-dim mt-1 max-w-md text-center text-sm">
        The Korean art of doing absolutely nothing. Start, then stay perfectly
        still — the instant you move, click or type, your session ends. How long
        can you simply <em>be</em>?
      </p>

      {/* the void */}
      <div className="relative my-8 flex h-72 w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/40 sm:h-80">
        {/* slow breathing aura */}
        <div
          className={`absolute rounded-full bg-gradient-to-br from-[var(--color-peacock)]/40 to-[var(--color-indigo,#3a2b5c)]/40 blur-xl ${
            running ? "mung-breathe" : ""
          }`}
          style={{ width: 180, height: 180 }}
        />
        <div className="relative z-10 text-center">
          {running ? (
            <>
              <p className="font-display text-5xl tabular-nums">{fmt(elapsed)}</p>
              <p className="text-dim mt-2 text-xs tracking-[0.3em] uppercase">
                stay still…
              </p>
            </>
          ) : ended ? (
            <div className="animate-fade-up">
              <p className="text-dim text-xs tracking-[0.3em] uppercase">
                you spaced out for
              </p>
              <p className="font-display mt-1 text-5xl tabular-nums">
                {fmt(lastRun)}
              </p>
              <p className="mt-2 text-sm text-[var(--color-marigold)]">
                {isRecord ? "✦ a new personal best!" : "nicely done"}
              </p>
            </div>
          ) : (
            <p className="text-dim font-display text-xl">멍…</p>
          )}
        </div>
      </div>

      {!running && (
        <button
          onClick={begin}
          className="rounded-full bg-white/15 px-8 py-3 font-medium transition hover:bg-white/25"
        >
          {ended ? "space out again" : "begin spacing out"}
        </button>
      )}
      {running && (
        <p className="text-dim text-sm">don&apos;t move a muscle 🫧</p>
      )}

      <p className="text-dim mt-6 text-sm">
        Longest space-out:{" "}
        <span className="text-white tabular-nums">{fmt(best)}</span>
      </p>

      <style>{`
        @keyframes mung-breathe {
          0%, 100% { transform: scale(0.85); opacity: 0.55; }
          50% { transform: scale(1.25); opacity: 0.9; }
        }
        .mung-breathe { animation: mung-breathe 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
