# Phase 3 Polish Plan

Partner review feedback — the app is close to shareable. These changes tighten the brand, improve onboarding feel, fix copy, and make the nav more intentional.

---

## 1. Intro splash screen

On first load of the preferences form, show a full-screen overlay:

> **Bedtime.**
> Your after-hours musical vibe coach.

- Fades in → holds briefly → fades out → form is revealed
- Only plays once per session (skipped on back-navigation)
- Overlay matches page bg — seamless transition

---

## 2. Auto-scroll to next section after chip selection

After selecting a chip in any single-select field, the next form section smoothly scrolls into view.

Scroll order:
- Genre → instruments
- DAW → time of day
- Time of day → movement
- Movement → mood

Multi-select fields (instruments, mood) don't auto-scroll.

---

## 3. Rename instruments field

| Before | After |
|---|---|
| "What do you play or use?" | "Got your hands on anything in particular?" |
| "Select one or more" | "Hands-on" |

No API or schema changes — copy only.

---

## 4. Bottom nav: Vibesplain + restructure

### Copy changes

| Location | Before | After |
|---|---|---|
| Sections overview — center button | Chat | Vibesplain |
| Section detail — center button | Chat | Vibesplain |
| Chat page header | "Let's talk about it" | "Vibesplain it to me!" |

### Section detail nav restructure

Current: `[← Prev section]  [Chat]  [Next section →]`

New: `[←]  [Vibesplain]  [→]`

- Prev/next become icon-only arrow buttons
- "Vibesplain" takes the wider center slot
- Right arrow hidden on last section (same as current behavior)

Overview page keeps the three-text-button layout — just renames Chat → Vibesplain.

---

## 5. Wishlist (stretch)

### Swipe through sections
Touch swipe on section detail pages — left swipe → next, right swipe → prev. Same navigation logic as the arrow buttons.

### Share output
Web Share API (`navigator.share()`) with clipboard fallback. Share content: section titles + feels as formatted text. Share button on the overview page.

---

## Files affected

| File | Changes |
|---|---|
| `app/pages/index.vue` | Intro overlay, auto-scroll refs, instruments copy |
| `app/pages/sections/index.vue` | Chat → Vibesplain |
| `app/pages/sections/[key].vue` | Nav restructure, Chat → Vibesplain |
| `app/pages/chat.vue` | Header copy |
