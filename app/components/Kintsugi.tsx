"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getEngine } from "@/lib/audio";

// Kintsugi (金継ぎ) — the Japanese art of repairing broken pottery with gold,
// treating the breakage as part of the object's history rather than something
// to hide. Trace the cracks with your finger and watch them fill with gold.

type Pt = { x: number; y: number };
type Seg = { a: Pt; b: Pt; mended: boolean };

const PROVERBS = [
  "There is beauty in the broken and repaired.",
  "Your scars are part of your story — and they shine.",
  "Nothing whole is as strong as something well mended.",
  "侘寂 — embrace the imperfect, the impermanent, the incomplete.",
];

// shortest distance from point p to segment a–b
function distToSeg(p: Pt, a: Pt, b: Pt) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = a.x + t * dx;
  const cy = a.y + t * dy;
  return Math.hypot(p.x - cx, p.y - cy);
}

export default function Kintsugi() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segsRef = useRef<Seg[]>([]);
  const pressing = useRef(false);
  const dprRef = useRef(1);
  const lastBead = useRef(0);
  const [percent, setPercent] = useState(0);
  const [done, setDone] = useState(false);
  const [proverb] = useState(
    () => PROVERBS[Math.floor(Math.random() * PROVERBS.length)],
  );

  const buildCracks = useCallback((w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.36;
    // impact point somewhere off-centre on the bowl
    const ia = Math.random() * Math.PI * 2;
    const ir = R * (0.15 + Math.random() * 0.5);
    const impact = { x: cx + Math.cos(ia) * ir, y: cy + Math.sin(ia) * ir };

    const segs: Seg[] = [];
    const lines = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < lines; i++) {
      const dir = (i / lines) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
      let p = { ...impact };
      let ang = dir;
      const steps = 6 + Math.floor(Math.random() * 5);
      for (let s = 0; s < steps; s++) {
        ang += (Math.random() - 0.5) * 0.7;
        const len = R * (0.1 + Math.random() * 0.12);
        const np = { x: p.x + Math.cos(ang) * len, y: p.y + Math.sin(ang) * len };
        const d = Math.hypot(np.x - cx, np.y - cy);
        if (d > R * 0.97) break;
        segs.push({ a: p, b: np, mended: false });
        // occasional small branch
        if (Math.random() < 0.25 && s > 1) {
          const bAng = ang + (Math.random() < 0.5 ? 1 : -1) * (0.6 + Math.random());
          const bLen = R * 0.12;
          const bp = {
            x: np.x + Math.cos(bAng) * bLen,
            y: np.y + Math.sin(bAng) * bLen,
          };
          if (Math.hypot(bp.x - cx, bp.y - cy) < R * 0.97) {
            segs.push({ a: np, b: bp, mended: false });
          }
        }
        p = np;
      }
    }
    return segs;
  }, []);

  const newBowl = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    segsRef.current = buildCracks(canvas.width, canvas.height);
    setPercent(0);
    setDone(false);
  }, [buildCracks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    segsRef.current = buildCracks(canvas.width, canvas.height);

    let raf = 0;
    let t = 0;
    const draw = () => {
      t += 0.016;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.4;
      ctx.clearRect(0, 0, w, h);

      // ceramic bowl body
      const body = ctx.createRadialGradient(
        cx - R * 0.3,
        cy - R * 0.3,
        R * 0.1,
        cx,
        cy,
        R,
      );
      body.addColorStop(0, "#3a4a52");
      body.addColorStop(0.7, "#26333a");
      body.addColorStop(1, "#161f24");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // rim highlight
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 2 * dprRef.current;
      ctx.beginPath();
      ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
      ctx.stroke();

      // cracks
      const segs = segsRef.current;
      segs.forEach((sg) => {
        if (sg.mended) {
          // glowing gold seam (kintsugi)
          const shimmer = 0.8 + Math.sin(t * 2 + sg.a.x * 0.05) * 0.2;
          ctx.strokeStyle = `rgba(240, 200, 90, ${shimmer})`;
          ctx.shadowColor = "rgba(240, 180, 60, 0.9)";
          ctx.shadowBlur = 10 * dprRef.current;
          ctx.lineWidth = 3.2 * dprRef.current;
        } else {
          // raw dark crack
          ctx.strokeStyle = "rgba(0,0,0,0.55)";
          ctx.shadowBlur = 0;
          ctx.lineWidth = 1.6 * dprRef.current;
        }
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(sg.a.x, sg.a.y);
        ctx.lineTo(sg.b.x, sg.b.y);
        ctx.stroke();
      });
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      segsRef.current = buildCracks(canvas.width, canvas.height);
      setPercent(0);
      setDone(false);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [buildCracks]);

  const toCanvas = (e: React.PointerEvent): Pt => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale };
  };

  const mendAt = (p: Pt) => {
    const segs = segsRef.current;
    if (!segs.length) return;
    const reach = 16 * dprRef.current;
    let changed = false;
    for (const sg of segs) {
      if (!sg.mended && distToSeg(p, sg.a, sg.b) < reach) {
        sg.mended = true;
        changed = true;
      }
    }
    if (!changed) return;

    const mended = segs.filter((s) => s.mended).length;
    const pct = Math.round((mended / segs.length) * 100);
    setPercent(pct);

    // soft bead chime, throttled
    const now = performance.now();
    if (now - lastBead.current > 90) {
      getEngine().bead();
      lastBead.current = now;
    }
    if (pct === 100 && !done) {
      setDone(true);
      getEngine().bell(272.2);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center py-6">
      <h2 className="font-display text-2xl">Kintsugi · 金継ぎ</h2>
      <p className="text-dim mt-1 max-w-md text-center text-sm">
        The Japanese art of mending broken pottery with gold — honouring the
        cracks instead of hiding them. Trace each seam slowly and make the bowl
        whole again.
      </p>

      <div className="relative my-7 flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            pressing.current = true;
            mendAt(toCanvas(e));
          }}
          onPointerMove={(e) => {
            if (pressing.current) mendAt(toCanvas(e));
          }}
          onPointerUp={() => (pressing.current = false)}
          onPointerLeave={() => (pressing.current = false)}
          className="h-full w-full touch-none select-none rounded-full"
          style={{ cursor: "crosshair" }}
        />
        {done && (
          <p className="font-display animate-fade-up pointer-events-none absolute -bottom-2 px-6 text-center text-sm text-[var(--color-haldi)]">
            {proverb}
          </p>
        )}
      </div>

      {/* gold-fill progress */}
      <div className="w-56 rounded-full border border-white/10 bg-white/5 p-1">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-[var(--color-haldi)] to-[var(--color-marigold)] transition-all duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-dim mt-2 text-sm">
        Mended <span className="text-white tabular-nums">{percent}%</span>
      </p>

      <button
        onClick={newBowl}
        className="mt-5 rounded-full bg-white/15 px-6 py-2.5 text-sm font-medium transition hover:bg-white/25"
      >
        break a new bowl
      </button>
    </div>
  );
}
