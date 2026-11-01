// src/composables/useImgBBUploader.ts
import { ref, readonly } from 'vue'
import { useToast } from './Toast'

// CONSTANTS
const MAX_FILE_SIZE_MB = 25
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const IMGBB_API_KEY = '3926592c06337de985eef0a879d225d1'
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload'

export function useImgBBUploader() {
    // STATE
    const isUploading = ref(false)
    const imageUrl = ref<string | null>(null)
    const imageData = ref<any>(null)
    const { showToast } = useToast()

    // VALIDATE IMAGE FILE
    function validateImage(file: File): { valid: boolean; error?: string } {
        if (!file) return { valid: false, error: 'NO FILE PROVIDED.' }
        if (!file.type.startsWith('image/')) return { valid: false, error: 'PLEASE SELECT A VALID IMAGE FILE.' }
        if (!SUPPORTED_TYPES.includes(file.type)) return { valid: false, error: 'UNSUPPORTED IMAGE FORMAT. USE JPG, PNG, GIF, OR WEBP.' }

        const maxSize = MAX_FILE_SIZE_MB * 1024 * 1024
        if (file.size > maxSize) {
            const sizeMB = (file.size / 1024 / 1024).toFixed(2)
            return { valid: false, error: `FILE SIZE (${sizeMB}MB) EXCEEDS THE ${MAX_FILE_SIZE_MB}MB LIMIT.` }
        }
        return { valid: true }
    }

    // UPLOAD TO IMGBB
    async function uploadToImgBB(file: File, options?: { name?: string; expiration?: number }) {
        try {
            const formData = new FormData()
            formData.append('key', IMGBB_API_KEY)
            formData.append('image', file)

            if (options?.name) formData.append('name', options.name)
            if (options?.expiration) {
                const exp = Math.max(60, Math.min(15552000, options.expiration))
                formData.append('expiration', exp.toString())
            }

            const response = await fetch(IMGBB_API_URL, { method: 'POST', body: formData })
            if (!response.ok) throw new Error(`HTTP ERROR! STATUS: ${response.status}`)

            const data = await response.json()
            if (data.success) {
                return {
                    url: data.data.url,
                    displayUrl: data.data.display_url,
                    thumbUrl: data.data.thumb.url,
                    mediumUrl: data.data.medium.url,
                    deleteUrl: data.data.delete_url,
                    imageInfo: {
                        id: data.data.id,
                        title: data.data.title,
                        filename: data.data.image.filename,
                        size: data.data.size,
                        width: data.data.width,
                        height: data.data.height,
                        mime: data.data.image.mime
                    }
                }
            } else {
                throw new Error(data.error?.message || 'IMGBB UPLOAD FAILED')
            }
        } catch (error: any) {
            if (error.message.includes('HTTP ERROR')) throw new Error('IMGBB SERVICE ERROR. PLEASE TRY AGAIN.')
            if (error.name === 'TypeError') throw new Error('NETWORK ERROR. PLEASE CHECK YOUR CONNECTION.')
            throw new Error(error.message || 'IMAGE UPLOAD FAILED.')
        }
    }

    // HANDLE FILE CHANGE
    async function handleFileChange(event: Event, options?: {
        onSuccess?: (data: any) => void
        onError?: (error: string) => void
        useDisplayUrl?: boolean
        customName?: string
        expiration?: number
    }) {
        const target = event.target as HTMLInputElement
        const file = target.files?.[0]

        reset()
        if (!file) return

        const validation = validateImage(file)
        if (!validation.valid) {
            showToast('error', validation.error!)
            target.value = ''
            options?.onError?.(validation.error!)
            return
        }

        try {
            isUploading.value = true
            const uploadResult = await uploadToImgBB(file, {
                name: options?.customName,
                expiration: options?.expiration
            })

            imageUrl.value = options?.useDisplayUrl ? uploadResult.displayUrl : uploadResult.url
            imageData.value = uploadResult

            showToast('success', 'IMAGE UPLOADED SUCCESSFULLY.')
            options?.onSuccess?.(uploadResult)
        } catch (error: any) {
            console.error('IMGBB UPLOAD ERROR:', error)
            const message = error.message || 'IMAGE UPLOAD FAILED.'
            showToast('error', message)
            reset()
            options?.onError?.(message)
            target.value = ''
        } finally {
            isUploading.value = false
        }
    }

    // RESET STATE
    function reset() {
        isUploading.value = false
        imageUrl.value = null
        imageData.value = null
    }

    // RETURN INTERFACE
    return {
        isUploading: readonly(isUploading),
        loading: readonly(isUploading),
        imageURL: imageUrl,
        imageData: readonly(imageData),
        handleFileChange,
        reset
    }
}