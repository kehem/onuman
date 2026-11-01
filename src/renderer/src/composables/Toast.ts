import { createApp, h, reactive } from 'vue'
import ToastNotification from '../components/Initializers/Toast.vue'

type ToastDuration = number | 'infinite'

type ToastType =
  | 'success'
  | 'error'
  | 'info'
  | 'warning'
  | 'critical'
  | 'loading'
  | 'notification'
  | 'help'
  | 'maintenance'
  | 'reminder'

interface ToastOptions {
  message: string
  type: ToastType
  duration: ToastDuration
  position: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
  transition?: 'slide' | 'fade' | 'bounce'
  icon?: boolean
  showClose?: boolean
  showProgress?: boolean
  closeOnClick?: boolean
}

interface ToastInstance {
  id: number
  options: ToastOptions
  app: ReturnType<typeof createApp>
  container: HTMLDivElement
}

export function useToast() {
  const toasts: ToastInstance[] = reactive([])
  let toastId = 0

  const showToast = (
    type: ToastType,
    message: string,
    duration: ToastDuration = 3000,
    position:
      | 'right-bottom'
      | 'right-top'
      | 'left-top'
      | 'left-bottom'
      | 'top'
      | 'bottom' = 'right-bottom'
  ): number => {
    const positionMap: Record<string, 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'> = {
      'right-bottom': 'bottom-right',
      'right-top': 'top-right',
      'left-top': 'top-left',
      'left-bottom': 'bottom-left',
      top: 'top-left',
      bottom: 'bottom-left'
    }

    const id = toastId++

    const toastOptions: ToastOptions = {
      type,
      message,
      duration,
      position: positionMap[position] || 'bottom-right',
      transition: 'slide',
      icon: true,
      showClose: true,
      showProgress: duration !== 'infinite',
      closeOnClick: false
    }

    const toastState = reactive({
      ...toastOptions,
      visible: true
    })

    const container = document.createElement('div')
    document.body.appendChild(container)

    const app = createApp({
      render() {
        return h(ToastNotification, {
          message: toastState.message,
          type: toastState.type, // Correctly passed type
          duration: typeof toastState.duration === 'number' ? toastState.duration : 0,
          visible: toastState.visible,
          position: toastState.position,
          transition: toastState.transition,
          icon: toastState.icon,
          showClose: toastState.showClose,
          showProgress: toastState.showProgress,
          closeOnClick: toastState.closeOnClick
        })
      }
    })

    app.mount(container)

    const toastInstance: ToastInstance = { id, options: toastOptions, app, container }
    toasts.push(toastInstance)

    if (typeof duration === 'number') {
      setTimeout(() => dismissToast(id), duration)
    }

    return id
  }

  const dismissToast = (id: number) => {
    const index = toasts.findIndex((t) => t.id === id)
    if (index !== -1) {
      const toast = toasts[index]
      toast.app.unmount()
      document.body.removeChild(toast.container)
      toasts.splice(index, 1)
    }
  }

  return { showToast, dismissToast }
}
