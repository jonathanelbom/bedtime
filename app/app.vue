<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { useRouteTransitionState } from '~/composables/useRouteTransitionState'
import { getRouteColor, getTransitionDuration, getSheetTransitionDuration } from '~/utils/pageColors'

const { transitionName } = useRouteTransitionState()
const router = useRouter()
const route = useRoute()

// Reactive viewport dimensions — SSR returns Infinity (safe: transitions don't run on server)
const { width, height } = useWindowSize()
const transitionDuration = computed(() => getTransitionDuration(width.value))
const sheetTransitionDuration = computed(() => getSheetTransitionDuration(height.value))

if (import.meta.client) {
  // Update --page-bg before each navigation so the color transition starts in sync
  router.beforeEach((to) => {
    const color = getRouteColor(to.name as string, to.params as Record<string, string>)
    document.documentElement.style.setProperty('--page-bg', color)
  })

  // Keep transition vars in sync whenever the viewport is resized
  watch(transitionDuration, (ms) => {
    document.documentElement.style.setProperty('--page-transition-ms', String(ms))
  })
  watch(sheetTransitionDuration, (ms) => {
    document.documentElement.style.setProperty('--sheet-transition-ms', String(ms))
  })

  onMounted(() => {
    const color = getRouteColor(route.name as string, route.params as Record<string, string>)
    // Set all vars without transition to avoid flashing on first render
    document.documentElement.style.setProperty('--page-transition-ms', String(transitionDuration.value))
    document.documentElement.style.setProperty('--sheet-transition-ms', String(sheetTransitionDuration.value))
    document.documentElement.style.setProperty('transition', 'none')
    document.documentElement.style.setProperty('--page-bg', color)
    requestAnimationFrame(() => {
      document.documentElement.style.removeProperty('transition')
    })
  })
}

const transitionConfig = computed(() => ({
  name: transitionName.value,
  mode: 'default' as const,
  duration: transitionName.value.startsWith('sheet')
    ? sheetTransitionDuration.value
    : transitionDuration.value,
}))
</script>

<template>
  <div style="position: relative; width: 100vw; height: 100dvh; overflow: hidden;">
    <NuxtPage :transition="transitionConfig" />
  </div>
</template>
