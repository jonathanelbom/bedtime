import { ref } from 'vue'
import { SECTION_ORDER } from '~/types/chat'
import type { RouteLocationNormalized } from 'vue-router'

const getPageIndex = (route: RouteLocationNormalized): number => {
  if (route.name === 'sections-key' && route.params.key) {
    const sectionIndex = (SECTION_ORDER as string[]).indexOf(route.params.key as string)
    return sectionIndex === -1 ? 2 : 2 + sectionIndex
  }
  return (route.meta?.pageIndex as number) ?? 0
}

export const useRouteTransitionState = () => {
  const router = useRouter()
  const transitionName = ref('push')

  router.beforeEach((to, from) => {
    if (to.name === 'chat') {
      transitionName.value = 'sheet'
      return
    }
    if (from.name === 'chat') {
      transitionName.value = 'sheet-pop'
      return
    }
    const toIndex = getPageIndex(to)
    const fromIndex = getPageIndex(from)
    transitionName.value =
      toIndex === fromIndex ? 'fade' : toIndex > fromIndex ? 'push' : 'pop'
  })

  return { transitionName }
}
