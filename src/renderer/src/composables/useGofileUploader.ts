// src/composables/useGofileUploader.ts
import { ref, readonly } from 'vue'
import { useToast } from './Toast'

// CONSTANTS
const MAX_FILE_SIZE_MB = 500 // Gofile has higher limits
const GOFILE_API_TOKEN = 'FxJ5FX8CuKiwIgoY4jnJEnjMS1tmJUeL'
const GOFILE_UPLOAD_URL = 'https://upload.gofile.io/uploadfile'
const GOFILE_API_BASE = 'https://api.gofile.io'

// Regional upload endpoints for optimization
const REGIONAL_ENDPOINTS = {
    auto: 'https://upload.gofile.io/uploadfile',
    eu: 'https://upload-eu-par.gofile.io/uploadfile',
    na: 'https://upload-na-phx.gofile.io/uploadfile',
    ap_sgp: 'https://upload-ap-sgp.gofile.io/uploadfile',
    ap_hkg: 'https://upload-ap-hkg.gofile.io/uploadfile',
    ap_tyo: 'https://upload-ap-tyo.gofile.io/uploadfile',
    sa: 'https://upload-sa-sao.gofile.io/uploadfile'
}

export type GofileRegion = keyof typeof REGIONAL_ENDPOINTS

export interface GofileUploadOptions {
    folderId?: string
    region?: GofileRegion
    onSuccess?: (data: any) => void
    onError?: (error: string) => void
}

