<!-- src/components/FileServer/NetworkUsers.vue -->
<template>
    <div class="network-users">
        <h2>👥 Active Users</h2>

        <div v-if="loading" class="loading">Discovering users...</div>
        <div v-else-if="error" class="error">{{ error }}</div>

        <div v-else-if="users.length === 0" class="no-users">
            No other users found on the network
        </div>

        <div v-else class="users-list">
            <div v-for="user in users" :key="user.id" class="user-card">
                <div class="user-info">
                    <h3>{{ user.hostname }}</h3>
                    <p class="user-ip">{{ user.ip }}</p>
                    <p class="last-seen">Last seen: {{ formatLastSeen(user.lastSeen) }}</p>
                </div>

                <div v-if="user.sharedFiles && user.sharedFiles.length > 0" class="shared-files">
                    <h4>Shared Files ({{ user.sharedFiles.length }})</h4>
                    <div class="file-list">
                        <div v-for="(file, index) in user.sharedFiles" :key="index" class="file-item">
                            <div class="file-details">
                                <span class="file-name">{{ file.name }}</span>
                                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                            </div>
                            <button @click="downloadFile(user.id, index, file.name)" class="download-btn"
                                :disabled="downloading === `${user.id}-${index}`">
                                {{ downloading === `${user.id}-${index}` ? 'Downloading...' : 'Download' }}
                            </button>
                        </div>
                    </div>
                </div>

                <div v-else class="no-files">
                    No files shared
                </div>
            </div>
        </div>

        <button @click="refreshUsers" class="refresh-btn" :disabled="loading">
            {{ loading ? 'Refreshing...' : 'Refresh Users' }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface SharedFile {
    path: string;
    name: string;
    size: number;
}

interface NetworkUser {
    id: string;
    hostname: string;
    ip: string;
    lastSeen: number;
    sharedFiles: SharedFile[];
}

const users = ref<NetworkUser[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const downloading = ref<string | null>(null);
let refreshInterval: NodeJS.Timeout | null = null;

const fetchUsers = async () => {
    loading.value = true;
    error.value = null;

    try {
        const response = await fetch("http://localhost:3000/active-users");
        if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.statusText}`);
        }

        const result = await response.json();
        users.value = result.users || [];
    } catch (err) {
        error.value = `Failed to fetch users: ${err instanceof Error ? err.message : String(err)}`;
        users.value = [];
    } finally {
        loading.value = false;
    }
};

const downloadFile = async (userId: string, fileIndex: number, fileName: string) => {
    const downloadKey = `${userId}-${fileIndex}`;
    downloading.value = downloadKey;

    try {
        const response = await fetch(`http://localhost:3000/download-shared/${userId}/${fileIndex}`);

        if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
        }

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (err) {
        error.value = `Download error: ${err instanceof Error ? err.message : String(err)}`;
    } finally {
        downloading.value = null;
    }
};

const refreshUsers = () => {
    fetchUsers();
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatLastSeen = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
};

onMounted(() => {
    fetchUsers();

    // Auto-refresh every 10 seconds
    refreshInterval = setInterval(() => {
        fetchUsers();
    }, 10000);
});

onUnmounted(() => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});

defineExpose({ fetchUsers });
</script>