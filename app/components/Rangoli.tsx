"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const COLORS = [
  { name: "marigold", v: "#f0a13a" },
  { name: "sindoor", v: "#e8413a" },
  { name: "peacock", v: "#1fb6b6" },
  { name: "haldi", v: "#ffd23f" },
  { name: "rani", v: "#e0399b" },
  { name: "indigo", v: "#7b6cf6" },
  { name: "leaf", v: "#7bc043" },
  { name: "white", v: "#fdf6ec" },
];
const SYMS = [4, 6, 8, 12, 16];

type BrushId = "line" | "dots" | "petal" | "star";
const BRUSHES: { id: BrushId; label: string; icon: string }[] = [
  { id: "line", label: "Line", icon: "〰" },
  { id: "dots", label: "Pulli", icon: "⠿" },
  { id: "petal", label: "Petal", icon: "❀" },
  { id: "star", label: "Star", icon: "✦" },
];

type Pt = { x: number; y: number };
const TAU = Math.PI * 2;

export default function Rangoli() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const last = useRef<Pt | null>(null);
  const undoStack = useRef<ImageData[]>([]);
  const hue = useRef(0);

  const [color, setColor] = useState(COLORS[0].v);
  const [sym, setSym] = useState(8);
  const [brush, setBrush] = useState<BrushId>("line");
  const [size, setSize] = useState(3.5);
  const [rainbow, setRainbow] = useState(false);
  const [mirror, setMirror] = useState(true);
  const [glow, setGlow] = useState(true);
  const [canUndo, setCanUndo] = useState(false);

  // keep latest values reachable inside pointer handlers without re-binding
  const refs = useRef({ color, sym, brush, size, rainbow, mirror, glow });
  refs.current = { color, sym, brush, size, rainbow, mirror, glow };

  const paintBg = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
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
          const a = (i / n) * TAU;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.6, 0, TAU);
          ctx.fill();
        }
      }
    },
    [],
  );

  const pushUndo = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    undoStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (undoStack.current.length > 25) undoStack.current.shift();
    setCanUndo(true);
  }, []);

  const undo = useCallback(() => {
    const ctx = ctxRef.current;
    const img = undoStack.current.pop();
    if (ctx && img) ctx.putImageData(img, 0, 0);
    setCanUndo(undoStack.current.length > 0);
  }, []);

  const reset = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    pushUndo();
    paintBg(ctx, canvas.width, canvas.height);
  }, [paintBg, pushUndo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctxRef.current = ctx;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    paintBg(ctx, canvas.width, canvas.height);
  }, [paintBg]);

  const pos = (e: React.PointerEvent): Pt => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const inkColor = () =>
    refs.current.rainbow ? `hsl(${hue.current}, 85%, 62%)` : refs.current.color;

  // one motif copy, drawn at an already-transformed location
  const primitive = (ctx: CanvasRenderingContext2D, from: Pt, to: Pt) => {
    const { brush: b, size: s } = refs.current;
    const col = inkColor();
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    if (b === "line") {
      ctx.lineCap = "round";
      ctx.lineWidth = s;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (b === "dots") {
      ctx.beginPath();
      ctx.arc(to.x, to.y, s * 0.95, 0, TAU);
      ctx.fill();
    } else if (b === "petal") {
      const ang = Math.atan2(to.y - from.y, to.x - from.x);
      ctx.save();
      ctx.translate(to.x, to.y);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 2.1, s * 0.95, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    } else if (b === "star") {
      const ang = Math.atan2(to.y - from.y, to.x - from.x);
      const R = s * 2.4;
      const r = R * 0.45;
      ctx.save();
      ctx.translate(to.x, to.y);
      ctx.rotate(ang);
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? R : r;
        const a = (i / 10) * TAU;
        const px = Math.cos(a) * rad;
        const py = Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
  };

  const stroke = (from: Pt, to: Pt) => {
    const ctx = ctxRef.current!;
    const canvas = canvasRef.current!;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const { sym: n, glow: g, mirror: useMirror } = refs.current;

    ctx.shadowColor = inkColor();
    ctx.shadowBlur = g ? 9 : 0;

    const fx = from.x - cx;
    const fy = from.y - cy;
    const tx = to.x - cx;
    const ty = to.y - cy;
    const mirrors = useMirror ? [1, -1] : [1];

    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      mirrors.forEach((m) => {
        const f = {
          x: cx + fx * m * cos - fy * sin,
          y: cy + fx * m * sin + fy * cos,
        };
        const t = {
          x: cx + tx * m * cos - ty * sin,
          y: cy + tx * m * sin + ty * cos,
        };
        primitive(ctx, f, t);
      });
    }
    ctx.shadowBlur = 0;
    if (refs.current.rainbow) hue.current = (hue.current + 5) % 360;
  };

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pushUndo();
    drawing.current = true;
    const p = pos(e);
    last.current = p;
    // a tap should leave a mark too (great for dots/petals/stars)
    stroke(p, { x: p.x + 0.01, y: p.y });
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

  // Auto-generate a full symmetric rangoli
  const generate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    pushUndo();
    paintBg(ctx, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const minDim = Math.min(canvas.width, canvas.height);
    const palette = COLORS.map((c) => c.v);
    const r = refs.current;

    // randomise symmetry for variety
    const pickedSym = [8, 12, 16][Math.floor(Math.random() * 3)];
    setSym(pickedSym);
    r.sym = pickedSym;
    r.mirror = true;
    r.glow = true;

    const rings = 4 + Math.floor(Math.random() * 3);
    for (let k = 1; k <= rings; k++) {
      const rad = (k / (rings + 1)) * minDim * 0.42;
      r.color = palette[Math.floor(Math.random() * palette.length)];
      r.brush = (["line", "dots", "petal", "star"] as BrushId[])[
        Math.floor(Math.random() * 4)
      ];
      r.size = 2 + Math.random() * 4;
      // a small radial dash forms one arm; symmetry mirrors it into a ring
      const from = { x: cx, y: cy - rad };
      const to = { x: cx + (Math.random() - 0.5) * 26, y: cy - rad - (10 + Math.random() * 22) };
      stroke(from, to);
      // a bead ring between motifs
      r.brush = "dots";
      r.size = 1.6 + Math.random() * 1.6;
      stroke({ x: cx, y: cy - rad }, { x: cx, y: cy - rad });
    }

    // restore refs to the visible UI state (sym stays as picked)
    r.color = color;
    r.brush = brush;
    r.size = size;
    r.rainbow = rainbow;
    r.mirror = mirror;
    r.glow = glow;
  }, [brush, color, glow, mirror, paintBg, pushUndo, rainbow, size]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `rangoli-${Date.now()}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  }, []);

  const chip =
    "rounded-full px-3 py-1 text-xs transition glass text-dim hover:text-white";
  const chipOn = "bg-[var(--color-marigold)]/30 text-white";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col py-6">
      <h2 className="font-display text-2xl">Rangoli · रंगोली</h2>
      <p className="text-dim mt-1 text-sm">
        Draw anywhere — your strokes bloom into a perfectly symmetric rangoli.
        Switch brushes, go rainbow, or let the app design one for you.
      </p>

      {/* colours */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c.v}
            onClick={() => {
              setColor(c.v);
              setRainbow(false);
            }}
            aria-label={c.name}
            className={`h-7 w-7 rounded-full transition ${
              !rainbow && color === c.v
                ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-transparent"
                : ""
            }`}
            style={{ background: c.v }}
          />
        ))}
        <button
          onClick={() => setRainbow((r) => !r)}
          aria-label="rainbow"
          className={`h-7 w-7 rounded-full transition ${
            rainbow ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-transparent" : ""
          }`}
          style={{
            background:
              "conic-gradient(from 0deg, #f0a13a, #e8413a, #e0399b, #7b6cf6, #1fb6b6, #7bc043, #f0a13a)",
          }}
          title="Rainbow ink"
        />
      </div>

      {/* brushes */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {BRUSHES.map((b) => (
          <button
            key={b.id}
            onClick={() => setBrush(b.id)}
            className={`${chip} ${brush === b.id ? chipOn : ""}`}
          >
            <span className="mr-1">{b.icon}</span>
            {b.label}
          </button>
        ))}
      </div>

      {/* symmetry + size + toggles */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-dim text-xs">symmetry</span>
        {SYMS.map((s) => (
          <button
            key={s}
            onClick={() => setSym(s)}
            className={`${chip} ${sym === s ? chipOn : ""}`}
          >
            {s}×
          </button>
        ))}
        <button
          onClick={() => setMirror((m) => !m)}
          className={`${chip} ${mirror ? chipOn : ""}`}
          title="Mirror each arm for kaleidoscope symmetry"
        >
          ⇋ mirror
        </button>
        <button
          onClick={() => setGlow((g) => !g)}
          className={`${chip} ${glow ? chipOn : ""}`}
        >
          ✺ glow
        </button>
        <label className="text-dim ml-1 flex items-center gap-2 text-xs">
          size
          <input
            type="range"
            min={1.5}
            max={9}
            step={0.5}
            value={size}
            onChange={(e) => setSize(parseFloat(e.target.value))}
            className="w-24 accent-[var(--color-marigold)]"
          />
        </label>
      </div>

      {/* actions */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={generate}
          className="rounded-full bg-[var(--color-marigold)]/25 px-4 py-1.5 text-sm text-white transition hover:bg-[var(--color-marigold)]/40"
        >
          ✨ surprise me
        </button>
        <button
          onClick={undo}
          disabled={!canUndo}
          className="rounded-full px-4 py-1.5 text-sm text-dim transition enabled:hover:text-white disabled:opacity-30"
        >
          ↶ undo
        </button>
        <button
          onClick={download}
          className="rounded-full px-4 py-1.5 text-sm text-dim transition hover:text-white"
        >
          ⤓ save
        </button>
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
        className="mt-4 aspect-square w-full touch-none rounded-3xl border border-white/10 shadow-2xl"
        style={{ cursor: "crosshair", maxHeight: "58vh" }}
      />
    </div>
  );
}
