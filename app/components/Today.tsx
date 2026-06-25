"use client";

import { useEffect, useState } from "react";
import { getEngine } from "@/lib/audio";
import { getStreak, isDoneToday, markToday, type Streak } from "@/lib/streak";
import { useI18n } from "@/lib/i18n";

const GRATITUDE_KEY = "sukoon.gratitude";

export default function Today() {
  const { t } = useI18n();
  const [streak, setStreak] = useState<Streak>({ last: "", count: 0, best: 0 });
  const [done, setDone] = useState(false);
  const [step, setStep] = useState(0); // 0 breath · 1 gratitude · 2 finished
  const [breathPhase, setBreathPhase] = useState<"in" | "hold" | "out">("in");
  const [gratitude, setGratitude] = useState("");

  useEffect(() => {
    setStreak(getStreak());
    setDone(isDoneToday());
  }, []);

  // simple guided breath while on step 0
  useEffect(() => {
    if (step !== 0 || done) return;
    const seq: ("in" | "hold" | "out")[] = ["in", "hold", "out"];
    let i = 0;
    setBreathPhase("in");
    getEngine().bell(136.1 * 2);
    const id = setInterval(() => {
      i = (i + 1) % seq.length;
      setBreathPhase(seq[i]);
      if (seq[i] === "in") getEngine().bell(136.1 * 2);
    }, 4000);
    return () => clearInterval(id);
  }, [step, done]);

  const finish = () => {
    const g = gratitude.trim();
    if (g) {
      try {
        const prev = JSON.parse(localStorage.getItem(GRATITUDE_KEY) || "[]");
        localStorage.setItem(
          GRATITUDE_KEY,
          JSON.stringify([{ t: Date.now(), text: g }, ...prev].slice(0, 60)),
        );
      } catch {
        /* ignore */
      }
    }
    const next = markToday();
    setStreak(next);
    setDone(true);
    setStep(2);
    getEngine().bell(272.2);
  };

  const Flame = (
    <div className="glass flex items-center justify-center gap-5 rounded-2xl px-5 py-4">
      <div className="text-center">
        <p className="text-3xl">🔥</p>
      </div>
      <div>
        <p className="text-2xl font-semibold">
          {streak.count}{" "}
          <span className="text-dim text-sm font-normal">{t("streak.label")}</span>
        </p>
        <p className="text-dim text-xs">
          {t("streak.best")}: {streak.best}
        </p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col py-6">
      <h2 className="font-display text-2xl">{t("ritual.title")} · आज</h2>
      <p className="text-dim mt-1 text-sm">{t("ritual.subtitle")}</p>

      <div className="mt-5">{Flame}</div>

      {done ? (
        <div className="glass animate-fade-up mt-5 rounded-2xl px-5 py-8 text-center">
          <p className="font-display text-xl">{t("ritual.doneToday")}</p>
          <p className="text-dim mt-2 text-sm">{t("ritual.comeBack")}</p>
        </div>
      ) : (
        <div className="glass mt-5 rounded-2xl p-6">
          {/* stepper dots */}
          <div className="mb-5 flex justify-center gap-2">
            {[0, 1].map((s) => (
              <span
                key={s}
                className={`h-1.5 w-8 rounded-full transition ${
                  step >= s ? "bg-[var(--color-marigold)]" : "bg-white/15"
                }`}
              />
            ))}
          </div>

          {step === 0 && (
            <div className="flex flex-col items-center">
              <p className="mb-6 text-sm">{t("ritual.step.breath")}</p>
              <div className="relative flex h-48 w-48 items-center justify-center">
                <div
                  className="absolute rounded-full bg-gradient-to-br from-[var(--color-sakura)]/70 to-[var(--color-indigo)]/70 blur-[2px]"
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: `scale(${breathPhase === "out" ? 0.5 : 1})`,
                    transition: "transform 4s cubic-bezier(0.4,0,0.2,1)",
                  }}
                />
                <p className="font-display relative z-10 text-lg">
                  {breathPhase === "in"
                    ? "Breathe in"
                    : breathPhase === "hold"
                      ? "Hold"
                      : "Breathe out"}
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="press mt-7 rounded-full bg-white/15 px-7 py-2.5 text-sm font-medium transition hover:bg-white/25"
              >
                {t("ritual.next")} →
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col items-center">
              <p className="mb-4 text-center text-sm">
                {t("ritual.step.gratitude")}
              </p>
              <textarea
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder={t("ritual.gratitudePlaceholder")}
                rows={3}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none placeholder:text-white/30 focus:border-[var(--color-sakura)]/50"
              />
              <button
                onClick={finish}
                className="press mt-5 rounded-full bg-[var(--color-marigold)]/30 px-7 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-marigold)]/45"
              >
                ✓ {t("ritual.finish")}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-up flex flex-col items-center py-4 text-center">
              <p className="font-display text-xl">{t("ritual.doneToday")}</p>
              <p className="text-dim mt-2 text-sm">{t("ritual.comeBack")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
