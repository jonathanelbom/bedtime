<script setup lang="ts">
const emit = defineEmits<{ done: [] }>()
const textActive = ref(false)
const sinking = ref(false)
const fading = ref(false)
const taglineActive = ref(false)
const glowOn = ref(false)

const taglineDelay = 2000;
onMounted(() => {
  setTimeout(() => { textActive.value = true; glowOn.value = true }, 1100)
  setTimeout(() => { taglineActive.value = true;  }, 2200)
  setTimeout(() => { glowOn.value = false; }, 2900 + taglineDelay)
  setTimeout(() => { taglineActive.value = false; },    3000 + taglineDelay)
  setTimeout(() => { sinking.value = true;  taglineActive.value = false},    3200 + taglineDelay)
  setTimeout(() => { fading.value = true; },     3800 + taglineDelay)
  setTimeout(() => { emit('done') },            4250 + taglineDelay)
})

const letters = 'Bedtime'.split('')
</script>

<template>
  <div class="splash" :class="{ 'splash--fading': fading }">
    <div class="clip" :class="{ 'clip--fading': sinking }">
      <div class="glow" :class="{ 'glow--on': glowOn }" />
      <div class="content" :class="{ 'content--sinking': sinking }">

        <svg width="428" height="447" viewBox="0 0 428 447" fill="none" class="logo">
          <path class="eye-path" style="--delay: 310ms"
            d="M76.4435 154.448L2.44348 225.448C33.4435 310.448 103.443 252.448 103.443 252.448C103.443 252.448 157.443 190.448 76.4435 154.448Z"
            fill="currentColor" />
          <path class="eye-path" style="--delay: 470ms"
            d="M208.443 23.4481L134.443 94.4481C165.443 179.448 235.443 121.448 235.443 121.448C235.443 121.448 289.443 59.4481 208.443 23.4481Z"
            fill="currentColor" />
          <path class="smile-path" style="--delay: 660ms"
            d="M4.9997 340.513C4.9997 340.513 191 391.513 208 231.513C392 198.513 317 16.5128 317 16.5128C607 274.513 191 594.513 4.9997 340.513Z"
            fill="currentColor" />
        </svg>

        <div class="wordmark" :class="{ 'wordmark--active': textActive }">
          <span
            v-for="(letter, i) in letters"
            :key="i"
            class="letter"
            :style="`--i: ${i}`"
          >{{ letter }}</span>
        </div>

      </div>
    </div>
    <div class="tagline text-lg text-white/50" :class="{ 'tagline--active': taglineActive}">Your after-hours musical vibe coach.</div>
  </div>
</template>

<style scoped>

/* ── Overlay ──────────────────────────── */

.splash {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* background-color: #1e1a30; */
  /* --page-bg:  */
  background: linear-gradient(-45deg, var(--page-bg), oklch(from var(--page-bg) l c calc(h + 107)));
  opacity: 1;
  transition: opacity 400ms ease;
  pointer-events: auto;
}
.splash--fading {
  opacity: 0;
  pointer-events: none;
}

/* ── Single clip container ────────────── */

.clip {
  position: relative;
  overflow: hidden;
  height: 5rem;
  padding-inline: 3rem;
  display: flex;
  align-items: flex-end;
  opacity: 1;
  transform: translateY(-48px);
}
.clip--fading {
  transition: opacity 400ms ease-in;
  opacity: 0;
}

/* ── Horizon glow ─────────────────────── */

.glow {
  position: absolute;
  bottom: 0;
  left: 36px;
  width: calc(100% - 48px);
  height: 96px;
  background: radial-gradient(ellipse 80% 100% at 50% 100%, rgba(255,255,255,0.12) 0%, transparent 70%);
  transform-origin: bottom center;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.1);
  transition: opacity 500ms linear, transform 700ms ease;
}
.glow--on {
  opacity: .8;
  transform: scale(1);
  /* animation: shinePass 2400ms ease forwards; */
}

/* @keyframes shinePass {
  0%   { opacity: 0; transform: scaleY(0.1); }
  20%  { opacity: 1; transform: scaleY(1); }
  80%  { opacity: 1; transform: scaleY(1); }
  100% { opacity: 0.25; transform: scaleY(0.6); }
} */

/* ── Content (logo + wordmark) ────────── */

.content {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}
.content--sinking {
  animation: sinkOut 550ms ease-in forwards;
}

@keyframes sinkOut {
  from { transform: translateY(0); }
  to   { transform: translateY(130%); }
}

/* ── Logo ─────────────────────────────── */

.logo {
  width: 2.75rem;
  height: auto; /* must override height="447" HTML attribute */
  flex-shrink: 0;
  color: white;
  opacity: 0.6;
}

.eye-path {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  animation: eyeIn 400ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--delay, 0ms);
}
.smile-path {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  animation: smirkIn 600ms cubic-bezier(0.34, 1.4, 0.64, 1) forwards;
  animation-delay: var(--delay, 0ms);
}

@keyframes eyeIn {
  from { opacity: 0; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes smirkIn {
  from { opacity: 0; transform: scale(0.1); }
  to   { opacity: 1; transform: scale(1); }
}

/* ── Wordmark ─────────────────────────── */

.wordmark {
  display: flex;
}

.letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(110%);
  font-size: 3rem;
  font-weight: 500;
  color: rgba(255,255,255,0.9);
  letter-spacing: -0.02em;
  line-height: 1;
}
.wordmark--active .letter {
  animation: letterRise 380ms ease forwards;
  animation-delay: calc(400ms + var(--i) * 100ms);
}

@keyframes letterRise {
  from { opacity: 0; transform: translateY(110%); }
  to   { opacity: 1; transform: translateY(0); }
}

.tagline {
  transform: translate(10px,-44px);
  opacity: 0;
  transition: opacity 500ms ease, transform 600ms ease;

}
.tagline--active {
  opacity: 1;
  transform: translate(10px,-40px);
  transition: opacity 600ms linear, transform 600ms ease;
}
</style>
