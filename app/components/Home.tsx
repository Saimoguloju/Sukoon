"use client";

import { modules, quoteOfNow, type ModuleId } from "@/lib/content";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return { en: "Still awake?", hi: "नमस्ते" };
  if (h < 11) return { en: "Good morning", hi: "सुप्रभात" };
  if (h < 17) return { en: "Good afternoon", hi: "नमस्ते" };
  if (h < 21) return { en: "Good evening", hi: "शुभ संध्या" };
  return { en: "Time to rest", hi: "शुभ रात्रि" };
}

export default function Home({ onPick }: { onPick: (id: ModuleId) => void }) {
  const g = greeting();
  const q = quoteOfNow();
  const cards = modules.filter((m) => m.id !== "home");

  return (
    <div className="mx-auto w-full max-w-4xl py-6">
      <p className="text-dim font-display text-base">{g.hi}</p>
      <h1 className="font-display mt-1 text-3xl leading-tight sm:text-4xl">
        {g.en}. Lijiye ek gehri saans.
      </h1>

      <blockquote className="glass mt-6 rounded-2xl px-5 py-4">
        <p className="font-display text-lg italic leading-relaxed">
          &ldquo;{q.text}&rdquo;
        </p>
        <footer className="text-dim mt-2 text-sm">— {q.source}</footer>
      </blockquote>

      <p className="text-dim mt-8 mb-3 text-sm tracking-wide uppercase">
        Choose a moment
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((m) => (
          <button
            key={m.id}
            onClick={() => onPick(m.id)}
            className="glass group flex flex-col items-start rounded-2xl p-4 text-left transition-all hover:-translate-y-1 hover:bg-white/10"
          >
            <span className="text-3xl text-[var(--color-marigold)] transition-transform group-hover:scale-110">
              {m.glyph}
            </span>
            <span className="mt-2 font-medium">{m.label}</span>
            <span className="text-dim mt-0.5 text-xs leading-snug">
              {m.blurb}
            </span>
          </button>
        ))}
      </div>

      <p className="text-dim mt-8 text-center text-xs">
        Rooted in Indian calm — सुकून (sukoon): a quiet, settled peace of mind.
      </p>
    </div>
  );
}
