import { ref } from 'vue'

export const useRouteTransitionState = () => {
  const router = useRouter()
  const transitionName = ref('push')

  router.beforeEach((to, from) => {
    const toIndex = (to.meta?.pageIndex as number) ?? 0
    const fromIndex = (from.meta?.pageIndex as number) ?? 0
    transitionName.value =
      toIndex === fromIndex ? 'fade' : toIndex > fromIndex ? 'push' : 'pop'
  })

  return { transitionName }
}