export function useGofileUploader() {
    // STATE
    const isUploading = ref(false)
    const fileUrl = ref<string | null>(null)
    const fileData = ref<any>(null)
    const { showToast } = useToast()

    // VALIDATE FILE
    function validateFile(file: File): { valid: boolean; error?: string } {
        if (!file) return { valid: false, error: 'NO FILE PROVIDED.' }

        const maxSize = MAX_FILE_SIZE_MB * 1024 * 1024
        if (file.size > maxSize) {
            const sizeMB = (file.size / 1024 / 1024).toFixed(2)
            return { valid: false, error: `FILE SIZE (${sizeMB}MB) EXCEEDS THE ${MAX_FILE_SIZE_MB}MB LIMIT.` }
        }
        return { valid: true }
    }

    // UPLOAD TO GOFILE
    async function uploadToGofile(file: File, options?: GofileUploadOptions) {
        try {
            const formData = new FormData()
            formData.append('file', file)

            if (options?.folderId) {
                formData.append('folderId', options.folderId)
            }

            const uploadUrl = options?.region ? REGIONAL_ENDPOINTS[options.region] : GOFILE_UPLOAD_URL

            const response = await fetch(uploadUrl, {

                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GOFILE_API_TOKEN}`
                },
                body: formData
            })

            if (!response.ok) {
                throw new Error(`HTTP ERROR! STATUS: ${response.status}`)
            }

            const result = await response.json()

            if (result.status === 'ok') {
                // RETURN THE ACTUAL RESPONSE STRUCTURE
                return {
                    downloadPage: result.data.downloadPage,
                    code: result.data.parentFolderCode,
                    parentFolder: result.data.parentFolder,
                    fileId: result.data.id,
                    fileName: result.data.name,
                    fileSize: result.data.size,
                    md5: result.data.md5,
                    mimeType: result.data.mimetype,
                    guestToken: result.data.guestToken,
                    servers: result.data.servers,
                    createTime: result.data.createTime,
                    modTime: result.data.modTime,
                    // CREATE DIRECT LINK USING THE SERVERS INFO
                    directLink: `https://${result.data.servers[0]}.gofile.io/download/web/${result.data.id}/${result.data.name}`
                }
            } else {
                throw new Error(result.error || 'GOFILE UPLOAD FAILED')
            }
        } catch (error: any) {
            if (error.message.includes('HTTP ERROR')) {
                throw new Error('GOFILE SERVICE ERROR. PLEASE TRY AGAIN.')
            }
            if (error.name === 'TypeError') {
                throw new Error('NETWORK ERROR. PLEASE CHECK YOUR CONNECTION.')
            }
            throw new Error(error.message || 'FILE UPLOAD FAILED.')
        }
    }

    // CREATE FOLDER
    async function createFolder(parentFolderId: string, folderName?: string) {
        try {
            const response = await fetch(`${GOFILE_API_BASE}/contents/createFolder`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GOFILE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    parentFolderId,
                    folderName
                })
            })

            if (!response.ok) {
                throw new Error(`HTTP ERROR! STATUS: ${response.status}`)
            }

            const data = await response.json()
            if (data.status === 'ok') {
                return data.data
            } else {
                throw new Error(data.error || 'FOLDER CREATION FAILED')
            }
        } catch (error: any) {
            throw new Error(error.message || 'FOLDER CREATION FAILED.')
        }
    }

    // GET FOLDER CONTENTS
    async function getFolderContents(folderId: string, password?: string) {
        try {
            const url = new URL(`${GOFILE_API_BASE}/contents/${folderId}`)
            if (password) {
                // Hash password with SHA-256 if needed
                url.searchParams.append('password', password)
            }

            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${GOFILE_API_TOKEN}`
                }
            })

            if (!response.ok) {
                throw new Error(`HTTP ERROR! STATUS: ${response.status}`)
            }

            const data = await response.json()
            if (data.status === 'ok') {
                return data.data
            } else {
                throw new Error(data.error || 'FAILED TO GET FOLDER CONTENTS')
            }
        } catch (error: any) {
            throw new Error(error.message || 'FAILED TO GET FOLDER CONTENTS.')
        }
    }

    // DELETE CONTENT
    async function deleteContent(contentIds: string[]) {
        try {
            const response = await fetch(`${GOFILE_API_BASE}/contents`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${GOFILE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contentsId: contentIds.join(',')
                })
            })

            if (!response.ok) {
                throw new Error(`HTTP ERROR! STATUS: ${response.status}`)
            }

            const data = await response.json()
            if (data.status === 'ok') {
                return data.data
            } else {
                throw new Error(data.error || 'DELETE FAILED')
            }
        } catch (error: any) {
            throw new Error(error.message || 'DELETE FAILED.')
        }
    }

    // HANDLE FILE CHANGE
    async function handleFileChange(event: Event, options?: GofileUploadOptions) {
        const target = event.target as HTMLInputElement
        const file = target.files?.[0]

        reset()
        if (!file) return

        const validation = validateFile(file)
        if (!validation.valid) {
            showToast('error', validation.error!)
            target.value = ''
            options?.onError?.(validation.error!)
            return
        }

        try {
            isUploading.value = true
            const uploadResult = await uploadToGofile(file, options)

            fileUrl.value = uploadResult.downloadPage
            fileData.value = uploadResult

            showToast('success', 'FILE UPLOADED SUCCESSFULLY.')
            options?.onSuccess?.(uploadResult)
        } catch (error: any) {
            console.error('GOFILE UPLOAD ERROR:', error)
            const message = error.message || 'FILE UPLOAD FAILED.'
            showToast('error', message)
            reset()
            options?.onError?.(message)
            target.value = ''
        } finally {
            isUploading.value = false
        }
    }

    // HANDLE MULTIPLE FILES
    interface UploadResult {
        file: string
        [key: string]: any
    }

    async function handleMultipleFiles(files: FileList, options?: GofileUploadOptions) {
        const results: UploadResult[] = []
        const errors: string[] = []

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const validation = validateFile(file)

            if (!validation.valid) {
                errors.push(`${file.name}: ${validation.error}`)
                continue
            }

            try {
                isUploading.value = true
                const result = await uploadToGofile(file, options)
                results.push({ file: file.name, ...result })
            } catch (error: any) {
                errors.push(`${file.name}: ${error.message}`)
            }
        }

        isUploading.value = false

        if (errors.length > 0) {
            showToast('error', `SOME UPLOADS FAILED: ${errors.join(', ')}`)
        }

        if (results.length > 0) {
            showToast('success', `${results.length} FILES UPLOADED SUCCESSFULLY.`)
            options?.onSuccess?.(results)
        }

        return { results, errors }
    }


    // RESET STATE
    function reset() {
        isUploading.value = false
        fileUrl.value = null
        fileData.value = null
    }

    // RETURN INTERFACE
    return {
        // State
        isUploading: readonly(isUploading),
        loading: readonly(isUploading),
        fileURL: fileUrl,
        fileData: fileData,

        // Methods
        handleFileChange,
        handleMultipleFiles,
        uploadToGofile,
        createFolder,
        getFolderContents,
        deleteContent,
        reset,

        // Utils
        validateFile,

        // Constants
        REGIONAL_ENDPOINTS
    }
}