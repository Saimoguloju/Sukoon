"use client";

import { useEffect, useRef, useState } from "react";
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
import Mala from "./components/Mala";
import Bowl from "./components/Bowl";
import Kintsugi from "./components/Kintsugi";
import SpaceOut from "./components/SpaceOut";
import Archery from "./components/Archery";
import CarRace from "./components/CarRace";

// A soft radial light that follows the cursor (desktop only). Updated through a
// ref so pointer movement never triggers React re-renders.
function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      raf = 0;
      const el = ref.current;
      if (el) el.style.transform = `translate(${x}px, ${y}px)`;
    };
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} aria-hidden className="cursor-glow hidden md:block" />;
}

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
  const half = Math.ceil(modules.length / 2);

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
      case "mala":
        return <Mala />;
      case "bowl":
        return <Bowl />;
      case "kintsugi":
        return <Kintsugi />;
      case "mung":
        return <SpaceOut />;
      case "archery":
        return <Archery />;
      case "race":
        return <CarRace />;
      case "mood":
        return <MoodCheck />;
    }
  };

  return (
    <div className="grain relative flex min-h-dvh flex-col">
      <Petals />
      <CursorGlow />

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

      <main className="relative z-10 flex flex-1 items-stretch px-16 pb-10 sm:px-20">
        <div key={view} className="animate-fade-up flex w-full">
          {render()}
        </div>
      </main>

      {/* Navigation rails — split half on the left, half on the right */}
      {(
        [
          { side: "left" as const, items: modules.slice(0, half) },
          { side: "right" as const, items: modules.slice(half) },
        ]
      ).map(({ side, items }) => (
        <nav
          key={side}
          className={`fixed top-1/2 z-20 -translate-y-1/2 ${
            side === "left" ? "left-0 pl-2 sm:pl-3" : "right-0 pr-2 sm:pr-3"
          }`}
        >
          <div className="glass flex max-h-[88dvh] flex-col gap-1 overflow-y-auto rounded-2xl p-1.5 shadow-2xl">
            {items.map((m) => {
              const active = m.id === view;
              return (
                <button
                  key={m.id}
                  onClick={() => setView(m.id)}
                  title={m.blurb}
                  className={`press group relative flex w-12 flex-col items-center gap-0.5 rounded-lg px-1.5 py-1.5 text-[10px] transition-all duration-200 ${
                    active
                      ? "scale-105 bg-white/15 text-white shadow-[0_0_18px_rgba(240,161,58,0.25)]"
                      : "text-dim hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {active && (
                    <span
                      className={`absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-[var(--color-marigold)] ${
                        side === "left" ? "right-0" : "left-0"
                      }`}
                    />
                  )}
                  <span
                    className={`text-xs transition-transform duration-200 group-hover:scale-125 ${
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
      ))}
    </div>
  );
}
