import { onScopeDispose, ref } from 'vue'

type GraphResponse = { rcc?: any; material_cost?: any[]; [key: string]: any }
type GraphGetter = (url: string, config?: { suppressErrorToast?: boolean }) => Promise<unknown>

// Empty successful responses are different from failed requests and malformed data.
function parseGraphResponse(response: unknown): GraphResponse | null {
  if (response == null || response === '') return null
  let data = response
  if (typeof data === 'string') {
    if (!data.trim()) return null
    try {
      data = JSON.parse(data)
    } catch {
      throw new Error('The server returned an invalid graph response.')
    }
  }
  if (data == null || (Array.isArray(data) && data.length === 0)) return null
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('The server returned an invalid graph response.')
  }
  const graph = data as GraphResponse
  if (graph.error || (graph.material_cost != null && !Array.isArray(graph.material_cost))) {
    throw new Error('The server returned an invalid graph response.')
  }
  return graph
}

function graphErrorMessage(error: unknown): string {
  const response = (error as { response?: { status?: number } })?.response
  if (typeof response?.status === 'number') {
    return `The server returned HTTP ${response.status} while loading the graph. Please try again.`
  }
  if (error instanceof Error && error.message === 'The server returned an invalid graph response.') {
    return error.message
  }
  return 'Could not load the graph. Please check your connection and try again.'
}

export function useGraphData(get: GraphGetter) {
  const graphData = ref<GraphResponse | null>(null)
  const graphError = ref('')
  const isLoading = ref(false)
  let requestId = 0

  async function loadGraphData(url: string) {
    const currentRequest = ++requestId
    isLoading.value = true
    graphError.value = ''
    graphData.value = null
    try {
      const response = await get(url, { suppressErrorToast: true })
      const data = parseGraphResponse(response)
      if (currentRequest === requestId) graphData.value = data
    } catch (error) {
      if (currentRequest === requestId) graphError.value = graphErrorMessage(error)
    } finally {
      if (currentRequest === requestId) isLoading.value = false
    }
  }

  onScopeDispose(() => { requestId++ })
  return { graphData, graphError, isLoading, loadGraphData }
}
