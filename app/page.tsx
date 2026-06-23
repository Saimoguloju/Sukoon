"use client";

import { useEffect, useState } from "react";
import { modules, type ModuleId } from "@/lib/content";
import Petals from "./components/Petals";
import Home from "./components/Home";
import Breathe from "./components/Breathe";
import Trataka from "./components/Trataka";
import Soundscape from "./components/Soundscape";
import Rangoli from "./components/Rangoli";
import Smoke from "./components/Smoke";
import BubblePop from "./components/BubblePop";
import MoodCheck from "./components/MoodCheck";

function Clock() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums text-dim text-sm">{now}</span>;
}

export default function Page() {
  const [view, setView] = useState<ModuleId>("home");

  const render = () => {
    switch (view) {
      case "home":
        return <Home onPick={setView} />;
      case "breathe":
        return <Breathe />;
      case "trataka":
        return <Trataka />;
      case "sounds":
        return <Soundscape />;
      case "rangoli":
        return <Rangoli />;
      case "smoke":
        return <Smoke />;
      case "pop":
        return <BubblePop />;
      case "mood":
        return <MoodCheck />;
    }
  };

  return (
    <div className="grain relative flex min-h-dvh flex-col">
      <Petals />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <button
          onClick={() => setView("home")}
          className="group flex items-center gap-2.5 text-left"
        >
          <span className="text-2xl text-[var(--color-marigold)] transition-transform group-hover:scale-110">
            ॐ
          </span>
          <span className="leading-tight">
            <span className="font-display block text-lg">Sukoon</span>
            <span className="text-dim block text-[10px] tracking-[0.25em] uppercase">
              thoda sukoon, har din
            </span>
          </span>
        </button>
        <Clock />
      </header>

      <main className="relative z-10 flex flex-1 items-stretch px-4 pb-28 sm:px-8">
        <div key={view} className="animate-fade-up flex w-full">
          {render()}
        </div>
      </main>

      {/* Navigation dock */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-4">
        <div className="glass flex max-w-full gap-1 overflow-x-auto rounded-2xl p-1.5 shadow-2xl">
          {modules.map((m) => {
            const active = m.id === view;
            return (
              <button
                key={m.id}
                onClick={() => setView(m.id)}
                title={m.blurb}
                className={`flex min-w-16 flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs transition-all ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-dim hover:bg-white/5 hover:text-white"
                }`}
              >
                <span
                  className={`text-base ${
                    active ? "text-[var(--color-marigold)]" : ""
                  }`}
                >
                  {m.glyph}
                </span>
                <span className="whitespace-nowrap">{m.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
