"use client";

import { useEffect, useState } from "react";

type Petal = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
};

// Gentle marigold petals drifting across the background. Generated only on the
// client (after mount) so the random positions never cause a hydration
// mismatch with the server-rendered HTML.
export default function Petals() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    setPetals(
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 18,
        duration: 16 + Math.random() * 16,
        size: 10 + Math.random() * 14,
        drift: 30 + Math.random() * 50,
      })),
    );
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animation: `fall-${p.id % 3} ${p.duration}s linear ${p.delay}s infinite`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        >
          ❀
        </span>
      ))}
      <style>{`
        @keyframes fall-0 {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(360deg); opacity: 0; }
        }
        @keyframes fall-1 {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(110vh) translateX(calc(var(--drift) * -1)) rotate(-300deg); opacity: 0; }
        }
        @keyframes fall-2 {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.45; }
          90% { opacity: 0.45; }
          100% { transform: translateY(110vh) translateX(calc(var(--drift) * 0.5)) rotate(200deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
