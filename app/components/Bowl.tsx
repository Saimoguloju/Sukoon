"use client";

import { useEffect, useRef, useState } from "react";
import { getEngine } from "@/lib/audio";

type Ripple = {
  r: number;
  maxR: number;
  alpha: number;
};

export default function Bowl() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rubbingIntensity, setRubbingIntensity] = useState(0);
  const rubbingScore = useRef(0);
  const lastAngle = useRef<number | null>(null);
  const pointerPos = useRef<{ x: number; y: number } | null>(null);
  const isPointerDown = useRef(false);

  useEffect(() => {
    // Start procedural singing bowl audio node graph
    getEngine().startBowl();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ripples: Ripple[] = [];
    let rippleTimer = 0;

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      // Slow exponential decay of rubbing activity score
      rubbingScore.current *= 0.975;
      if (rubbingScore.current < 0.001) rubbingScore.current = 0;

      const vol = Math.min(rubbingScore.current * 1.8, 1);
      getEngine().setBowlVolume(vol);
      setRubbingIntensity(vol);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const bowlRadius = 88 * dpr;

      // Draw concentric ripples if singing
      if (vol > 0.02) {
        rippleTimer++;
        if (rippleTimer % Math.max(5, Math.floor(18 - vol * 12)) === 0) {
          ripples.push({
            r: bowlRadius,
            maxR: bowlRadius * 2.2,
            alpha: vol * 0.45,
          });
        }
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 1.8 * dpr * (1 + (rp.r / rp.maxR) * 0.5);
        rp.alpha = (1 - (rp.r - bowlRadius) / (rp.maxR - bowlRadius)) * (vol * 0.45);
        if (rp.r >= rp.maxR || rp.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(240, 161, 58, ${rp.alpha})`;
        ctx.lineWidth = 1.8 * dpr;
        ctx.beginPath();
        ctx.arc(cx, cy, rp.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Outer Bowl Shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 20 * dpr;

      // Bowl Outer Brass Circle
      ctx.fillStyle = "#8a7343";
      ctx.beginPath();
      ctx.arc(cx, cy, bowlRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Bowl Brass Inner Radial Gradient (Hollow cavity)
      const hollowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bowlRadius);
      hollowGrad.addColorStop(0, "#2c2112");
      hollowGrad.addColorStop(0.7, "#42321a");
      hollowGrad.addColorStop(0.92, "#856d3e");
      hollowGrad.addColorStop(1, "#b59b63");
      ctx.fillStyle = hollowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, bowlRadius - 2 * dpr, 0, Math.PI * 2);
      ctx.fill();

      // Shiny Gold Rim Lip
      ctx.strokeStyle = "#e8c87d";
      ctx.lineWidth = 6 * dpr;
      ctx.beginPath();
      ctx.arc(cx, cy, bowlRadius - 3 * dpr, 0, Math.PI * 2);
      ctx.stroke();

      // Inner base decorative circles
      ctx.strokeStyle = "rgba(232, 200, 125, 0.25)";
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.arc(cx, cy, bowlRadius * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, bowlRadius * 0.44, 0, Math.PI * 2);
      ctx.stroke();

      // Inner center flower glyph (OM symbol or decorative node)
      ctx.fillStyle = "rgba(232, 200, 125, 0.22)";
      ctx.font = `bold ${24 * dpr}px var(--font-sans), sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ॐ", cx, cy);

      // Draw the wooden/felt mallet if pointer is active
      if (pointerPos.current && isPointerDown.current) {
        const mx = pointerPos.current.x * dpr;
        const my = pointerPos.current.y * dpr;

        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(-Math.PI / 6); // tilt the mallet

        // Mallet handle (Wood)
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(-4 * dpr, -40 * dpr, 8 * dpr, 45 * dpr);

        // Mallet felt head
        ctx.fillStyle = "#a82b2b";
        ctx.beginPath();
        ctx.ellipse(0, 5 * dpr, 9 * dpr, 13 * dpr, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      getEngine().stopBowl();
    };
  }, []);

  const getCanvasCoords = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isPointerDown.current = true;
    const pos = getCanvasCoords(e);
    pointerPos.current = pos;

    // Calculate initial angle
    const canvas = canvasRef.current!;
    const cx = canvas.clientWidth / 2;
    const cy = canvas.clientHeight / 2;
    lastAngle.current = Math.atan2(pos.y - cy, pos.x - cx);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown.current) return;
    const pos = getCanvasCoords(e);
    pointerPos.current = pos;

    const canvas = canvasRef.current!;
    const cx = canvas.clientWidth / 2;
    const cy = canvas.clientHeight / 2;

    const dx = pos.x - cx;
    const dy = pos.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const rimRadius = 88;

    // Check if rubbing is close to the rim
    if (dist > rimRadius - 28 && dist < rimRadius + 28) {
      const angle = Math.atan2(dy, dx);
      if (lastAngle.current !== null) {
        let diff = angle - lastAngle.current;

        // Wrap-around normalization
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        const absDiff = Math.abs(diff);

        // Filter out extreme jumps (lifting/re-pressing)
        if (absDiff > 0.005 && absDiff < 0.6) {
          // Increase score based on movement delta
          rubbingScore.current = Math.min(rubbingScore.current + absDiff * 0.35, 1.2);
        }
      }
      lastAngle.current = angle;
    }
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
    pointerPos.current = null;
    lastAngle.current = null;
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center py-6">
      <h2 className="font-display text-2xl">Bowl · ध्वनि</h2>
      <p className="text-dim mt-1 text-center text-sm">
        Singing Bowl therapy. Drag your cursor or finger circularly along the gold rim of the bowl to build resonant sound waves.
      </p>

      <div className="relative my-8 flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="h-full w-full touch-none select-none rounded-full"
          style={{ cursor: "pointer" }}
        />

        {/* Ambient Prompt inside the bowl when not singing */}
        {rubbingIntensity < 0.05 && (
          <p className="pointer-events-none absolute bottom-1/4 text-center text-[10px] tracking-widest text-white/20 uppercase">
            rub the rim
          </p>
        )}
      </div>

      {/* Visual audio visualizer bar */}
      <div className="w-48 rounded-full bg-white/5 p-1 border border-white/10">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-[var(--color-marigold)] to-[var(--color-saffron)] transition-all duration-75"
          style={{ width: `${rubbingIntensity * 100}%` }}
        />
      </div>

      <p className="text-dim mt-4 text-center text-xs">
        Move in steady circles to sustain the sound. Feel the vibration settle your breathing.
      </p>
    </div>
  );
}
