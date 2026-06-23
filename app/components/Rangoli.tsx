"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const COLORS = [
  { name: "marigold", v: "#f0a13a" },
  { name: "sindoor", v: "#e8413a" },
  { name: "peacock", v: "#1fb6b6" },
  { name: "haldi", v: "#ffd23f" },
  { name: "rani", v: "#e0399b" },
  { name: "white", v: "#fdf6ec" },
];
const SYMS = [6, 8, 12];

export default function Rangoli() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const [color, setColor] = useState(COLORS[0].v);
  const [sym, setSym] = useState(8);
  const colorRef = useRef(color);
  const symRef = useRef(sym);
  colorRef.current = color;
  symRef.current = sym;

  const paintBg = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.4);
    g.addColorStop(0, "rgba(60,28,42,0.6)");
    g.addColorStop(1, "rgba(20,12,28,0.85)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // faint rangoli guide dots (pulli) on concentric rings
    ctx.fillStyle = "rgba(255,220,180,0.10)";
    const cx = w / 2;
    const cy = h / 2;
    for (let ring = 1; ring <= 5; ring++) {
      const r = ring * Math.min(w, h) * 0.08;
      const n = ring * 8;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, []);

  const reset = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (ctx && canvas) paintBg(ctx, canvas.width, canvas.height);
  }, [paintBg]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctxRef.current = ctx;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    paintBg(ctx, canvas.width, canvas.height);
  }, [paintBg]);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = ctxRef.current!;
    const canvas = canvasRef.current!;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const n = symRef.current;
    ctx.lineCap = "round";
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = colorRef.current;
    ctx.shadowColor = colorRef.current;
    ctx.shadowBlur = 8;

    const fx = from.x - cx;
    const fy = from.y - cy;
    const tx = to.x - cx;
    const ty = to.y - cy;

    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      // rotated copy
      [1, -1].forEach((mirror) => {
        const f = {
          x: cx + (fx * mirror) * cos - fy * sin,
          y: cy + (fx * mirror) * sin + fy * cos,
        };
        const t = {
          x: cx + (tx * mirror) * cos - ty * sin,
          y: cy + (tx * mirror) * sin + ty * cos,
        };
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      });
    }
    ctx.shadowBlur = 0;
  };

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const p = pos(e);
    if (last.current) stroke(last.current, p);
    last.current = p;
  };
  const onUp = () => {
    drawing.current = false;
    last.current = null;
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col py-6">
      <h2 className="font-display text-2xl">Rangoli · रंगोली</h2>
      <p className="text-dim mt-1 text-sm">
        Draw anywhere — your strokes bloom into a perfectly symmetric rangoli.
        Pick a colour, lose yourself in the pattern.
      </p>

      <div className="mt-4 mb-3 flex flex-wrap items-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c.v}
            onClick={() => setColor(c.v)}
            aria-label={c.name}
            className={`h-7 w-7 rounded-full transition ${
              color === c.v ? "ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110" : ""
            }`}
            style={{ background: c.v }}
          />
        ))}
        <span className="text-dim mx-1 text-xs">symmetry</span>
        {SYMS.map((s) => (
          <button
            key={s}
            onClick={() => setSym(s)}
            className={`rounded-full px-3 py-1 text-xs transition ${
              sym === s
                ? "bg-[var(--color-marigold)]/30 text-white"
                : "glass text-dim hover:text-white"
            }`}
          >
            {s}×
          </button>
        ))}
        <button
          onClick={reset}
          className="ml-auto rounded-full px-4 py-1.5 text-sm text-dim transition hover:text-white"
        >
          clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        className="aspect-square w-full touch-none rounded-3xl border border-white/10 shadow-2xl"
        style={{ cursor: "crosshair", maxHeight: "60vh" }}
      />
    </div>
  );
}
