"use client";

import { useEffect, useState } from "react";

type Entry = { t: number; mood: number; note: string };
const KEY = "yutori.moods";

const MOODS = [
  { v: 1, face: "😞", label: "Heavy", color: "#7d5a8c" },
  { v: 2, face: "😕", label: "Low", color: "#5a8ca0" },
  { v: 3, face: "😐", label: "Okay", color: "#1fb6b6" },
  { v: 4, face: "🙂", label: "Good", color: "#e6c34a" },
  { v: 5, face: "😌", label: "Calm", color: "#f0a13a" },
];

function load(): Entry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export default function MoodCheck() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => setEntries(load()), []);

  const save = () => {
    if (picked == null) return;
    const next = [{ t: Date.now(), mood: picked, note: note.trim() }, ...entries].slice(
      0,
      30,
    );
    setEntries(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setPicked(null);
    setNote("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const avg =
    entries.length > 0
      ? entries.slice(0, 7).reduce((s, e) => s + e.mood, 0) /
        Math.min(entries.length, 7)
      : 0;

  return (
    <div className="mx-auto w-full max-w-xl py-6">
      <h2 className="font-display text-2xl">Check-in · मन</h2>
      <p className="text-dim mt-1 text-sm">
        A small daily ritual. Notice how you feel, no judgement. Saved privately
        on this device.
      </p>

      <div className="glass mt-5 rounded-2xl p-5">
        <p className="mb-3 text-sm">How are you right now?</p>
        <div className="flex justify-between gap-2">
          {MOODS.map((m) => (
            <button
              key={m.v}
              onClick={() => setPicked(m.v)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-3 transition ${
                picked === m.v ? "bg-white/15 scale-105" : "hover:bg-white/5"
              }`}
              style={picked === m.v ? { boxShadow: `0 0 0 1px ${m.color}` } : {}}
            >
              <span className="text-3xl">{m.face}</span>
              <span className="text-dim text-xs">{m.label}</span>
            </button>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="A word about today (optional)…"
          rows={2}
          className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-[var(--color-sakura)]/50"
        />

        <button
          onClick={save}
          disabled={picked == null}
          className="mt-3 w-full rounded-xl bg-white/15 py-2.5 text-sm font-medium transition enabled:hover:bg-white/25 disabled:opacity-30"
        >
          {saved ? "Saved 🌸" : "Save check-in"}
        </button>
      </div>

      {entries.length > 0 && (
        <>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-dim text-sm tracking-wide uppercase">
              Recent mood
            </p>
            <p className="text-dim text-xs">
              7-day average{" "}
              <span className="text-white">
                {avg.toFixed(1)}
                <span className="text-dim">/5</span>
              </span>
            </p>
          </div>

          {/* sparkline-ish strip of recent moods */}
          <div className="mt-3 flex items-end gap-1.5">
            {entries
              .slice(0, 14)
              .reverse()
              .map((e, i) => {
                const m = MOODS.find((x) => x.v === e.mood)!;
                return (
                  <div
                    key={i}
                    title={new Date(e.t).toLocaleString()}
                    className="flex-1 rounded-t-md"
                    style={{
                      height: `${e.mood * 14 + 8}px`,
                      background: m.color,
                      opacity: 0.85,
                    }}
                  />
                );
              })}
          </div>

          <ul className="mt-5 space-y-2">
            {entries.slice(0, 6).map((e, i) => {
              const m = MOODS.find((x) => x.v === e.mood)!;
              return (
                <li
                  key={i}
                  className="glass flex items-center gap-3 rounded-xl px-3 py-2"
                >
                  <span className="text-xl">{m.face}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      {e.note || <span className="text-dim">no note</span>}
                    </p>
                    <p className="text-dim text-xs">
                      {new Date(e.t).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
