# Sukoon सुकून — thoda sukoon, har din

An **Indian stress-relief web app**. *Sukoon (सुकून)* means a quiet, settled
peace of mind — and that's exactly what this little app is for.

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
| **Check-in मन** | Daily mood ritual | Note how your *mann* feels; private 7-day trend stored on your device |

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

- **Japa Mala (जाप) Counter**: A tactile, rhythmic chanting counter featuring 108 virtual beads that advance with a satisfying, synthesized drop chime upon sliding.
- **Singing Bowl (ध्वनि स्नान) Resonance**: An interactive virtual brass bowl that generates a sustained, multi-harmonic resonant tone in response to circling touch/mouse movements.
- **Sand Painting (धूलि चित्र)**: A sandbox drawing canvas where users create flowing sand trails that slowly diffuse and dissolve over time, meditating on the theme of impermanence.
- **Custom Pranayama Pacing**: Sliders to build custom breathing patterns by adjusting the timing of *Puraka* (inhale), *Kumbhaka* (hold), *Rechaka* (exhale), and *Shoonyaka* (suspend).
- **Gratitude Log (आभार)**: A private, daily micro-journaling prompt to record three positive moments from the day, stored locally.

## Tech

- Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Hind + Yatra One (Devanagari) fonts
- Web Audio API for procedural soundscapes, tanpura drone & temple bells
- Canvas 2D for the diya flame, rangoli, and rising incense smoke
- Deployable to Vercel out of the box (`vercel deploy`)
