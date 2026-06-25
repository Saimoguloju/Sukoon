"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getEngine } from "@/lib/audio";

// Retro Race (रेस) — a quick lane-dodge through 1960s–70s Indian traffic. You
// drive a cream Hindustan Ambassador; weave past Premier Padmini taxis and other
// vintage motors. The longer you survive, the faster the road comes at you.

const KEY = "sukoon.race.best";
const LANES = 3;

// vintage two-tone paint jobs for oncoming cars
const PAINT = [
  { body: "#f4c430", roof: "#1c1c1c" }, // Padmini taxi (yellow/black)
  { body: "#8a3b32", roof: "#e8dcc4" }, // maroon + cream
  { body: "#2f6e6a", roof: "#d8d0bc" }, // teal
  { body: "#cdbfa3", roof: "#5a4632" }, // sand
  { body: "#3a4a7a", roof: "#cfd6e6" }, // indigo
];

type Obstacle = { lane: number; y: number; paint: number; w: number; h: number };

export default function CarRace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dprRef = useRef(1);

  const running = useRef(false);
  const obstacles = useRef<Obstacle[]>([]);
  const playerLane = useRef(1);
  const playerX = useRef(0); // smoothed pixel x (center)
  const speed = useRef(0);
  const dist = useRef(0);
  const roadOffset = useRef(0);
  const spawnTimer = useRef(0);

  const [state, setState] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const b = Number(localStorage.getItem(KEY) || 0);
    if (!Number.isNaN(b)) setBest(b);
  }, []);

  const laneCenter = useCallback((lane: number, w: number) => {
    const roadW = w * 0.84;
    const roadLeft = (w - roadW) / 2;
    const laneW = roadW / LANES;
    return roadLeft + laneW * (lane + 0.5);
  }, []);

  const begin = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    obstacles.current = [];
    playerLane.current = 1;
    playerX.current = laneCenter(1, canvas.width);
    speed.current = 4 * dprRef.current;
    dist.current = 0;
    roadOffset.current = 0;
    spawnTimer.current = 0;
    running.current = true;
    setScore(0);
    setState("playing");
  }, [laneCenter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      playerX.current = laneCenter(playerLane.current, canvas.width);
    };
    resize();
    window.addEventListener("resize", resize);

    const drawCar = (
      x: number,
      y: number,
      w: number,
      h: number,
      body: string,
      roof: string,
    ) => {
      const r = 6 * dprRef.current;
      // body
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y - h / 2, w, h, r);
      ctx.fill();
      // roof / cabin (rounded retro shape)
      ctx.fillStyle = roof;
      ctx.beginPath();
      ctx.roundRect(x - w * 0.36, y - h * 0.28, w * 0.72, h * 0.42, r * 0.8);
      ctx.fill();
      // windscreen
      ctx.fillStyle = "rgba(180,220,235,0.55)";
      ctx.beginPath();
      ctx.roundRect(x - w * 0.3, y - h * 0.22, w * 0.6, h * 0.16, 3);
      ctx.fill();
      // headlights / chrome
      ctx.fillStyle = "rgba(255,240,200,0.9)";
      ctx.fillRect(x - w * 0.4, y - h / 2 + 2 * dprRef.current, w * 0.16, 3 * dprRef.current);
      ctx.fillRect(x + w * 0.24, y - h / 2 + 2 * dprRef.current, w * 0.16, 3 * dprRef.current);
      // wheels
      ctx.fillStyle = "#111";
      const ww = w * 0.16;
      const wh = h * 0.2;
      ctx.fillRect(x - w / 2 - ww * 0.4, y - h * 0.28, ww, wh);
      ctx.fillRect(x + w / 2 - ww * 0.6, y - h * 0.28, ww, wh);
      ctx.fillRect(x - w / 2 - ww * 0.4, y + h * 0.08, ww, wh);
      ctx.fillRect(x + w / 2 - ww * 0.6, y + h * 0.08, ww, wh);
    };

    let raf = 0;
    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const dprn = dprRef.current;
      const roadW = w * 0.84;
      const roadLeft = (w - roadW) / 2;
      const laneW = roadW / LANES;
      const carW = laneW * 0.56;
      const carH = carW * 1.7;
      const playerY = h - carH * 0.9;

      // background grass
      ctx.fillStyle = "#243018";
      ctx.fillRect(0, 0, w, h);
      // road
      ctx.fillStyle = "#2b2b30";
      ctx.fillRect(roadLeft, 0, roadW, h);
      // curbs
      ctx.fillStyle = "#b5483c";
      ctx.fillRect(roadLeft - 6 * dprn, 0, 6 * dprn, h);
      ctx.fillRect(roadLeft + roadW, 0, 6 * dprn, h);

      // lane dashes (scrolling)
      if (running.current) roadOffset.current += speed.current;
      ctx.fillStyle = "rgba(240,220,160,0.7)";
      const dashH = 34 * dprn;
      const gap = 30 * dprn;
      for (let l = 1; l < LANES; l++) {
        const lx = roadLeft + laneW * l;
        for (
          let y = (roadOffset.current % (dashH + gap)) - dashH;
          y < h;
          y += dashH + gap
        ) {
          ctx.fillRect(lx - 2 * dprn, y, 4 * dprn, dashH);
        }
      }

      if (running.current) {
        // difficulty ramps with distance
        dist.current += speed.current;
        speed.current = Math.min(4 * dprn + dist.current / (2200 * dprn), 22 * dprn);

        // spawn obstacles
        spawnTimer.current -= 1;
        if (spawnTimer.current <= 0) {
          const lane = Math.floor(Math.random() * LANES);
          obstacles.current.push({
            lane,
            y: -carH,
            paint: Math.floor(Math.random() * PAINT.length),
            w: carW,
            h: carH,
          });
          spawnTimer.current = Math.max(26, 70 - dist.current / (900 * dprn));
        }

        // smooth steering toward target lane
        const targetX = laneCenter(playerLane.current, w);
        playerX.current += (targetX - playerX.current) * 0.2;

        // move + collide
        const pLeft = playerX.current - carW / 2;
        const pRight = playerX.current + carW / 2;
        for (let i = obstacles.current.length - 1; i >= 0; i--) {
          const o = obstacles.current[i];
          o.y += speed.current;
          const ox = laneCenter(o.lane, w);
          // collision (AABB with a little forgiveness)
          if (
            o.y + o.h * 0.45 > playerY - carH * 0.45 &&
            o.y - o.h * 0.45 < playerY + carH * 0.45 &&
            ox + o.w / 2 - 6 * dprn > pLeft &&
            ox - o.w / 2 + 6 * dprn < pRight
          ) {
            running.current = false;
            getEngine().thud();
            const sc = Math.floor(dist.current / (10 * dprn));
            setScore(sc);
            setBest((prev) => {
              if (sc > prev) {
                localStorage.setItem(KEY, String(sc));
                return sc;
              }
              return prev;
            });
            setState("over");
          }
          if (o.y > h + o.h) obstacles.current.splice(i, 1);
        }
        setScore(Math.floor(dist.current / (10 * dprn)));
      }

      // draw obstacles
      obstacles.current.forEach((o) => {
        const ox = laneCenter(o.lane, w);
        drawCar(ox, o.y, o.w, o.h, PAINT[o.paint].body, PAINT[o.paint].roof);
      });

      // draw player (cream Ambassador)
      drawCar(playerX.current, playerY, carW, carH, "#ece3cf", "#7a6a4a");

      raf = requestAnimationFrame(loop);
    };
    loop();

    const onKey = (e: KeyboardEvent) => {
      if (!running.current) return;
      if (e.key === "ArrowLeft" || e.key === "a")
        playerLane.current = Math.max(0, playerLane.current - 1);
      if (e.key === "ArrowRight" || e.key === "d")
        playerLane.current = Math.min(LANES - 1, playerLane.current + 1);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
    };
  }, [laneCenter]);

  // pointer steering — tap/drag toward a lane
  const steer = (e: React.PointerEvent) => {
    if (!running.current) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const roadW = canvas.width * 0.84;
    const roadLeft = (canvas.width - roadW) / 2;
    const laneW = roadW / LANES;
    const lane = Math.max(
      0,
      Math.min(LANES - 1, Math.floor((x - roadLeft) / laneW)),
    );
    playerLane.current = lane;
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center py-6">
      <h2 className="font-display text-2xl">Retro Race · रेस</h2>
      <p className="text-dim mt-1 text-center text-sm">
        Steer a vintage Ambassador through ’60s–’70s traffic. Tap a lane or use
        ← → keys. Dodge the Padmini taxis as long as you can.
      </p>

      <div className="mt-3 flex w-full items-center justify-between text-sm">
        <span className="text-dim">
          Score <span className="text-white tabular-nums">{score}</span>
        </span>
        <span className="text-dim">
          Best <span className="text-white tabular-nums">{best}</span>
        </span>
      </div>

      <div className="relative mt-3 w-full">
        <canvas
          ref={canvasRef}
          onPointerDown={steer}
          onPointerMove={(e) => {
            if (e.buttons === 1) steer(e);
          }}
          className="h-[62vh] max-h-[600px] w-full touch-none rounded-3xl border border-white/10 shadow-2xl"
          style={{ cursor: "pointer" }}
        />

        {state !== "playing" && (
          <div className="animate-fade-up absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-black/55 text-center">
            {state === "over" ? (
              <>
                <p className="font-display text-2xl">Crash! 💥</p>
                <p className="text-dim mt-1 text-sm">
                  You drove {score} — {score >= best ? "a new best!" : `best ${best}`}
                </p>
              </>
            ) : (
              <p className="font-display text-xl text-[var(--color-marigold)]">
                🚗 Ready to drive?
              </p>
            )}
            <button
              onClick={begin}
              className="mt-5 rounded-full bg-white/15 px-7 py-2.5 text-sm font-medium transition hover:bg-white/25"
            >
              {state === "over" ? "race again" : "start engine"}
            </button>
          </div>
        )}
      </div>

      <p className="text-dim mt-3 text-center text-xs">
        ← → / A · D to switch lanes — or tap the lane you want.
      </p>
    </div>
  );
}
