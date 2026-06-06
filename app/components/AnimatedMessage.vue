<script setup lang="ts">
const props = withDefaults(defineProps<{
  message: string
  loop?: boolean
  size?: string
  duration?: number
  delay?: number
  sequential?: boolean
  easing?: string
}>(), {
  loop: true,
  size: '1.5rem',
  duration: 5000,
  delay: 1000,
  sequential: false,
  easing: 'ease-in-out',
})

const emit = defineEmits<{ complete: [] }>()

const textActive = ref(false)
const cycleKey = ref(0)
const letterDelays = ref<number[]>([])
const messageChars = computed(() => props.message.split(''))

function start() {
  textActive.value = false
  cycleKey.value++
  let letterIndex = 0
  letterDelays.value = props.message.split('').map((char) => {
    if (char === ' ') return 0
    const d = props.sequential
      ? letterIndex * props.delay
      : Math.random() * props.delay
    letterIndex++
    return d
  })
  nextTick(() => {
    textActive.value = true
    if (!props.loop) {
      const maxDelay = Math.max(...letterDelays.value)
      setTimeout(() => emit('complete'), maxDelay + props.duration)
    }
  })
}

onMounted(start)
watch(() => props.message, start)
</script>

<template>
  <div class="message-clip">
    <div class="message" :class="{ 'message--active': textActive }">
      <span
        v-for="(char, i) in messageChars"
        :key="`${cycleKey}-${i}`"
        :class="char === ' ' ? 'letter-space' : 'letter'"
        :style="char !== ' ' ? {
          animationDelay: letterDelays[i] + 'ms',
          animationDuration: duration + 'ms',
          animationTimingFunction: easing,
          animationIterationCount: loop ? 'infinite' : '1',
          fontSize: size,
        } : { fontSize: size }"
      >{{ char === ' ' ? ' ' : char }}</span>
    </div>
  </div>
</template>

<style scoped>
.message-clip {
  overflow: hidden;
  height: 1.6em;
  display: flex;
  align-items: flex-end;
}

.message {
  display: flex;
  align-items: flex-end;
  position: relative;
  transform: translateY(10px);
}

.letter {
  display: inline-block;
  transform: translateY(100%);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.letter-space {
  display: inline-block;
  width: 0.35em;
}

.message--active .letter {
  animation-name: mole;
  animation-fill-mode: forwards;
}

@keyframes mole {
  0%   { transform: translateY(100%); opacity: 0; }
  15%  { transform: translateY(0);    opacity: 1; }
  85%  { transform: translateY(0);    opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
}
</style>
