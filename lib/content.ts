// Small content library: Indian-inspired reflections and the module catalogue.

export const quotes: { text: string; source: string }[] = [
  { text: "You have a right to your actions, but never to the fruits of your actions.", source: "Bhagavad Gita" },
  { text: "योगः चित्त-वृत्ति निरोधः — Yoga is the stilling of the mind.", source: "Patanjali, Yoga Sutras" },
  { text: "सर्वे भवन्तु सुखिनः — May all beings be happy and free.", source: "Vedic prayer" },
  { text: "The mind is restless, but it can be steadied by practice and detachment.", source: "Bhagavad Gita 6.35" },
  { text: "Slowly, slowly, O mind — everything happens in its own time.", source: "Sant Kabir" },
  { text: "वसुधैव कुटुम्बकम् — The whole world is one family.", source: "Maha Upanishad" },
  { text: "When you breathe in, you are taking the strength of the universe.", source: "Yogic wisdom" },
  { text: "Let go of what has passed. Let go of what may yet come.", source: "The Buddha" },
  { text: "Calmness of mind is one of the beautiful jewels of wisdom.", source: "James Allen" },
  { text: "शांति, शांति, शांति — Peace in body, peace in mind, peace in spirit.", source: "Shanti Mantra" },
  { text: "侘寂 — There is beauty in the imperfect, the impermanent, the incomplete.", source: "Wabi-sabi (Japan)" },
  { text: "Fall seven times, stand up eight. 七転び八起き", source: "Japanese proverb" },
  { text: "멍때리기 — Sometimes the most productive thing you can do is nothing at all.", source: "Korean wisdom" },
];

export function quoteOfNow() {
  // changes through the day so a returning visitor sees something new
  const slot = Math.floor(Date.now() / (1000 * 60 * 60 * 3));
  return quotes[slot % quotes.length];
}

export type ModuleId =
  | "home"
  | "breathe"
  | "trataka"
  | "sounds"
  | "rangoli"
  | "smoke"
  | "pop"
  | "mood"
  | "mala"
  | "bowl"
  | "kintsugi"
  | "mung"
  | "archery"
  | "race";

export const modules: {
  id: ModuleId;
  label: string;
  glyph: string;
  icon: string;
  blurb: string;
}[] = [
  { id: "home", label: "Home", glyph: "ॐ", icon: "❀", blurb: "Your calm starting point" },
  { id: "breathe", label: "Pranayama", glyph: "श्वास", icon: "◯", blurb: "Yogic breathing to steady the mind" },
  { id: "trataka", label: "Trataka", glyph: "दीप", icon: "☼", blurb: "त्राटक — gaze softly at the flame" },
  { id: "sounds", label: "Naad", glyph: "नाद", icon: "♫", blurb: "Monsoon, temple bells, tanpura & more" },
  { id: "rangoli", label: "Rangoli", glyph: "रंग", icon: "✺", blurb: "Draw a living symmetric mandala" },
  { id: "smoke", label: "Incense", glyph: "धूप", icon: "≈", blurb: "Press & hold — let the smoke rise" },
  { id: "pop", label: "Pop", glyph: "टप", icon: "○", blurb: "Pop bubbles, release tension" },
  { id: "mala", label: "Mala", glyph: "जाप", icon: "📿", blurb: "Rhythmic breathing and chanting counter" },
  { id: "bowl", label: "Bowl", glyph: "ध्वनि", icon: "🥣", blurb: "Interactive singing bowl resonance" },
  { id: "kintsugi", label: "Kintsugi", glyph: "金継", icon: "🏺", blurb: "金継ぎ — mend the cracks with gold (Japan)" },
  { id: "mung", label: "Space-out", glyph: "멍", icon: "🌫", blurb: "멍때리기 — the Korean art of doing nothing" },
  { id: "archery", label: "Archery", glyph: "धनुष", icon: "🏹", blurb: "धनुष — Arjuna's aim: loose every arrow, 50 levels" },
  { id: "race", label: "Retro Race", glyph: "रेस", icon: "🚗", blurb: "Dodge traffic in a vintage Ambassador & Padmini" },
  { id: "mood", label: "Check-in", glyph: "मन", icon: "✦", blurb: "Note how your mann (mind) feels" },
];
