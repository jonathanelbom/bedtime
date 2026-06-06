<script setup lang="ts">
import { Badge } from '~/components/ui/badge'
import { useSessionStore } from '~/composables/useSessionStore'

const { preferences } = useSessionStore()

const chips = computed(() => {
  const p = preferences.value
  return [
    p.vibe,
    p.timeOfDay,
    p.movement,
    p.mood.length ? p.mood.join(', ') : '',
    p.genres,
  ].filter(s => s !== '')
})
</script>

<template>
  <div v-if="chips.length" class="flex flex-wrap gap-2">
    <Badge
      v-for="chip in chips"
      :key="chip"
      variant="secondary"
      class="text-xs border-0 bg-white/10"
    >
      {{ chip }}
    </Badge>
  </div>
</template>
