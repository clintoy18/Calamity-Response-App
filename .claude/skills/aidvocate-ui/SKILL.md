---
name: aidvocate-ui
description: AidVocate's frontend design rules. Load before building or restyling any screen, card, panel, modal or component in frontend/. Covers the type scale quirk, color meaning, layout for low-end phones, crisis vs normal tone, Cebuano-first copy, and an anti-"AI slop" checklist.
---

# AidVocate UI

AidVocate is used by people in Cebu on budget Android phones, often outdoors, often on weak signal, sometimes during an emergency. Every design choice answers to that person, not to a Dribbble shot.

## 1. Know the Tailwind config before you style

`frontend/tailwind.config.js` **overrides the default type scale one step down**:

| class | size | use |
|---|---|---|
| `text-xs` | 10px | timestamps, source lines only |
| `text-sm` | 12px | secondary text, labels |
| `text-base` | 14px | body text |
| `text-lg` | 16px | card titles, button labels |
| `text-xl` | 18px | section headings |
| `text-2xl` / `3xl` | 20 / 24px | screen headings |

So `text-sm` is smaller than you expect. For anything larger than 24px (a greeting, a big number), use an arbitrary value: `text-[28px]`, `text-[40px]`. Never put body copy below 12px.

Fonts already loaded in `index.html`: Inter (`font-sans`, body), Archivo (`font-alt`, headlines and big numbers), Rajdhani (`font-display`, compact labels only), Roboto Mono (`font-mono`, coordinates and IDs). Don't add fonts.

## 2. Color has meaning; don't spend it on decoration

- **Red (`brand`, `red-600`) means emergency.** It is reserved for the "need help" action, critical urgency and crisis mode. Never use red for a decorative accent, a logo halo or a "Report" button.
- **Ink (`gray-900`/`gray-950`) is the default primary.** This matches the existing ashfall panel: dark buttons, white text.
- **Hazard hues**, each used only for its own domain:
  - heat → `amber`/`orange` (escalating with PAGASA level: amber-500 caution → orange-600 extreme caution → red-600 danger → red-800 extreme danger)
  - water → `sky`
  - ashfall/volcano → `stone`/gray
  - verified/ok → `emerald`
- Surfaces are flat: white cards on `stone-50`/`gray-50`, a 1px `gray-200` border, little or no shadow. Use `shadow-strong` only for things that float over a map.

## 3. Layout for the real phone

- Design at **360px wide first**. Check that nothing overflows at 320px.
- Use a single column on mobile, capped at `max-w-md mx-auto` on desktop. Don't build a separate desktop design.
- Touch targets must be at least 44px tall (`min-h-11`), and the primary action goes in the thumb zone (bottom of the screen, sticky).
- Respect the iOS home bar with `pb-[max(1rem,env(safe-area-inset-bottom))]` on sticky bottom bars.
- Avoid large images or illustrations, since every KB costs on prepaid data. Use lucide icons.

## 4. Data honesty

- **Never show a fake number.** If a feature has no backend yet, show it as "Hapit na" (coming soon) and visibly disabled. Don't use placeholder stats.
- Every data card has exactly four states: loading (skeleton the same shape as the content), loaded, empty (a sentence about what's normal, e.g. "Walay report karon"), and error (one short line plus a retry button).
- Computed or estimated values say so ("gibanabana", "estimated"). Official data names its source (PAGASA, PHIVOLCS, LGU) and its time.

## 5. Tone: normal mode vs crisis mode

- **Normal mode:** warm and a little playful, like a neighbor. Emoji are allowed *in copy* (a greeting), never as UI icons.
- **Crisis mode** (an active serious advisory): calm, short and directive. No jokes, no emoji, no greeting fluff. The emergency action and the advisory come first, and everything else moves down.
- **The emergency action is visible on every main screen, in the same place, at all times.** Friendliness must never add a tap between a person and help.

## 6. Copy

- Cebuano first and English second (follow the existing `lang` toggle where present). Keep sentences short and use words people actually text, e.g. "Naa bay tubig?" rather than formal Bisaya.
- Buttons are verbs: "Mangayo og tabang", "Mag-report", "Tan-awa ang mapa".
- Don't use marketing voice. Ban: "Empowering communities", "Your safety, our priority", "Seamless", "Revolutionary", "Stay informed, stay safe".

## 7. Anti-slop checklist (reject the design if any are true)

- [ ] Gradient text, or purple-to-blue/indigo gradients anywhere
- [ ] Glassmorphism (`backdrop-blur` + translucent white) on things that aren't over a map
- [ ] A "hero" with a centered headline and three equal feature cards below it
- [ ] The `Sparkles` icon, or emoji used as icons in buttons and chips
- [ ] Every element has `rounded-2xl shadow-lg`: vary the radius by role (cards `rounded-2xl`, chips `rounded-full`, inputs `rounded-xl`) and drop the shadows
- [ ] Animations nobody asked for: hover scale on cards, bouncing icons, staggered fade-ins on every list. Allow one entrance transition per screen at most, and honor `prefers-reduced-motion` (`motion-safe:` prefix)
- [ ] Decorative blobs, dot grids or noise backgrounds
- [ ] Generic copy that would fit any app
- [ ] A number on screen that doesn't come from real data
- [ ] Icon-only buttons without an `aria-label`

## 8. Before calling it done

1. `cd frontend && npm run lint && npm run build` both pass.
2. Open it at 360px width in devtools and check normal mode, crisis mode, loading and error states (block the API in the network tab).
3. Read every string aloud. If it sounds like an ad, rewrite it.
