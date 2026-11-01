// composables/useSSE.ts
import { ref, onMounted, onUnmounted, Ref } from 'vue'

const baseURL = 'https://onuman.kehem.com' // 👈 Add baseURL here

export function useSSE<T = string>(
  endpoint: string,
  parseJson = false
): {
  data: Ref<T | null>
  error: Ref<Event | null>
  close: () => void
} {
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<Event | null>(null)

  let eventSource: EventSource | null = null

  const connect = async () => {
    const token = window.encodeURIComponent(await window.electronAPI.getLicenseKey())
    const serialID = window.encodeURIComponent(await window.electronAPI.getMotherboardID())

    // 👇 Combine baseURL and endpoint
    const fullEndpoint = `${baseURL}${endpoint}`

    // 👇 Add query params for token and serialID
    const urlWithParams = `${fullEndpoint}?token=${token}&serialID=${serialID}`

    eventSource = new EventSource(urlWithParams)

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const parsed = parseJson ? JSON.parse(event.data) : event.data
        data.value = parsed as T
      } catch (err) {
        console.error('Error parsing SSE data:', err)
        error.value = event
      }
    }

    eventSource.onerror = (err: Event) => {
      console.error('SSE error:', err)
      error.value = err
    }
  }

  const close = () => {
    eventSource?.close()
    eventSource = null
  }

  onMounted(connect)
  onUnmounted(close)

  return { data, error, close }
}
