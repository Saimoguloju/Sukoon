"use client";

import { useEffect, useRef, useState } from "react";
import { getEngine } from "@/lib/audio";

const DURATIONS = [1, 3, 5, 10];

const PROMPTS = [
  "Hold your gaze softly on the flame.",
  "Blink only when you must.",
  "Let the light fill your whole mind.",
  "When a thought drifts in, return to the flame.",
  "Breathe slowly. Watch it dance.",
  "Unclench your jaw. Drop your shoulders.",
];

export default function Trataka() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [minutes, setMinutes] = useState(3);
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(0);
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const total = minutes * 60;

  // diya flame animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      t += 0.016;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const baseY = h * 0.72;
      // gentle flicker driven by layered sine waves
      const flick =
        Math.sin(t * 9) * 0.5 + Math.sin(t * 17 + 1) * 0.3 + Math.sin(t * 4) * 0.2;
      const sway = Math.sin(t * 2.3) * 6 * dpr + flick * 4 * dpr;
      const flameH = (120 + flick * 14) * dpr;
      const flameW = (34 + flick * 4) * dpr;

      // ambient glow
      const glow = ctx.createRadialGradient(
        cx,
        baseY - flameH * 0.4,
        0,
        cx,
        baseY - flameH * 0.4,
        260 * dpr,
      );
      glow.addColorStop(0, "rgba(240,161,58,0.28)");
      glow.addColorStop(1, "rgba(240,161,58,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // outer flame
      const drawFlame = (
        scale: number,
        color: string,
        tipX: number,
      ) => {
        ctx.beginPath();
        ctx.moveTo(cx, baseY);
        ctx.quadraticCurveTo(
          cx - flameW * scale,
          baseY - flameH * 0.45,
          cx + tipX,
          baseY - flameH * scale,
        );
        ctx.quadraticCurveTo(
          cx + flameW * scale,
          baseY - flameH * 0.45,
          cx,
          baseY,
        );
        ctx.fillStyle = color;
        ctx.fill();
      };
      drawFlame(1.05, "rgba(226,87,30,0.85)", sway);
      drawFlame(0.78, "rgba(240,161,58,0.95)", sway * 0.7);
      drawFlame(0.5, "rgba(255,236,170,0.98)", sway * 0.5);

      // bright core
      const core = ctx.createRadialGradient(
        cx,
        baseY - flameH * 0.2,
        0,
        cx,
        baseY - flameH * 0.2,
        18 * dpr,
      );
      core.addColorStop(0, "rgba(255,255,255,0.95)");
      core.addColorStop(1, "rgba(255,236,170,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, baseY - flameH * 0.2, 18 * dpr, 0, Math.PI * 2);
      ctx.fill();

      // simple diya lamp base
      ctx.fillStyle = "#6b3b1f";
      ctx.beginPath();
      ctx.ellipse(cx, baseY + 14 * dpr, 70 * dpr, 22 * dpr, 0, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = "#492610";
      ctx.beginPath();
      ctx.ellipse(cx, baseY + 14 * dpr, 70 * dpr, 10 * dpr, 0, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      getEngine().bell(136.1);
      setRunning(false);
      return;
    }
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [running, left]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () => setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]),
      12000,
    );
    return () => clearInterval(id);
  }, [running]);

  const start = () => {
    setLeft(total);
    setPrompt(PROMPTS[0]);
    setRunning(true);
    getEngine().bell(136.1);
  };

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const progress = running ? 1 - left / total : 0;
  const R = 140;
  const circ = 2 * Math.PI * R;

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center py-6">
      <h2 className="font-display text-2xl">Trataka · त्राटक</h2>
      <p className="text-dim mt-1 max-w-md text-center text-sm">
        An ancient yogic practice of gazing steadily at a flame to focus the
        mind and calm the breath. Soften your eyes and watch the diya.
      </p>

      <div className="relative my-6 flex h-[360px] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/30">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* timer ring */}
        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          className="relative z-10"
        >
          <circle
            cx="160"
            cy="160"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
          />
          <circle
            cx="160"
            cy="160"
            r={R}
            fill="none"
            stroke="var(--color-marigold)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progress)}
            transform="rotate(-90 160 160)"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
          {running && (
            <text
              x="160"
              y="56"
              textAnchor="middle"
              className="fill-white/90 font-display"
              style={{ fontSize: 30 }}
            >
              {mm}:{ss}
            </text>
          )}
        </svg>
      </div>

      {running ? (
        <>
          <p
            className="font-display animate-fade-up text-center text-lg"
            key={prompt}
          >
            {prompt}
          </p>
          <button
            onClick={() => setRunning(false)}
            className="text-dim mt-4 text-sm underline-offset-4 hover:underline"
          >
            end early
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setMinutes(d)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  minutes === d
                    ? "bg-[var(--color-marigold)]/30 text-white"
                    : "glass text-dim hover:text-white"
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
          <button
            onClick={start}
            className="rounded-full bg-white/15 px-8 py-3 font-medium transition hover:bg-white/25"
          >
            Light the diya
          </button>
        </div>
      )}
    </div>
  );
}
