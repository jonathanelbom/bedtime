<script setup lang="ts">
import { useRouteTransitionState } from '~/composables/useRouteTransitionState'

const { transitionName } = useRouteTransitionState()

const transitionConfig = computed(() => ({
  name: transitionName.value,
  mode: 'default' as const,
  duration: 400,
}))
</script>

<template>
  <div style="position: relative; width: 100vw; height: 100dvh; overflow: hidden;">
    <NuxtPage :transition="transitionConfig" />
  </div>
</template>
