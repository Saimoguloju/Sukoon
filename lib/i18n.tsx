"use client";

// A tiny, dependency-free i18n layer. Covers the high-visibility shell, home,
// quick-calm and ritual strings in five languages. Any missing key gracefully
// falls back to English (and then to the provided default), so partial
// translations never produce broken UI.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "hi" | "ta" | "te" | "bn";

export const LANGS: { code: Lang; native: string; short: string }[] = [
  { code: "en", native: "English", short: "EN" },
  { code: "hi", native: "हिन्दी", short: "हि" },
  { code: "ta", native: "தமிழ்", short: "த" },
  { code: "te", native: "తెలుగు", short: "తె" },
  { code: "bn", native: "বাংলা", short: "বা" },
];

type Dict = Record<string, string>;

const STRINGS: Record<Lang, Dict> = {
  en: {
    tagline: "a little peace, every day",
    "greet.late": "Still awake?",
    "greet.morning": "Good morning",
    "greet.afternoon": "Good afternoon",
    "greet.evening": "Good evening",
    "greet.night": "Time to rest",
    "home.breathLine": "Take one deep breath.",
    "home.choose": "Choose a moment",
    "home.another": "another",
    "home.rooted": "Rooted in Indian calm — sukoon: a quiet, settled peace of mind.",
    "home.startRitual": "Start today's ritual",
    "streak.label": "day streak",
    "streak.best": "best",
    quickCalm: "Quick calm",
    "sos.title": "Breathe with me",
    "sos.close": "I feel calmer",
    "sos.subtitle": "Follow the circle. Let the ground hold you.",
    "ritual.title": "Today's ritual",
    "ritual.subtitle": "A small daily practice keeps your calm growing.",
    "ritual.step.breath": "Three slow breaths",
    "ritual.step.gratitude": "One thing you're grateful for",
    "ritual.step.done": "Complete",
    "ritual.gratitudePlaceholder": "Today I'm grateful for…",
    "ritual.next": "Next",
    "ritual.finish": "Finish & keep streak",
    "ritual.doneToday": "You've completed today's ritual 🌸",
    "ritual.comeBack": "Come back tomorrow to grow your streak.",
    "mod.today": "Today",
    "mod.breathe": "Pranayama",
    "mod.mood": "Check-in",
  },
  hi: {
    tagline: "थोड़ा सुकून, हर दिन",
    "greet.late": "अभी जाग रहे हैं?",
    "greet.morning": "सुप्रभात",
    "greet.afternoon": "नमस्ते",
    "greet.evening": "शुभ संध्या",
    "greet.night": "विश्राम का समय",
    "home.breathLine": "एक गहरी साँस लीजिए।",
    "home.choose": "एक पल चुनें",
    "home.another": "एक और",
    "home.rooted": "भारतीय शांति में निहित — सुकून: मन की एक शांत, स्थिर अवस्था।",
    "home.startRitual": "आज का अनुष्ठान शुरू करें",
    "streak.label": "दिन का सिलसिला",
    "streak.best": "सर्वोत्तम",
    quickCalm: "तुरंत शांति",
    "sos.title": "मेरे साथ साँस लें",
    "sos.close": "अब बेहतर लग रहा है",
    "sos.subtitle": "वृत्त का अनुसरण करें। ज़मीन को आपको थामने दें।",
    "ritual.title": "आज का अनुष्ठान",
    "ritual.subtitle": "एक छोटा सा रोज़ का अभ्यास आपकी शांति बढ़ाता है।",
    "ritual.step.breath": "तीन धीमी साँसें",
    "ritual.step.gratitude": "एक बात जिसके लिए आप आभारी हैं",
    "ritual.step.done": "पूर्ण",
    "ritual.gratitudePlaceholder": "आज मैं आभारी हूँ…",
    "ritual.next": "आगे",
    "ritual.finish": "समाप्त करें और सिलसिला बनाए रखें",
    "ritual.doneToday": "आपने आज का अनुष्ठान पूरा कर लिया 🌸",
    "ritual.comeBack": "अपना सिलसिला बढ़ाने के लिए कल फिर आएं।",
    "mod.today": "आज",
    "mod.breathe": "प्राणायाम",
    "mod.mood": "मन",
  },
  ta: {
    tagline: "தினமும் கொஞ்சம் அமைதி",
    "greet.late": "இன்னும் விழித்திருக்கிறீர்களா?",
    "greet.morning": "காலை வணக்கம்",
    "greet.afternoon": "மதிய வணக்கம்",
    "greet.evening": "மாலை வணக்கம்",
    "greet.night": "ஓய்வெடுக்கும் நேரம்",
    "home.breathLine": "ஒரு ஆழ்ந்த மூச்சு விடுங்கள்.",
    "home.choose": "ஒரு தருணத்தைத் தேர்வுசெய்க",
    "home.another": "மற்றொன்று",
    "home.rooted": "இந்திய அமைதியில் வேரூன்றியது — சுகூன்: மனதின் அமைதியான நிலை.",
    "home.startRitual": "இன்றைய நிகழ்வைத் தொடங்கு",
    "streak.label": "நாள் தொடர்",
    "streak.best": "சிறந்தது",
    quickCalm: "உடனடி அமைதி",
    "sos.title": "என்னுடன் சுவாசியுங்கள்",
    "sos.close": "இப்போது அமைதியாக உணர்கிறேன்",
    "sos.subtitle": "வட்டத்தைப் பின்தொடரவும். தரை உங்களைத் தாங்கட்டும்.",
    "ritual.title": "இன்றைய நிகழ்வு",
    "ritual.subtitle": "சிறிய தினசரி பயிற்சி உங்கள் அமைதியை வளர்க்கும்.",
    "ritual.step.breath": "மூன்று மெதுவான மூச்சுகள்",
    "ritual.step.gratitude": "நீங்கள் நன்றியுள்ள ஒரு விஷயம்",
    "ritual.step.done": "முடிந்தது",
    "ritual.gratitudePlaceholder": "இன்று நான் நன்றியுடன் இருக்கிறேன்…",
    "ritual.next": "அடுத்து",
    "ritual.finish": "முடித்து தொடரை வைத்திரு",
    "ritual.doneToday": "இன்றைய நிகழ்வை முடித்துவிட்டீர்கள் 🌸",
    "ritual.comeBack": "உங்கள் தொடரை வளர்க்க நாளை மீண்டும் வாருங்கள்.",
    "mod.today": "இன்று",
  },
  te: {
    tagline: "ప్రతిరోజూ కొంచెం ప్రశాంతత",
    "greet.late": "ఇంకా మెలకువగా ఉన్నారా?",
    "greet.morning": "శుభోదయం",
    "greet.afternoon": "శుభ మధ్యాహ్నం",
    "greet.evening": "శుభ సాయంత్రం",
    "greet.night": "విశ్రాంతి సమయం",
    "home.breathLine": "ఒక లోతైన శ్వాస తీసుకోండి.",
    "home.choose": "ఒక క్షణాన్ని ఎంచుకోండి",
    "home.another": "మరొకటి",
    "home.rooted": "భారతీయ ప్రశాంతతలో పాతుకుపోయింది — సుకూన్: మనసు యొక్క ప్రశాంత స్థితి.",
    "home.startRitual": "నేటి ఆచారాన్ని ప్రారంభించండి",
    "streak.label": "రోజుల వరుస",
    "streak.best": "ఉత్తమం",
    quickCalm: "త్వరిత ప్రశాంతత",
    "sos.title": "నాతో శ్వాస తీసుకోండి",
    "sos.close": "ఇప్పుడు ప్రశాంతంగా ఉంది",
    "sos.subtitle": "వృత్తాన్ని అనుసరించండి. నేల మిమ్మల్ని మోయనివ్వండి.",
    "ritual.title": "నేటి ఆచారం",
    "ritual.subtitle": "చిన్న రోజువారీ అభ్యాసం మీ ప్రశాంతతను పెంచుతుంది.",
    "ritual.step.breath": "మూడు నెమ్మది శ్వాసలు",
    "ritual.step.gratitude": "మీరు కృతజ్ఞులైన ఒక విషయం",
    "ritual.step.done": "పూర్తయింది",
    "ritual.gratitudePlaceholder": "ఈ రోజు నేను కృతజ్ఞుడిని…",
    "ritual.next": "తరువాత",
    "ritual.finish": "ముగించి వరుసను కొనసాగించండి",
    "ritual.doneToday": "మీరు నేటి ఆచారాన్ని పూర్తి చేశారు 🌸",
    "ritual.comeBack": "మీ వరుసను పెంచుకోవడానికి రేపు తిరిగి రండి.",
    "mod.today": "ఈ రోజు",
  },
  bn: {
    tagline: "প্রতিদিন একটু প্রশান্তি",
    "greet.late": "এখনও জেগে আছেন?",
    "greet.morning": "শুভ সকাল",
    "greet.afternoon": "শুভ অপরাহ্ন",
    "greet.evening": "শুভ সন্ধ্যা",
    "greet.night": "বিশ্রামের সময়",
    "home.breathLine": "একটি গভীর শ্বাস নিন।",
    "home.choose": "একটি মুহূর্ত বেছে নিন",
    "home.another": "আরেকটি",
    "home.rooted": "ভারতীয় প্রশান্তিতে প্রোথিত — সুকূন: মনের এক শান্ত, স্থির অবস্থা।",
    "home.startRitual": "আজকের অনুষ্ঠান শুরু করুন",
    "streak.label": "দিনের ধারা",
    "streak.best": "সেরা",
    quickCalm: "দ্রুত প্রশান্তি",
    "sos.title": "আমার সাথে শ্বাস নিন",
    "sos.close": "এখন শান্ত লাগছে",
    "sos.subtitle": "বৃত্তটি অনুসরণ করুন। মাটি আপনাকে ধরে রাখুক।",
    "ritual.title": "আজকের অনুষ্ঠান",
    "ritual.subtitle": "ছোট দৈনিক অভ্যাস আপনার প্রশান্তি বাড়ায়।",
    "ritual.step.breath": "তিনটি ধীর শ্বাস",
    "ritual.step.gratitude": "একটি জিনিস যার জন্য আপনি কৃতজ্ঞ",
    "ritual.step.done": "সম্পন্ন",
    "ritual.gratitudePlaceholder": "আজ আমি কৃতজ্ঞ…",
    "ritual.next": "পরবর্তী",
    "ritual.finish": "শেষ করুন ও ধারা বজায় রাখুন",
    "ritual.doneToday": "আপনি আজকের অনুষ্ঠান সম্পন্ন করেছেন 🌸",
    "ritual.comeBack": "আপনার ধারা বাড়াতে আগামীকাল আবার আসুন।",
    "mod.today": "আজ",
  },
};

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = "sukoon.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved && STRINGS[saved]) setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) =>
      STRINGS[lang][key] ?? STRINGS.en[key] ?? fallback ?? key,
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
