"use client";

import { useMemo, useState } from "react";
import { modules, quotes, quoteOfNow, type ModuleId } from "@/lib/content";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return { en: "Still awake?", hi: "नमस्ते" };
  if (h < 11) return { en: "Good morning", hi: "सुप्रभात" };
  if (h < 17) return { en: "Good afternoon", hi: "नमस्ते" };
  if (h < 21) return { en: "Good evening", hi: "शुभ संध्या" };
  return { en: "Time to rest", hi: "शुभ रात्रि" };
}

// a warm Indian accent per card, cycled by position
const ACCENTS = [
  "#f0a13a",
  "#e8413a",
  "#1fb6b6",
  "#e6c34a",
  "#e0399b",
  "#7b6cf6",
  "#7bc043",
  "#e2571e",
];

export default function Home({ onPick }: { onPick: (id: ModuleId) => void }) {
  const g = greeting();
  const cards = useMemo(() => modules.filter((m) => m.id !== "home"), []);
  const [quote, setQuote] = useState(quoteOfNow);

  const shuffleQuote = () => {
    let next = quote;
    while (next === quote) next = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(next);
  };

  return (
    <div className="mx-auto w-full max-w-4xl py-6">
      <p className="text-dim font-display text-base">{g.hi}</p>
      <h1 className="font-display mt-1 text-3xl leading-tight sm:text-4xl">
        {g.en}. Lijiye ek gehri saans.
      </h1>

      <blockquote className="glass card-sheen group mt-6 rounded-2xl px-5 py-4">
        <p className="font-display text-lg italic leading-relaxed">
          &ldquo;{quote.text}&rdquo;
        </p>
        <footer className="mt-2 flex items-center justify-between">
          <span className="text-dim text-sm">— {quote.source}</span>
          <button
            onClick={shuffleQuote}
            title="Another reflection"
            className="press text-dim rounded-full px-2 py-1 text-xs transition hover:text-white"
          >
            ↻ another
          </button>
        </footer>
      </blockquote>

      <p className="text-dim mt-8 mb-3 text-sm tracking-wide uppercase">
        Choose a moment
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((m, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <button
              key={m.id}
              onClick={() => onPick(m.id)}
              style={{ animationDelay: `${i * 45}ms` }}
              className="card-sheen press animate-pop-in glass group relative flex flex-col items-start overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* accent glow on hover */}
              <span
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: `inset 0 0 0 1px ${accent}66, 0 12px 32px -12px ${accent}88`,
                }}
              />
              {/* big faint emoji watermark */}
              <span className="pointer-events-none absolute -right-2 -bottom-3 text-6xl opacity-[0.06] transition-all duration-300 group-hover:scale-110 group-hover:opacity-[0.14]">
                {m.icon}
              </span>

              <span
                className="relative text-3xl transition-transform duration-300 group-hover:scale-110"
                style={{ color: accent }}
              >
                {m.glyph}
              </span>
              <span className="relative mt-2 font-medium">{m.label}</span>
              <span className="text-dim relative mt-0.5 text-xs leading-snug">
                {m.blurb}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-dim mt-8 text-center text-xs">
        Rooted in Indian calm — सुकून (sukoon): a quiet, settled peace of mind.
      </p>
    </div>
  );
}
