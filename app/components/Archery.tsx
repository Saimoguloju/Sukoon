"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getEngine } from "@/lib/audio";

// Dhanush (धनुष) — Arjuna's focus. Arrows hang in the air; tap one and it looses
// in the direction it points, flying off-screen. Clear them all to advance.
// Each of the 50 levels adds more arrows and more motion — sharpen your aim.

const MAX_LEVEL = 50;

type Arrow = {
  id: number;
  x: number;
  y: number;
  angle: number; // direction it points / will fly
  spin: number; // idle rotation speed (rad/frame)
  driftA: number; // idle drift heading
  driftS: number; // idle drift speed
  len: number;
  launched: boolean;
  vx: number;
  vy: number;
};

export default function Archery() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arrowsRef = useRef<Arrow[]>([]);
  const dprRef = useRef(1);
  const levelRef = useRef(1);
  const advancingRef = useRef(false);
  const idCounter = useRef(0);

  const [level, setLevel] = useState(1);
  const [left, setLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);

  const spawnLevel = useCallback((lvl: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const dpr = dprRef.current;
    const margin = 60 * dpr;
    const count = Math.min(3 + lvl, 26);
    const len = Math.max(20, 40 - lvl * 0.35) * dpr;

    const arrows: Arrow[] = [];
    for (let i = 0; i < count; i++) {
      arrows.push({
        id: idCounter.current++,
        x: margin + Math.random() * (w - margin * 2),
        y: margin + Math.random() * (h - margin * 2),
        angle: Math.random() * Math.PI * 2,
        spin: lvl > 12 ? (Math.random() - 0.5) * 0.02 * (lvl / 12) : 0,
        driftA: Math.random() * Math.PI * 2,
        driftS: lvl > 5 ? (0.2 + Math.random() * 0.5) * dpr * (1 + lvl / 30) : 0,
        len,
        launched: false,
        vx: 0,
        vy: 0,
      });
    }
    arrowsRef.current = arrows;
    advancingRef.current = false;
    setLeft(arrows.filter((a) => !a.launched).length);
  }, []);

  const restart = useCallback(() => {
    levelRef.current = 1;
    setLevel(1);
    setScore(0);
    setWon(false);
    spawnLevel(1);
  }, [spawnLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    spawnLevel(1);
    window.addEventListener("resize", resize);

    let raf = 0;
    const drawArrow = (a: Arrow) => {
      const L = a.len;
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.angle);
      // shaft
      ctx.strokeStyle = a.launched ? "rgba(240,161,58,0.9)" : "#e6c34a";
      ctx.lineWidth = Math.max(2, L * 0.07);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-L, 0);
      ctx.lineTo(L * 0.7, 0);
      ctx.stroke();
      // arrowhead
      ctx.fillStyle = "#f0a13a";
      ctx.beginPath();
      ctx.moveTo(L, 0);
      ctx.lineTo(L * 0.6, -L * 0.22);
      ctx.lineTo(L * 0.6, L * 0.22);
      ctx.closePath();
      ctx.fill();
      // fletching
      ctx.fillStyle = "#e8413a";
      ctx.beginPath();
      ctx.moveTo(-L, 0);
      ctx.lineTo(-L * 0.7, -L * 0.2);
      ctx.lineTo(-L * 0.55, 0);
      ctx.lineTo(-L * 0.7, L * 0.2);
      ctx.closePath();
      ctx.fill();
      // soft target ring around idle arrows
      if (!a.launched) {
        ctx.rotate(-a.angle);
        ctx.strokeStyle = "rgba(255,255,255,0.10)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, L * 0.95, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    };

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const arrows = arrowsRef.current;
      const off = 80 * dprRef.current;
      for (let i = arrows.length - 1; i >= 0; i--) {
        const a = arrows[i];
        if (a.launched) {
          a.x += a.vx;
          a.y += a.vy;
          if (
            a.x < -off ||
            a.x > w + off ||
            a.y < -off ||
            a.y > h + off
          ) {
            arrows.splice(i, 1);
            continue;
          }
        } else {
          a.angle += a.spin;
          if (a.driftS) {
            a.x += Math.cos(a.driftA) * a.driftS;
            a.y += Math.sin(a.driftA) * a.driftS;
            // bounce inside bounds
            const m = 40 * dprRef.current;
            if (a.x < m || a.x > w - m) a.driftA = Math.PI - a.driftA;
            if (a.y < m || a.y > h - m) a.driftA = -a.driftA;
          }
        }
        drawArrow(a);
      }

      // level cleared?
      if (arrows.length === 0 && !advancingRef.current) {
        advancingRef.current = true;
        if (levelRef.current >= MAX_LEVEL) {
          setWon(true);
          getEngine().bell(272.2);
        } else {
          getEngine().bell(136.1 * 2);
          window.setTimeout(() => {
            levelRef.current += 1;
            setLevel(levelRef.current);
            spawnLevel(levelRef.current);
          }, 700);
        }
      }

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [spawnLevel]);

  const onShoot = (e: React.PointerEvent) => {
    if (won) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const px = (e.clientX - rect.left) * scale;
    const py = (e.clientY - rect.top) * scale;

    const arrows = arrowsRef.current;
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < arrows.length; i++) {
      const a = arrows[i];
      if (a.launched) continue;
      const d = Math.hypot(a.x - px, a.y - py);
      if (d < a.len * 1.1 && d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    if (bestIdx === -1) return;

    const a = arrows[bestIdx];
    a.launched = true;
    a.spin = 0;
    const speed = (14 + levelRef.current * 0.15) * dprRef.current;
    a.vx = Math.cos(a.angle) * speed;
    a.vy = Math.sin(a.angle) * speed;
    getEngine().twang();
    setScore((s) => s + 1);
    setLeft(arrows.filter((x) => !x.launched).length);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center py-6">
      <h2 className="font-display text-2xl">Archery · धनुष</h2>
      <p className="text-dim mt-1 max-w-md text-center text-sm">
        Arjuna&apos;s lesson was total focus. Tap each arrow to loose it in the
        way it points. Clear the field to advance — 50 levels, rising in
        difficulty.
      </p>

      <div className="mt-4 flex w-full max-w-md items-center justify-between text-sm">
        <span className="text-dim">
          Level <span className="text-white tabular-nums">{level}</span>
          <span className="text-dim">/{MAX_LEVEL}</span>
        </span>
        <span className="text-dim">
          Arrows left <span className="text-white tabular-nums">{left}</span>
        </span>
        <span className="text-dim">
          Loosed <span className="text-white tabular-nums">{score}</span>
        </span>
      </div>

      {/* difficulty meter */}
      <div className="mt-2 h-1 w-full max-w-md overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-haldi)] to-[var(--color-sindoor)] transition-all"
          style={{ width: `${(level / MAX_LEVEL) * 100}%` }}
        />
      </div>

      <div className="relative mt-4 w-full">
        <canvas
          ref={canvasRef}
          onPointerDown={onShoot}
          className="h-[58vh] max-h-[560px] w-full touch-none rounded-3xl border border-white/10 bg-gradient-to-b from-black/40 to-black/15 shadow-2xl"
          style={{ cursor: "crosshair" }}
        />
        {won && (
          <div className="animate-fade-up absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-black/55 text-center">
            <p className="font-display text-3xl text-[var(--color-marigold)]">
              🏹 You are Arjuna!
            </p>
            <p className="text-dim mt-2 text-sm">
              All 50 levels cleared with {score} arrows.
            </p>
            <button
              onClick={restart}
              className="mt-5 rounded-full bg-white/15 px-6 py-2.5 text-sm font-medium transition hover:bg-white/25"
            >
              draw the bow again
            </button>
          </div>
        )}
      </div>

      <button
        onClick={restart}
        className="text-dim mt-4 text-sm underline-offset-4 hover:underline"
      >
        restart from level 1
      </button>
    </div>
  );
}
