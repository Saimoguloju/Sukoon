"use client";

import { useState, useEffect } from "react";
import { getEngine } from "@/lib/audio";

const MANTRAS = [
  { name: "Silent", text: "" },
  { name: "Om", text: "ॐ" },
  { name: "Om Namah Shivaya", text: "ॐ नमः शिवाय" },
  { name: "Lokah Samastah", text: "लोकाः समस्ताः सुखिनो भवन्तु" },
  { name: "Hare Krishna", text: "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे" },
];

export default function Mala() {
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [mantraIdx, setMantraIdx] = useState(1); // Default to "Om"
  const [customMantra, setCustomMantra] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const activeMantra = showCustom
    ? customMantra
    : MANTRAS[mantraIdx]?.text || "";

  const advance = () => {
    getEngine().bead();
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
    setIndex((prev) => {
      const next = prev + 1;
      if (next >= 108) {
        // Play completion sound when a full mala is finished
        getEngine().bell(272.2);
        setCompleted((c) => c + 1);
        return 0;
      }
      return next;
    });
  };

  const reset = () => {
    setIndex(0);
    setCompleted(0);
  };

  // Generate SVG coordinates for 108 beads along a circle
  const R = 110;
  const cx = 140;
  const cy = 140;
  const beads = Array.from({ length: 108 }).map((_, i) => {
    const angle = (i / 108) * Math.PI * 2 - Math.PI / 2;
    const x = cx + R * Math.cos(angle);
    const y = cy + R * Math.sin(angle);
    return { x, y, index: i };
  });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center py-6">
      <h2 className="font-display text-2xl">Mala · जाप</h2>
      <p className="text-dim mt-1 text-center text-sm">
        Rhythmic chanting and breathing counter. Press the center or advance bead by bead.
      </p>

      {/* Mantra selector */}
      <div className="mt-4 flex flex-wrap justify-center gap-1.5 px-4">
        {MANTRAS.map((m, idx) => (
          <button
            key={m.name}
            onClick={() => {
              setMantraIdx(idx);
              setShowCustom(false);
            }}
            className={`rounded-full px-3 py-1.5 text-xs transition ${
              !showCustom && idx === mantraIdx
                ? "bg-[var(--color-marigold)]/30 text-white"
                : "glass text-dim hover:text-white"
            }`}
          >
            {m.name}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(true)}
          className={`rounded-full px-3 py-1.5 text-xs transition ${
            showCustom
              ? "bg-[var(--color-marigold)]/30 text-white"
              : "glass text-dim hover:text-white"
          }`}
        >
          Custom
        </button>
      </div>

      {showCustom && (
        <input
          type="text"
          value={customMantra}
          onChange={(e) => setCustomMantra(e.target.value)}
          placeholder="Type your mantra..."
          maxLength={40}
          className="mt-3 w-64 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-center text-sm outline-none placeholder:text-white/20 focus:border-[var(--color-marigold)]/50"
        />
      )}

      {/* Main Mala Loop */}
      <div className="relative my-8 flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
        <svg
          viewBox="0 0 280 280"
          className="absolute inset-0 h-full w-full select-none"
        >
          {/* Tassel on Guru bead at the top */}
          <line
            x1={cx}
            y1={cy - R}
            x2={cx}
            y2={cy - R - 18}
            stroke="var(--color-saffron)"
            strokeWidth="3"
          />
          <path
            d={`M ${cx - 5} ${cy - R - 18} Q ${cx} ${cy - R - 24} ${cx + 5} ${
              cy - R - 18
            } Z`}
            fill="var(--color-saffron)"
          />
          {/* Tassel threads */}
          <path
            d={`M ${cx - 3} ${cy - R - 18} L ${cx - 6} ${cy - R - 32} M ${cx} ${
              cy - R - 18
            } L ${cx} ${cy - R - 34} M ${cx + 3} ${cy - R - 18} L ${cx + 6} ${
              cy - R - 32
            }`}
            stroke="var(--color-saffron)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {beads.map((b) => {
            const isCurrent = b.index === index;
            const isCompleted = b.index < index;
            const isGuru = b.index === 0;

            let size = isGuru ? 6.5 : 3.5;
            if (isCurrent) size = isGuru ? 8.5 : 5.5;

            let fill = "rgba(255, 255, 255, 0.15)";
            let stroke = "none";
            let shadow = "none";

            if (isGuru) {
              fill = "var(--color-saffron)";
            } else if (isCurrent) {
              fill = "var(--color-marigold)";
              stroke = "rgba(255, 255, 255, 0.8)";
            } else if (isCompleted) {
              fill = "rgba(240, 161, 58, 0.65)";
            }

            return (
              <circle
                key={b.index}
                cx={b.x}
                cy={b.y}
                r={size}
                fill={fill}
                stroke={stroke}
                strokeWidth={isCurrent ? 1 : 0}
                style={{
                  transition: "all 0.1s ease-out",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (b.index === (index + 1) % 108 || b.index === index) {
                    advance();
                  }
                }}
              />
            );
          })}
        </svg>

        {/* Central button & Mantra display */}
        <button
          onClick={advance}
          className="glass absolute flex h-40 w-40 flex-col items-center justify-center rounded-full text-center transition-transform active:scale-95"
          style={{
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.05)",
          }}
        >
          {activeMantra ? (
            <p className="font-display max-w-[130px] overflow-hidden text-ellipsis text-base leading-relaxed text-white">
              {activeMantra}
            </p>
          ) : (
            <span className="text-dim text-xs">Tap to count</span>
          )}
          <span className="font-display text-dim mt-2 text-xs">
            {index === 0 ? "Guru Bead" : `${index}/108`}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-dim text-sm">
          Completed:{" "}
          <span className="text-white font-semibold">{completed}</span>
        </div>
        <button
          onClick={reset}
          className="rounded-full bg-white/10 px-5 py-2 text-xs text-dim transition hover:bg-white/20 hover:text-white"
        >
          Reset count
        </button>
      </div>
    </div>
  );
}
