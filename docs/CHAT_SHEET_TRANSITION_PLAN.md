# Chat Sheet Transition Plan — Slide Up / Slide Down

## Context

The chat route initially used the standard push/pop transition (slides in from the right). The goal was a transition that feels more like a sheet or modal sliding up from the bottom — reinforcing that chat is a layer on top of the sections, not a step in a linear flow. Closing reverses this: chat slides back down, sections are revealed underneath. The underlying page never moves; only a black overlay fades in/out.

---

## How the transition system works

The existing system has two moving parts:

**`app/composables/useRouteTransitionState.ts`** — sets a reactive `transitionName` ref before each navigation. Compares `pageIndex` values on the to/from routes to decide between `'push'`, `'pop'`, or `'fade'`.

**`app/assets/css/tailwind.css`** — all `.[name]-enter-*` / `.[name]-leave-*` CSS classes that Vue's `<Transition>` picks up via the `name` prop passed to `<NuxtPage :transition>` in `app.vue`.

Vue renders both pages simultaneously in `mode: 'default'` (the current setting), so enter and leave animate in parallel — exactly what's needed for the sheet effect.

---

## The two new transition names

### `sheet` — opening chat (any section → /chat)
- **Entering (chat page):** slides up from `translateY(100%)` → `translateY(0)`; naturally renders on top since it's later in the DOM
- **Leaving (section page):** stays fixed — no movement; `::after` overlay fades from `opacity: 0` → `opacity: 0.5`

### `sheet-pop` — closing chat (/chat → any section)
- **Leaving (chat page):** slides down from `translateY(0)` → `translateY(100%)`; gets `z-index: 1` explicitly so it stays visually above the entering page (same technique the existing `pop` transition uses)
- **Entering (section page):** stays fixed — no movement; `::after` overlay fades from `opacity: 0.5` → `opacity: 0` as the chat slides away

---

## Key design decision: route name detection (not pageIndex)

The existing push/pop system uses `pageIndex` to determine direction. For the sheet transitions, we don't care about index — we only care about *whether chat is involved*. So the composable gets two early-return checks that run before the pageIndex logic:

```ts
router.beforeEach((to, from) => {
  if (to.name === 'chat') {
    transitionName.value = 'sheet'
    return
  }
  if (from.name === 'chat') {
    transitionName.value = 'sheet-pop'
    return
  }
  // existing pageIndex logic unchanged...
})
```

This keeps the chat transition completely isolated — no changes to how any other routes transition.

---

## Why the underlying page stays still

`translateX(0)` is explicitly set on both `leave-from` and `leave-to` for `sheet`, and on `enter-from` and `enter-to` for `sheet-pop`. Because the value doesn't change, no movement occurs. Only the `::after` overlay's opacity animates.

---

## Why the overlay technique works

Each page element is `position: absolute` inside the `position: relative; overflow: hidden` root container in `app.vue`. The `::after` pseudo-element is positioned inside the page element with `z-index: 2`, putting it above the page's own content but below any separately stacked element (like the incoming chat page).

| Scenario | DOM order | Who's on top |
|---|---|---|
| `sheet` (opening) | leaving page first, entering chat second | chat (later in DOM, no z-index needed) |
| `sheet-pop` (closing) | leaving chat first, entering page second | chat (`z-index: 1` overrides DOM order) |

---

## Files changed

| File | Change |
|---|---|
| `app/composables/useRouteTransitionState.ts` | Two early-return checks for `to.name === 'chat'` and `from.name === 'chat'` |
| `app/assets/css/tailwind.css` | Two new transition blocks: `.sheet-*` and `.sheet-pop-*` |
