"use client";

import { useMemo, useState } from "react";
import { getEngine } from "@/lib/audio";

const COLS = 9;
const ROWS = 11;
const TOTAL = COLS * ROWS;

export default function BubblePop() {
  const [popped, setPopped] = useState<Set<number>>(new Set());
  const [count, setCount] = useState(0);
  const tints = useMemo(
    () =>
      Array.from({ length: TOTAL }, () =>
        ["#f0a13a", "#e8413a", "#1fb6b6", "#e0399b", "#ffd23f"][
          Math.floor(Math.random() * 5)
        ],
      ),
    [],
  );

  const pop = (i: number) => {
    if (popped.has(i)) return;
    getEngine().pop();
    setPopped((prev) => {
      const next = new Set(prev);
      next.add(i);
      return next;
    });
    setCount((c) => c + 1);
  };

  const refill = () => setPopped(new Set());
  const allPopped = popped.size === TOTAL;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center py-6">
      <h2 className="font-display text-2xl">Pop · टप</h2>
      <p className="text-dim mt-1 text-center text-sm">
        Endless bubble wrap. A tiny tactile release — pop one, pop a hundred.
      </p>

      <div className="text-dim mt-3 text-sm">
        popped: <span className="text-white tabular-nums">{count}</span>
      </div>

      <div
        className="mt-4 grid w-full gap-1.5 rounded-3xl border border-white/10 bg-white/5 p-3"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}
      >
        {Array.from({ length: TOTAL }).map((_, i) => {
          const isPopped = popped.has(i);
          return (
            <button
              key={i}
              onPointerEnter={(e) => {
                // pop on drag-over (mouse held)
                if (e.buttons === 1) pop(i);
              }}
              onPointerDown={() => pop(i)}
              aria-label="bubble"
              className="aspect-square rounded-full transition-transform active:scale-90"
              style={
                isPopped
                  ? {
                      background: "rgba(0,0,0,0.18)",
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
                      transform: "scale(0.78)",
                    }
                  : {
                      background: `radial-gradient(circle at 32% 28%, #ffffffcc, ${tints[i]} 70%)`,
                      boxShadow:
                        "0 2px 5px rgba(0,0,0,0.25), inset 0 -2px 4px rgba(0,0,0,0.2)",
                    }
              }
            />
          );
        })}
      </div>

      {allPopped && (
        <p className="font-display animate-fade-up mt-4 text-center text-lg">
          All popped. Feeling lighter? 🫧
        </p>
      )}

      <button
        onClick={refill}
        className="mt-5 rounded-full bg-white/15 px-6 py-2.5 text-sm font-medium transition hover:bg-white/25"
      >
        fresh sheet
      </button>
    </div>
  );
}
