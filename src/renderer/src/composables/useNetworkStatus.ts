import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useToast } from './Toast'

export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine)
  const { showToast, dismissToast } = useToast()

  let offlineToastId: number | null = null

  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    if (!navigator.onLine) {
      offlineToastId = showToast('error', 'You are currently offline', 5000, 'bottom')
    }
  })

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
  })

  watch(isOnline, (newStatus) => {
    if (newStatus) {
      if (offlineToastId !== null) {
        dismissToast(offlineToastId)
        offlineToastId = null
      }
      showToast('success', 'Connection restored', 5000, 'bottom')
    } else {
      offlineToastId = showToast('error', 'You are currently offline', 5000, 'bottom')
    }
  })

  return {
    isOnline
  }
}
