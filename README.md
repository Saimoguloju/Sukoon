# Sukoon सुकून — thoda sukoon, har din

An **Indian stress-relief web app**. *Sukoon (सुकून)* means a quiet, settled
peace of mind — and that's exactly what this little app is for.

**Live URL**: [sukoon-omega-five.vercel.app](https://sukoon-omega-five.vercel.app/)

Built from scratch with **Next.js 16 (App Router) + React 19 + Tailwind v4**.
Everything runs client-side — no accounts, no backend, no media files. All
sounds are **synthesized live in the browser** with the Web Audio API.

## What's inside

| Module | Rooted in | What it does |
| --- | --- | --- |
| **Pranayama श्वास** | Yogic breathing | Animated orb guides Sama Vritti, 4·7·8 Shanti & Deergha breaths, with an Om (136.1 Hz) chime |
| **Trataka दीप** | त्राटक flame-gazing meditation | Gaze at a flickering diya flame for 1–10 min to still the mind |
| **Naad नाद** | Sounds of India | Layer monsoon rain, Ganga river, dawn birds, temple bells, **tanpura drone** & Himalayan wind |
| **Rangoli रंग** | रंगोली floor art | Draw anywhere — strokes bloom into a symmetric 6/8/12-fold mandala in marigold, sindoor, peacock… |
| **Incense धूप** | Agarbatti / dhoop | **Press & hold anywhere** to release curling smoke that rises and carries tension away |
| **Pop टप** | Tactile stress toys | Endless bubble wrap with a satisfying synthesized pop |
| **Mala जाप** | जप — chanting | A 108-bead japa counter with mantras and a synthesized bead chime |
| **Bowl ध्वनि** | Singing bowl | Rub the rim of a virtual brass bowl to build a resonant drone |
| **Kintsugi 金継** | 🇯🇵 金継ぎ — Japan | Mend a cracked bowl by tracing its seams with gold — beauty in imperfection (*wabi-sabi*) |
| **Space-out 멍** | 🇰🇷 멍때리기 — Korea | The art of doing nothing. Stay perfectly still; the moment you move, your session ends. Beat your record |
| **Check-in मन** | Daily mood ritual | Note how your *mann* feels; private 7-day trend stored on your device |

### Why Kintsugi & Space-out?

Sukoon began rooted in Indian calm, then drew in two of East Asia's most loved
stress-relief traditions:

- **Kintsugi (金継ぎ)** is the Japanese practice of repairing broken pottery
  with gold lacquer, treating the cracks as part of the object's story rather
  than a flaw to hide. It's the hands-on expression of *wabi-sabi* — finding
  beauty in the imperfect and impermanent.
- **Mung / Space-out (멍때리기)** is the Korean art of deliberately zoning out
  and doing absolutely nothing. It's taken so seriously that Seoul hosts an
  annual **Space-Out Competition**, where the calmest, stillest contestant wins.
  In a culture of relentless busyness, doing nothing is a radical, restorative
  act.

Other traditions that shaped the app: Japanese **Shinrin-yoku** (森林浴, forest
bathing) inspires the layered nature soundscapes, and Korean & Japanese
**Seon/Zen meditation** (선/禅) inspires the breathing and trataka modules.

## Growth features

- **Installable PWA + offline** — add Sukoon to your home screen; it works with no
  network (offline-first service worker, app manifest). No app store needed.
- **Daily ritual + streak (आज)** — a short guided breath + gratitude practice that
  tracks a 🔥 streak in `localStorage`, the proven driver of return visits.
- **Quick-Calm SOS (✸)** — an always-visible button that opens a fullscreen 4-7-8
  breathing + 5-4-3-2-1 grounding space for anxious moments.
- **5 languages** — English, हिन्दी, தமிழ், తెలుగు, বাংলা via a lightweight i18n
  layer, with graceful fallback to English.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Notes

- **Audio** initializes on first interaction (browser autoplay policy) and is
  cleaned up when you leave the soundscape.
- **Mood check-ins** are saved in `localStorage` only — nothing leaves your device.
- Respects `prefers-reduced-motion`.

## Future Roadmap (Planned Features)

To enrich the Sukoon stress-relief experience while remaining 100% client-side and media-free, the following features are planned:

- **Shinrin-yoku (森林浴) Walk**: A guided forest-bathing sequence with 5-4-3-2-1 sensory grounding prompts over a living forest soundscape.
- **Sand Painting (धूलि चित्र)**: A sandbox drawing canvas where users create flowing sand trails that slowly diffuse and dissolve over time, meditating on the theme of impermanence.
- **Custom Pranayama Pacing**: Sliders to build custom breathing patterns by adjusting the timing of *Puraka* (inhale), *Kumbhaka* (hold), *Rechaka* (exhale), and *Shoonyaka* (suspend).
- **Gratitude Log (आभार)**: A private, daily micro-journaling prompt to record three positive moments from the day, stored locally.

> Recently shipped: **Japa Mala (जाप)** counter, **Singing Bowl (ध्वनि)** resonance, **Kintsugi (金継ぎ)**, and **Space-out (멍때리기)**.

## Tech

- Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Hind + Yatra One (Devanagari) fonts
- Web Audio API for procedural soundscapes, tanpura drone & temple bells
- Canvas 2D for the diya flame, rangoli, and rising incense smoke
- Deployable to Vercel out of the box (`vercel deploy`)
