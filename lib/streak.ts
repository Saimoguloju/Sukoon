// Daily-streak bookkeeping, stored entirely in localStorage. A streak counts
// consecutive days the user completed their ritual; it resets if a day is missed.

export type Streak = { last: string; count: number; best: number };

const KEY = "sukoon.streak";
const EMPTY: Streak = { last: "", count: 0, best: 0 };

function dayStr(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function getStreak(): Streak {
  if (typeof window === "undefined") return EMPTY;
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "");
    if (s && typeof s.count === "number") return s as Streak;
  } catch {
    /* ignore */
  }
  return EMPTY;
}

export function isDoneToday(): boolean {
  return getStreak().last === dayStr();
}

// Marks today complete and returns the updated streak (idempotent per day).
export function markToday(): Streak {
  const s = getStreak();
  const today = dayStr();
  if (s.last === today) return s;
  const yesterday = dayStr(new Date(Date.now() - 86_400_000));
  const count = s.last === yesterday ? s.count + 1 : 1;
  const next: Streak = { last: today, count, best: Math.max(s.best, count) };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
