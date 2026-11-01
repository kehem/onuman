// src/composables/useApi.ts

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ref, readonly } from 'vue'
import { useToast } from './Toast'

// Define error response type
interface ApiErrorResponse {
  message?: string
  error?: string
  details?: any
}

const { showToast } = useToast()
const BASEURL = import.meta.env.VITE_API_URL

// Global state
const retrievedKey = ref<string>('')
const motherboardID = ref<string>('')
const isInitialized = ref<boolean>(false)
const isLoading = ref<boolean>(false)

// Create axios client
const apiClient: AxiosInstance = axios.create({
  baseURL: BASEURL,
  timeout: 10000,
})

// Request interceptor
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (retrievedKey.value) {
    config.headers['Authorization'] = retrievedKey.value
  }
  if (motherboardID.value) {
    config.headers['serialID'] = motherboardID.value
  }
  config.headers['Content-Type'] = 'application/json'
  return config
})

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const message = error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An error occurred'
    showToast('info', message)
    return Promise.reject(error)
  }
)

export function useApi() {
  // Initialize function
  const initialize = async (): Promise<boolean> => {
    if (isInitialized.value) return true

    isLoading.value = true

    try {
      // Get license key
      try {
        retrievedKey.value = await window.electronAPI.getLicenseKey()
      } catch {
        console.warn('Failed to retrieve license key')
      }

      // Get motherboard ID
      try {
        motherboardID.value = await window.electronAPI.getMotherboardID()
        isInitialized.value = true
        return true
      } catch {
        showToast('error', 'FRAUD DETECTED! FAILED TO GET SERIAL ID')
        return false
      }
    } finally {
      isLoading.value = false
    }
  }

  const stripMm = (val: string): string => (val || '').replace(/mm[²³]?/gi, '').trim()
  
  // API methods
  const get = async <T = any>(url: string, config?: any): Promise<T> => {
    await initialize()
    const response = await apiClient.get<T>(url, config)
    return response.data
  }

  const post = async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    await initialize()
    const response = await apiClient.post<T>(url, data, config)
    return response.data
  }

  const put = async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    await initialize()
    const response = await apiClient.put<T>(url, data, config)
    return response.data
  }

  const del = async <T = any>(url: string, config?: any): Promise<T> => {
    await initialize()
    const response = await apiClient.delete<T>(url, config)
    return response.data
  }

  const patch = async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    await initialize()
    const response = await apiClient.patch<T>(url, data, config)
    return response.data
  }

  // Utility functions
  const setToken = (newToken: string) => {
    retrievedKey.value = newToken
  }

  const setSerialID = (id: string) => {
    motherboardID.value = id
  }

  const resetAuth = () => {
    retrievedKey.value = ''
    motherboardID.value = ''
    isInitialized.value = false
  }

  return {
    // API methods
    get,
    post,
    put,
    delete: del,
    patch,

    // Raw client (if needed)
    apiClient,

    // Auth methods
    setToken,
    setSerialID,
    resetAuth,
    initialize,
    
    // Utility functions
    stripMm,

    // State (readonly)
    isLoading: readonly(isLoading),
    isInitialized: readonly(isInitialized),
    hasToken: readonly(ref(() => !!retrievedKey.value)),
    hasSerialID: readonly(ref(() => !!motherboardID.value)),
  }
}