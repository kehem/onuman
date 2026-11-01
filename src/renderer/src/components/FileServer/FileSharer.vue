<!-- src/components/FileServer/FileSharer.vue -->
<template>
    <div class="file-sharer">
        <h2>📤 Share Files</h2>

        <!-- Debug Info -->
        <div class="debug-info">
            <h4>🔍 Debug Information</h4>
            <p><strong>Server Status:</strong> {{ serverStatus }}</p>
            <p><strong>Last API Call:</strong> {{ lastApiCall }}</p>
            <p><strong>Current User IP:</strong> {{ currentUserIp }}</p>
            <button @click="testConnection" class="test-btn" :disabled="testing">
                {{ testing ? 'Testing...' : 'Test Server Connection' }}
            </button>
        </div>

        <div v-if="error" class="error">{{ error }}</div>

        <div class="drop-area" @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false"
            @drop.prevent="handleDrop" @click="selectFile" :class="{ dragging: dragOver }">
            <p>Drag & drop files here or click to browse</p>
            <p class="hint">Files will be shared directly from your device (no upload needed)</p>
        </div>

        <!-- Shared Files List -->
        <div v-if="sharedFiles.length > 0" class="shared-files">
            <h3>Your Shared Files</h3>
            <div v-for="(file, index) in sharedFiles" :key="index" class="shared-file">
                <div class="file-info">
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    <span class="file-path" :title="file.path">{{ file.path }}</span>
                </div>
                <button @click="unshareFile(index)" class="unshare-btn" :disabled="unsharing === index">
                    {{ unsharing === index ? 'Removing...' : 'Remove' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface SharedFile {
    path: string;
    name: string;
    size: number;
}

const dragOver = ref(false);
const error = ref<string | null>(null);
const sharedFiles = ref<SharedFile[]>([]);
const serverStatus = ref('Checking...');
const lastApiCall = ref('None');
const currentUserIp = ref('Unknown');
const testing = ref(false);
const unsharing = ref<number | null>(null);

const emit = defineEmits<{
    (e: "filesUpdated"): void;
}>();

// Test server connection
const testConnection = async () => {
    testing.value = true;
    lastApiCall.value = 'Testing connection...';

    try {
        // Test basic connectivity
        const pingResponse = await fetch("http://localhost:3000/ping");
        if (!pingResponse.ok) {
            throw new Error(`Ping failed: ${pingResponse.status} - ${pingResponse.statusText}`);
        }

        const pingData = await pingResponse.json();
        console.log('Ping successful:', pingData);

        // Test server IP endpoint
        const ipResponse = await fetch("http://localhost:3000/server-ip");
        if (!ipResponse.ok) {
            throw new Error(`Server IP failed: ${ipResponse.status} - ${ipResponse.statusText}`);
        }

        const ipData = await ipResponse.json();
        currentUserIp.value = ipData.ip;
        console.log('Server IP:', ipData);

        // Test active users endpoint
        const usersResponse = await fetch("http://localhost:3000/active-users");
        if (!usersResponse.ok) {
            throw new Error(`Active users failed: ${usersResponse.status} - ${usersResponse.statusText}`);
        }

        const usersData = await usersResponse.json();
        console.log('Active users:', usersData);

        serverStatus.value = 'Connected ✅';
        lastApiCall.value = 'All tests passed';
        error.value = null;

    } catch (err) {
        console.error('Connection test failed:', err);
        serverStatus.value = 'Failed ❌';
        lastApiCall.value = `Error: ${err instanceof Error ? err.message : String(err)}`;
        error.value = `Connection test failed: ${err instanceof Error ? err.message : String(err)}`;
    } finally {
        testing.value = false;
    }
};

const selectFile = async () => {
    lastApiCall.value = 'Selecting file...';
    try {
        if (window.electronAPI) {
            const filePaths = await window.electronAPI.selectFile();
            console.log('Selected file paths:', filePaths);

            if (filePaths && filePaths.length > 0) {
                for (const filePath of filePaths) {
                    await shareFile(filePath);
                }
            } else {
                lastApiCall.value = 'No files selected';
            }
        } else {
            throw new Error('Electron API not available');
        }
    } catch (err) {
        console.error('File selection error:', err);
        error.value = `File selection error: ${err instanceof Error ? err.message : String(err)}`;
        lastApiCall.value = `File selection failed: ${err instanceof Error ? err.message : String(err)}`;
    }
};

const handleDrop = async (event: DragEvent) => {
    dragOver.value = false;
    const files = event.dataTransfer?.files;

    if (files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // In Electron, we can access the file path
            if ((file as any).path) {
                await shareFile((file as any).path);
            } else {
                console.warn('File path not available for dropped file:', file.name);
                error.value = 'File path not available. Please use the file browser instead.';
            }
        }
    }
};

const shareFile = async (filePath: string) => {
    const fileName = filePath.split(/[\\/]/).pop() || 'Unknown';
    lastApiCall.value = `Sharing file: ${fileName}`;

    try {
        console.log('Attempting to share file:', { filePath, fileName });

        const requestBody = {
            filePath,
            fileName,
        };

        console.log('Request body:', requestBody);

        const response = await fetch("http://localhost:3000/share-file", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        console.log('Share file response status:', response.status);
        const headersObj: Record<string, string> = {};
        response.headers.forEach((value, key) => {
            headersObj[key] = value;
        });
        console.log('Share file response headers:', headersObj);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Share file error response:', errorText);
            throw new Error(`Failed to share file: ${response.status} - ${response.statusText}\nDetails: ${errorText}`);
        }

        const result = await response.json();
        console.log('Share file success:', result);

        sharedFiles.value.push(result.file);
        emit("filesUpdated");
        error.value = null;
        lastApiCall.value = `Successfully shared: ${fileName}`;

    } catch (err) {
        console.error('Share file error:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        error.value = `Share error: ${errorMessage}`;
        lastApiCall.value = `Share failed: ${errorMessage}`;
    }
};

const unshareFile = async (index: number) => {
    unsharing.value = index;
    const fileName = sharedFiles.value[index]?.name || 'Unknown';
    lastApiCall.value = `Unsharing file: ${fileName}`;

    try {
        console.log('Attempting to unshare file at index:', index);

        const response = await fetch(`http://localhost:3000/unshare-file/${index}`, {
            method: "DELETE",
        });

        console.log('Unshare response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Unshare error response:', errorText);
            throw new Error(`Failed to unshare file: ${response.status} - ${response.statusText}\nDetails: ${errorText}`);
        }

        const result = await response.json();
        console.log('Unshare success:', result);

        sharedFiles.value.splice(index, 1);
        emit("filesUpdated");
        lastApiCall.value = `Successfully unshared: ${fileName}`;

    } catch (err) {
        console.error('Unshare error:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        error.value = `Unshare error: ${errorMessage}`;
        lastApiCall.value = `Unshare failed: ${errorMessage}`;
    } finally {
        unsharing.value = null;
    }
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const loadSharedFiles = async () => {
    lastApiCall.value = 'Loading shared files...';
    try {
        console.log('Loading shared files...');

        const response = await fetch("http://localhost:3000/active-users");
        console.log('Active users response status:', response.status);

        if (response.ok) {
            const result = await response.json();
            console.log('Active users data:', result);

            const currentUserIp = await getCurrentUserIp();
            console.log('Current user IP:', currentUserIp);

            const currentUser = result.users.find((u: any) => u.ip === currentUserIp);
            console.log('Current user found:', currentUser);

            if (currentUser) {
                sharedFiles.value = currentUser.sharedFiles || [];
                console.log('Loaded shared files:', sharedFiles.value);
                lastApiCall.value = `Loaded ${sharedFiles.value.length} shared files`;
            } else {
                sharedFiles.value = [];
                lastApiCall.value = 'Current user not found in active users';
            }
        } else {
            const errorText = await response.text();
            console.error('Load shared files error:', errorText);
            throw new Error(`Failed to load shared files: ${response.status} - ${response.statusText}`);
        }
    } catch (err) {
        console.error("Failed to load shared files:", err);
        lastApiCall.value = `Load failed: ${err instanceof Error ? err.message : String(err)}`;
    }
};

const getCurrentUserIp = async (): Promise<string> => {
    try {
        const response = await fetch("http://localhost:3000/server-ip");
        if (!response.ok) {
            throw new Error(`Server IP request failed: ${response.status}`);
        }
        const result = await response.json();
        return result.ip;
    } catch (err) {
        console.error('Get current user IP error:', err);
        return '127.0.0.1';
    }
};

onMounted(() => {
    console.log('FileSharer component mounted');
    testConnection();
    loadSharedFiles();
});

defineExpose({ loadSharedFiles });
</script>

<style scoped>
.file-sharer {
    padding: 2rem;
    background-color: #1a1a1a;
    border-radius: 10px;
    color: #ddd;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.debug-info {
    background-color: #2a2a2a;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    border-left: 4px solid #4fc3f7;
}

.debug-info h4 {
    margin: 0 0 0.5rem 0;
    color: #4fc3f7;
}

.debug-info p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
}

.test-btn {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #4fc3f7;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
}

.test-btn:hover:not(:disabled) {
    background-color: #29b6f6;
}

.test-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

h2 {
    font-size: 1.6rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #f1f1f1;
}

.error {
    background-color: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.3);
    color: #e57373;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    white-space: pre-wrap;
}

.drop-area {
    border: 2px dashed #555;
    border-radius: 10px;
    padding: 3rem;
    text-align: center;
    cursor: pointer;
    background-color: #2a2a2a;
    transition: all 0.3s ease;
    margin-bottom: 2rem;
}

.drop-area:hover {
    border-color: #4fc3f7;
    background-color: rgba(79, 195, 247, 0.05);
}

.drop-area.dragging {
    border-color: #4fc3f7;
    background-color: rgba(79, 195, 247, 0.1);
    transform: scale(1.02);
}

.drop-area p {
    margin: 0.5rem 0;
    color: #ccc;
}

.hint {
    font-size: 0.85rem;
    color: #888;
}

.shared-files {
    background-color: #2a2a2a;
    border-radius: 8px;
    padding: 1.5rem;
}

.shared-files h3 {
    margin: 0 0 1rem 0;
    color: #4fc3f7;
}

.shared-file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background-color: #333;
    border-radius: 6px;
    margin-bottom: 0.5rem;
}

.file-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.file-name {
    font-weight: 500;
    color: #f1f1f1;
}

.file-size {
    font-size: 0.85rem;
    color: #aaa;
}

.file-path {
    font-size: 0.75rem;
    color: #666;
    font-family: monospace;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.unshare-btn {
    padding: 0.5rem 1rem;
    background-color: #d32f2f;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    min-width: 90px;
}

.unshare-btn:hover:not(:disabled) {
    background-color: #b71c1c;
}

.unshare-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>