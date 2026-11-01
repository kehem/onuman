<!-- src/components/FileServer/FileUploader.vue -->
<template>
    <div class="file-uploader">
        <div v-if="error" class="error">{{ error }}</div>

        <div class="drop-area" @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false"
            @drop.prevent="handleDrop" :class="{ dragging: dragOver }">
            <p v-if="!selectedFile">Drag & drop a file here or click to browse</p>
            <p v-else>Selected: {{ selectedFile.name }}</p>
            <input type="file" class="file-input" @change="onFileChange" :disabled="uploading" />
        </div>

        <div class="file-limit">Maximum file size: 5GB</div>

        <div class="actions">
            <button @click="uploadFile" :disabled="!selectedFile || uploading">
                {{ uploading ? "Uploading..." : "Upload" }}
            </button>
        </div>

        <div class="progress-container" v-if="uploading">
            <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
            <span class="progress-text">{{ uploadProgress }}%</span>
            <button class="cancel-button" @click="cancelUpload" aria-label="Cancel Upload">
                ×
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const error = ref<string | null>(null);
const uploadProgress = ref(0);
const dragOver = ref(false);
let xhr: XMLHttpRequest | null = null;

const emit = defineEmits<{
    (e: "uploaded"): void;
}>();




const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

const serverInfo = ref<{ ip: string; port: number } | null>(null);

async function fetchServerIp() {
    try {
        const response = await fetch("http://localhost:3000/server-ip");
        if (!response.ok) throw new Error("Failed to get server IP");
        serverInfo.value = await response.json();
    } catch (e) {
        error.value = "Could not get server IP. Please check the backend.";
    }
}

const onFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    handleFileSelect(file);
};

const handleDrop = (event: DragEvent) => {
    dragOver.value = false;
    const file = event.dataTransfer?.files?.[0];
    handleFileSelect(file);
};

const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
        error.value = "File exceeds the 5GB limit.";
        return;
    }
    selectedFile.value = file;
    error.value = null;
};

const uploadFile = async () => {
    if (!selectedFile.value) {
        error.value = "Please select a file to upload.";
        return;
    }

    if (!serverInfo.value) {
        await fetchServerIp();
        if (!serverInfo.value) return; // Abort if IP fetch failed
    }

    uploading.value = true;
    uploadProgress.value = 0;
    error.value = null;

    const formData = new FormData();
    formData.append("file", selectedFile.value);

    xhr = new XMLHttpRequest();

    xhr.onerror = () => {
        console.error("XHR error:", xhr?.status, xhr?.statusText)
        error.value = "Upload error occurred.";
        uploading.value = false;
        xhr = null;
    };

    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            uploadProgress.value = Math.round((event.loaded / event.total) * 100);
        }
    };

    xhr.onload = () => {
        uploading.value = false;
        const status = xhr?.status;
        const statusText = xhr?.statusText;
        xhr = null;

        if (status && status >= 200 && status < 300) {
            selectedFile.value = null;
            const input = document.querySelector(
                "input[type=file]"
            ) as HTMLInputElement;
            if (input) input.value = "";
            emit("uploaded");
        } else {
            error.value = `Upload failed: ${statusText ?? "Unknown error"}`;
        }
    };

    xhr.onerror = () => {
        error.value = "Upload error occurred.";
        uploading.value = false;
        xhr = null;
    };

    const url = `http://${serverInfo.value.ip}:${serverInfo.value.port}/upload`;
    xhr.open("POST", url);
    xhr.send(formData);
};

const cancelUpload = () => {
    if (xhr) {
        xhr.abort();
        uploading.value = false;
        uploadProgress.value = 0;
        selectedFile.value = null;
        xhr = null;
        error.value = "Upload cancelled.";
    }
};

</script>

<style scoped>
.file-uploader {
    padding: 2rem;
    background-color: #1a1a1a;
    border-radius: 8px;
    border: 1px solid #2a2a2a;
    max-width: 700px;
    margin: 2rem auto;
    color: #e0e0e0;
    font-family: sans-serif;
}

.error {
    color: #ff4c4c;
    font-size: 0.875rem;
    margin-bottom: 1rem;
}

.drop-area {
    position: relative;
    background-color: #2a2a2a;
    border: 2px dashed #444;
    border-radius: 6px;
    padding: 3rem;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.drop-area.dragging {
    background-color: #333333;
}

.drop-area p {
    margin: 0;
    font-size: 1rem;
    color: #bbb;
}

.drop-area input[type="file"] {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}

.file-limit {
    font-size: 0.85rem;
    color: #888;
    margin-top: 0.5rem;
}

.actions {
    margin-top: 1.5rem;
    text-align: right;
}

.actions button {
    padding: 0.5rem 1.2rem;
    background-color: #444;
    border: none;
    color: #eee;
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.actions button:hover:not(:disabled) {
    background-color: #666;
}

.actions button:disabled {
    background-color: #333;
    cursor: not-allowed;
}

.progress-container {
    position: relative;
    margin-top: 1.5rem;
    height: 24px;
    background-color: #2e2e2e;
    border: 1px solid #444;
    border-radius: 4px;
    overflow: hidden;
}

.progress-bar {
    background-color: #888;
    height: 100%;
    transition: width 0.3s ease;
}

.progress-text {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    line-height: 24px;
    font-size: 0.8rem;
    color: #fff;
}

.cancel-button {
    position: absolute;
    right: 6px;
    top: 1px;
    background: transparent;
    border: none;
    color: #ccc;
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
}

.cancel-button:hover {
    color: #fff;
}
</style>
