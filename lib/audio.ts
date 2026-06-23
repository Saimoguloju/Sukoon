// Procedural soundscape engine — everything is synthesized with the Web Audio
// API so the app ships with zero audio assets. Each "voice" is a small graph of
// noise/oscillator nodes feeding a per-voice gain that we fade in and out.

export type SoundId =
  | "rain"
  | "river"
  | "birds"
  | "temple"
  | "tanpura"
  | "wind"
  | "night";

type Voice = {
  gain: GainNode;
  nodes: AudioScheduledSourceNode[];
  timers: number[];
  alive: boolean;
};

function makeNoiseBuffer(ctx: AudioContext, type: "white" | "brown") {
  const len = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (type === "white") {
      data[i] = white;
    } else {
      // brown noise — integrate white noise, keep it bounded
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
  }
  return buffer;
}

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private white!: AudioBuffer;
  private brown!: AudioBuffer;
  private voices = new Map<SoundId, Voice>();

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    this.white = makeNoiseBuffer(ctx, "white");
    this.brown = makeNoiseBuffer(ctx, "brown");
    return ctx;
  }

  private loopSource(buffer: AudioBuffer) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.start();
    return src;
  }

  // A repeating little tone (bird chirp / cricket / ember pop).
  private scheduleBlips(
    voice: Voice,
    opts: {
      every: [number, number];
      freq: [number, number];
      dur: number;
      type: OscillatorType;
      level: number;
    },
  ) {
    const ctx = this.ctx!;
    const tick = () => {
      if (!voice.alive) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = opts.type;
      o.frequency.value =
        opts.freq[0] + Math.random() * (opts.freq[1] - opts.freq[0]);
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(opts.level, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + opts.dur);
      o.connect(g).connect(voice.gain);
      o.start();
      o.stop(ctx.currentTime + opts.dur + 0.05);
      const next =
        opts.every[0] + Math.random() * (opts.every[1] - opts.every[0]);
      voice.timers.push(window.setTimeout(tick, next * 1000));
    };
    voice.timers.push(window.setTimeout(tick, 600));
  }

  // Repeating temple-bell tolls feeding a voice's gain.
  private scheduleTolls(voice: Voice) {
    const ctx = this.ctx!;
    const toll = () => {
      if (!voice.alive) return;
      const now = ctx.currentTime;
      const freq = 280 + Math.random() * 40;
      const partials = [1, 2.4, 3.8, 5.1];
      const out = ctx.createGain();
      out.gain.setValueAtTime(0.0001, now);
      out.gain.exponentialRampToValueAtTime(0.5, now + 0.01);
      out.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      out.connect(voice.gain);
      partials.forEach((p, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = freq * p;
        o.type = "sine";
        g.gain.value = 1 / (i + 1.6);
        o.connect(g).connect(out);
        o.start(now);
        o.stop(now + 3.3);
      });
      voice.timers.push(window.setTimeout(toll, 4500 + Math.random() * 4000));
    };
    voice.timers.push(window.setTimeout(toll, 800));
  }

  private build(id: SoundId): Voice {
    const ctx = this.ensure();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(this.master!);
    const voice: Voice = { gain, nodes: [], timers: [], alive: true };

    switch (id) {
      case "rain": {
        const src = this.loopSource(this.white);
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 1000;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 8200;
        src.connect(hp).connect(lp).connect(gain);
        voice.nodes.push(src);
        break;
      }
      case "river": {
        // Ganga flowing — brown noise with a slow swelling lowpass.
        const src = this.loopSource(this.brown);
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 700;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.11;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 420;
        lfo.connect(lfoGain).connect(lp.frequency);
        lfo.start();
        src.connect(lp).connect(gain);
        voice.nodes.push(src, lfo);
        break;
      }
      case "birds": {
        // dawn chorus — soft bed of air with frequent sweet chirps
        const src = this.loopSource(this.brown);
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 2600;
        const g = ctx.createGain();
        g.gain.value = 0.2;
        src.connect(lp).connect(g).connect(gain);
        voice.nodes.push(src);
        this.scheduleBlips(voice, {
          every: [1.2, 4],
          freq: [2200, 3600],
          dur: 0.16,
          type: "sine",
          level: 0.13,
        });
        break;
      }
      case "temple": {
        // mandir bells — periodic resonant tolls over a faint room tone
        const src = this.loopSource(this.brown);
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 300;
        const g = ctx.createGain();
        g.gain.value = 0.15;
        src.connect(lp).connect(g).connect(gain);
        voice.nodes.push(src);
        this.scheduleTolls(voice);
        break;
      }
      case "tanpura": {
        // meditative drone — Pa · Sa · Sa · sa with a gentle pulsing buzz
        const base = 130.81; // C3 tonic (Sa)
        const ratios = [2 / 3, 1, 1.001, 2]; // Pa, Sa, Sa(detuned), upper Sa
        ratios.forEach((r) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sawtooth";
          o.frequency.value = base * r;
          const lp = ctx.createBiquadFilter();
          lp.type = "lowpass";
          lp.frequency.value = 900;
          g.gain.value = 0.12;
          // slow shimmer so it breathes like a real tanpura
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.18 + Math.random() * 0.1;
          const lfoG = ctx.createGain();
          lfoG.gain.value = 0.05;
          lfo.connect(lfoG).connect(g.gain);
          lfo.start();
          o.connect(lp).connect(g).connect(gain);
          o.start();
          voice.nodes.push(o, lfo);
        });
        break;
      }
      case "wind": {
        const src = this.loopSource(this.white);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 500;
        bp.Q.value = 0.8;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.13;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 300;
        lfo.connect(lfoGain).connect(bp.frequency);
        lfo.start();
        src.connect(bp).connect(gain);
        voice.nodes.push(src, lfo);
        break;
      }
      case "night": {
        const src = this.loopSource(this.brown);
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 500;
        const g = ctx.createGain();
        g.gain.value = 0.4;
        src.connect(lp).connect(g).connect(gain);
        voice.nodes.push(src);
        // crickets — rapid high chirps
        this.scheduleBlips(voice, {
          every: [0.4, 1.4],
          freq: [4200, 5200],
          dur: 0.09,
          type: "triangle",
          level: 0.04,
        });
        break;
      }
    }
    return voice;
  }

  async setVolume(id: SoundId, vol: number) {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    let voice = this.voices.get(id);
    const target = Math.max(0, Math.min(1, vol)) * 0.55;

    if (vol > 0 && !voice) {
      voice = this.build(id);
      this.voices.set(id, voice);
    }
    if (!voice) return;
    voice.gain.gain.cancelScheduledValues(ctx.currentTime);
    voice.gain.gain.setTargetAtTime(target, ctx.currentTime, 0.4);

    if (vol === 0) {
      const v = voice;
      window.setTimeout(() => this.kill(id, v), 1400);
    }
  }

  private kill(id: SoundId, voice: Voice) {
    // only kill if it's still the active voice and still silent
    if (this.voices.get(id) !== voice) return;
    if (voice.gain.gain.value > 0.01) return;
    voice.alive = false;
    voice.timers.forEach((t) => clearTimeout(t));
    voice.nodes.forEach((n) => {
      try {
        n.stop();
      } catch {}
    });
    voice.gain.disconnect();
    this.voices.delete(id);
  }

  // Singing-bowl style bell — used by the breathing & garden modules.
  async bell(freq = 432) {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    const now = ctx.currentTime;
    const partials = [1, 2.0, 2.7, 4.2];
    const out = ctx.createGain();
    out.gain.value = 0.0001;
    out.connect(this.master!);
    out.gain.setValueAtTime(0.0001, now);
    out.gain.exponentialRampToValueAtTime(0.5, now + 0.02);
    out.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);
    partials.forEach((p, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = freq * p;
      o.type = "sine";
      g.gain.value = 1 / (i + 1.5);
      o.connect(g).connect(out);
      o.start(now);
      o.stop(now + 4.6);
    });
  }

  // Quick, satisfying bubble pop.
  async pop() {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(900 + Math.random() * 500, now);
    o.frequency.exponentialRampToValueAtTime(180, now + 0.09);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.35, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    o.connect(g).connect(this.master!);
    o.start(now);
    o.stop(now + 0.14);
  }

  async stopAll() {
    [...this.voices.keys()].forEach((id) => this.setVolume(id, 0));
  }
}

let engine: SoundEngine | null = null;
export function getEngine() {
  if (!engine) engine = new SoundEngine();
  return engine;
}
