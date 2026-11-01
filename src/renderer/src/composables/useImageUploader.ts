// src/composables/useImageUploader.ts
import { ref, readonly } from 'vue'
import { useApi } from './useApi'
import { useToast } from './Toast'

const MAX_FILE_SIZE_MB = 2
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/gif']
const BASEURL = import.meta.env.VITE_API_URL + '/';

export function useImageUploader() {
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const imageUrl = ref<string | null>(null)

  const { showToast } = useToast()

  // VALIDATE IMAGE FILE
  function validateImage(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'NO FILE PROVIDED.' }
    }

    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'PLEASE SELECT A VALID IMAGE FILE.' }
    }

    if (file.type === 'image/webp') {
      return {
        valid: false,
        error: 'WEBP FORMAT IS NOT SUPPORTED. PLEASE USE JPG, PNG, OR GIF.',
      }
    }

    if (!SUPPORTED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'UNSUPPORTED IMAGE FORMAT. USE JPG, PNG, OR GIF.',
      }
    }

    const maxSize = MAX_FILE_SIZE_MB * 1024 * 1024
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2)
      return {
        valid: false,
        error: `FILE SIZE (${sizeMB}MB) EXCEEDS THE ${MAX_FILE_SIZE_MB}MB LIMIT.`,
      }
    }

    return { valid: true }
  }

  // UPLOAD IMAGE TO SERVER
  async function uploadToServer(file: File): Promise<string> {
    try {
      const { post } = useApi()

      const formData = new FormData()
      formData.append('image', file, file.name)

      const response = await post<{ status?: string; image_url?: string }>('/api/img_upload', formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            uploadProgress.value = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
          }
        },
        transformRequest: [(data) => data], // LET BROWSER SET HEADERS AUTOMATICALLY
      })

      if (response?.status === 'success' && response?.image_url) {
        return response.image_url
      } else {
        throw new Error('SERVER DID NOT RETURN IMAGE URL.')
      }
    } catch (error: any) {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          `SERVER ERROR (${error.response.status})`
        throw new Error(message)
      } else if (error.request) {
        throw new Error('NETWORK ERROR. PLEASE CHECK YOUR CONNECTION.')
      } else {
        throw new Error(error.message || 'IMAGE UPLOAD FAILED.')
      }
    }
  }

  async function handleFileChange(
    event: Event,
    options?: {
      onSuccess?: (url: string) => void
      onError?: (error: string) => void
    }
  ) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    // RESET PREVIOUS STATE
    reset()

    if (!file) return

    // VALIDATE IMAGE FILE
    const validation = validateImage(file)
    if (!validation.valid) {
      showToast('error', validation.error!)
      target.value = ''
      options?.onError?.(validation.error!)
      return
    }

    try {
      // SET UPLOADING STATE AND START UPLOAD
      isUploading.value = true
      const url = await uploadToServer(file)
      imageUrl.value = BASEURL + url

      // SHOW SUCCESS TOAST
      showToast('success', 'IMAGE UPLOADED SUCCESSFULLY.')
      options?.onSuccess?.(url)
    } catch (error: any) {
      console.error('UPLOAD ERROR:', error)
      const message = error.message || 'IMAGE UPLOAD FAILED.'
      showToast('error', message)
      reset()
      options?.onError?.(message)
      target.value = ''
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  // RESET STATE TO INITIAL VALUES
  function reset() {
    isUploading.value = false
    uploadProgress.value = 0
    imageUrl.value = null
  }

  return {
    // STATE (READONLY)
    isUploading: readonly(isUploading),
    loading: readonly(isUploading),
    uploadProgress: readonly(uploadProgress),
    imageURL: imageUrl,

    // MAIN METHOD
    handleFileChange,
    // UTILITY METHODS
    reset,
  }
}