<script setup lang="ts">
const screenWidth = import.meta.client ? window.innerWidth : 1200
const COUNT = Math.max(12, Math.round(screenWidth / 60))

const RANGES = {
  width:    [18,  48]   as [number, number],  // px
  height:   [25, 65]   as [number, number],  // vh
  duration: [3,  12]   as [number, number],  // s
  delay:    [0,  5]    as [number, number],  // s
  opacity:  [0.2, 0.5] as [number, number],
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

const strips = Array.from({ length: COUNT }, (_, i) => ({
  left:     `${(i / (COUNT - 1)) * 94 + rand(-2, 2)}%`,
  width:    rand(...RANGES.width),
  height:   100, //rand(...RANGES.height),
  duration: rand(...RANGES.duration),
  delay:    rand(...RANGES.delay),
  opacity:  1, // rand(...RANGES.opacity),
}))
</script>

<template>
  <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
    <div
      v-for="(strip, i) in strips"
      :key="i"
      class="strip"
      :style="{
        left: strip.left,
        width: strip.width + 'px',
        height: strip.height + 'vh',
        opacity: strip.opacity,
        '--duration': strip.duration + 's',
        '--delay': strip.delay + 's',
      }"
    />
  </div>
</template>

<style scoped>
@keyframes fall {
  from { transform: translateY(-100%); }
  to   { transform: translateY(100vh); }
}

.strip {
  position: absolute;
  top: 0;
  background: var(--bg-page);
  /* background: linear-gradient(180deg, transparent 0%, var(--page-bg) 100%); */
  box-shadow: 4px 8px 24px rgba(0, 0, 0, 0.15);
  animation: fall var(--duration) var(--delay) linear infinite;
  will-change: transform;
}
</style>
