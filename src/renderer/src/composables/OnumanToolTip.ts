import { ref, onMounted, onUnmounted } from 'vue'

export function useOnumanToolTip() {
  const isVisible = ref(false)
  const tooltipRef = ref<HTMLElement | null>(null)
  const triggerRef = ref<HTMLElement | null>(null)

  const showTooltip = () => {
    isVisible.value = true
  }

  const hideTooltip = () => {
    isVisible.value = false
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      tooltipRef.value &&
      triggerRef.value &&
      !tooltipRef.value.contains(event.target as Node) &&
      !triggerRef.value.contains(event.target as Node)
    ) {
      hideTooltip()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  return {
    isVisible,
    tooltipRef,
    triggerRef,
    showTooltip,
    hideTooltip
  }
}
