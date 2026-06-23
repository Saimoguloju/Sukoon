"use client";

import { useEffect, useState } from "react";
import { getEngine, type SoundId } from "@/lib/audio";

const SOUNDS: { id: SoundId; label: string; hi: string; icon: string }[] = [
  { id: "rain", label: "Monsoon", hi: "बारिश", icon: "🌧" },
  { id: "river", label: "Ganga", hi: "नदी", icon: "🌊" },
  { id: "birds", label: "Dawn birds", hi: "पक्षी", icon: "🐦" },
  { id: "temple", label: "Temple bells", hi: "मंदिर", icon: "🔔" },
  { id: "tanpura", label: "Tanpura", hi: "तानपुरा", icon: "🎶" },
  { id: "wind", label: "Himalayan wind", hi: "हवा", icon: "🍃" },
  { id: "night", label: "Crickets", hi: "रात", icon: "🌙" },
];

const PRESETS: { name: string; mix: Partial<Record<SoundId, number>> }[] = [
  { name: "Monsoon evening", mix: { rain: 0.7, wind: 0.25 } },
  { name: "Ganga aarti", mix: { temple: 0.7, river: 0.4, tanpura: 0.3 } },
  { name: "Morning sadhana", mix: { tanpura: 0.5, birds: 0.5 } },
  { name: "Himalayan night", mix: { wind: 0.5, night: 0.5, tanpura: 0.25 } },
];

export default function Soundscape() {
  const [vols, setVols] = useState<Record<SoundId, number>>({
    rain: 0,
    river: 0,
    birds: 0,
    temple: 0,
    tanpura: 0,
    wind: 0,
    night: 0,
  });

  const set = (id: SoundId, v: number) => {
    setVols((prev) => ({ ...prev, [id]: v }));
    getEngine().setVolume(id, v);
  };

  const applyPreset = (mix: Partial<Record<SoundId, number>>) => {
    SOUNDS.forEach(({ id }) => set(id, mix[id] ?? 0));
  };

  const stopAll = () => {
    SOUNDS.forEach(({ id }) => set(id, 0));
  };

  // clean up audio when leaving
  useEffect(() => {
    return () => {
      getEngine().stopAll();
    };
  }, []);

  const anyOn = Object.values(vols).some((v) => v > 0);

  return (
    <div className="mx-auto w-full max-w-3xl py-6">
      <h2 className="font-display text-2xl">Naad · नाद</h2>
      <p className="text-dim mt-1 text-sm">
        Layer the sounds of India into your own calm world — every note is
        generated live in your browser.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => applyPreset(p.mix)}
            className="glass rounded-full px-3 py-1.5 text-xs text-dim transition hover:text-white"
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={stopAll}
          disabled={!anyOn}
          className="rounded-full px-3 py-1.5 text-xs text-dim transition enabled:hover:text-white disabled:opacity-30"
        >
          ✕ silence
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {SOUNDS.map((s) => {
          const v = vols[s.id];
          const on = v > 0;
          return (
            <div
              key={s.id}
              className={`glass rounded-2xl p-4 transition ${
                on ? "ring-1 ring-[var(--color-sakura)]/50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="font-medium">{s.label}</p>
                    <p className="text-dim text-xs">{s.hi}</p>
                  </div>
                </div>
                <button
                  onClick={() => set(s.id, on ? 0 : 0.6)}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    on
                      ? "bg-[var(--color-sakura)]/30 text-white"
                      : "bg-white/10 text-dim"
                  }`}
                >
                  {on ? "on" : "off"}
                </button>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={v}
                onChange={(e) => set(s.id, parseFloat(e.target.value))}
                className="mt-3 w-full accent-[var(--color-sakura)]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
