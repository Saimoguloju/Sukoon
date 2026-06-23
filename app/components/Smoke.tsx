"use client";

import { useEffect, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  seed: number;
  spin: number;
};

export default function Smoke() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pressing = useRef(false);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let t = 0;
    const particles: Particle[] = [];
    const MAX = 520;

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const emit = (x: number, y: number, n: number, spread: number) => {
      for (let i = 0; i < n && particles.length < MAX; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * spread,
          y: y + (Math.random() - 0.5) * spread,
          vx: (Math.random() - 0.5) * 0.25 * dpr,
          vy: (-0.5 - Math.random() * 0.5) * dpr,
          age: 0,
          life: 2.6 + Math.random() * 2.4,
          size: (8 + Math.random() * 10) * dpr,
          seed: Math.random() * 1000,
          spin: (Math.random() - 0.5) * 0.6,
        });
      }
    };

    const draw = () => {
      t += 0.016;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // incense stick standing bottom-centre, with a glowing ember tip
      const stickX = w / 2;
      const tipY = h * 0.5;
      ctx.strokeStyle = "rgba(120,80,55,0.9)";
      ctx.lineWidth = 3 * dpr;
      ctx.beginPath();
      ctx.moveTo(stickX, h);
      ctx.lineTo(stickX, tipY);
      ctx.stroke();
      const emberGlow = pressing.current ? 1 : 0.6 + Math.sin(t * 4) * 0.15;
      const eg = ctx.createRadialGradient(stickX, tipY, 0, stickX, tipY, 16 * dpr);
      eg.addColorStop(0, `rgba(255,140,40,${0.9 * emberGlow})`);
      eg.addColorStop(1, "rgba(255,90,20,0)");
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(stickX, tipY, 16 * dpr, 0, Math.PI * 2);
      ctx.fill();

      // continuous thin wisp from the ember
      if (Math.random() < 0.7) emit(stickX, tipY, 1, 4 * dpr);
      // press anywhere -> a fuller plume from the finger
      if (pressing.current && pointer.current) {
        emit(pointer.current.x, pointer.current.y, 3, 8 * dpr);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += 0.016;
        if (p.age >= p.life) {
          particles.splice(i, 1);
          continue;
        }
        const k = p.age / p.life;
        // curling drift via layered sine (fake turbulence)
        p.vy += -0.012 * dpr; // keep rising, gently accelerating
        p.vy *= 0.992;
        const curl =
          Math.sin(p.age * 1.6 + p.seed) * 0.35 +
          Math.sin(p.age * 0.7 + p.seed * 2) * 0.5;
        p.x += p.vx + curl * dpr + Math.sin(t * 0.4) * 0.15 * dpr;
        p.y += p.vy;

        const size = p.size * (1 + k * 2.4);
        // fade in quickly, then out
        const alpha = Math.sin(Math.min(k * 1.15, 1) * Math.PI) * 0.16;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        g.addColorStop(0, `rgba(232,230,235,${alpha})`);
        g.addColorStop(1, "rgba(232,230,235,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const toCanvas = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const dpr = canvas.width / rect.width;
    return { x: (e.clientX - rect.left) * dpr, y: (e.clientY - rect.top) * dpr };
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col py-6">
      <h2 className="font-display text-2xl">Incense · धूप</h2>
      <p className="text-dim mt-1 text-sm">
        Light an agarbatti for your mind. Press &amp; hold anywhere — let the
        smoke curl upward and carry the tension with it.
      </p>

      <div className="relative mt-4">
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            pressing.current = true;
            pointer.current = toCanvas(e);
            setHint(false);
          }}
          onPointerMove={(e) => {
            if (pressing.current) pointer.current = toCanvas(e);
          }}
          onPointerUp={() => {
            pressing.current = false;
            pointer.current = null;
          }}
          onPointerLeave={() => {
            pressing.current = false;
            pointer.current = null;
          }}
          className="h-[60vh] max-h-[560px] w-full touch-none rounded-3xl border border-white/10 bg-gradient-to-b from-black/40 to-black/10 shadow-2xl"
          style={{ cursor: "pointer" }}
        />
        {hint && (
          <p className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-sm text-white/40">
            press &amp; hold anywhere
          </p>
        )}
      </div>

      <p className="text-dim mt-3 text-center text-xs">
        Breathe in slowly as you press, breathe out as you watch it rise.
      </p>
    </div>
  );
}
