<!-- src/pages/Welcome/FileShare.vue -->
<template>
    <DefaultLayouts>
        <div class="file-server-container">
            <!-- Server Status -->
            <div class="server-status" :class="{ connected: serverConnected, disconnected: !serverConnected }">
                <span class="status-indicator"></span>
                <span class="status-text">
                    {{ serverConnected ? `Server: ${serverAddress}` : 'Server Disconnected' }}
                </span>
                <button @click="checkConnection" class="refresh-btn" :disabled="checking">
                    {{ checking ? 'Checking...' : '🔄' }}
                </button>
            </div>

            <!-- Tab Navigation -->
            <div class="tab-navigation">
                <button @click="activeTab = 'share'" :class="{ active: activeTab === 'share' }" class="tab-btn">
                    🔗 Share Files
                </button>
                <button @click="activeTab = 'network'" :class="{ active: activeTab === 'network' }" class="tab-btn">
                    👥 Network Users
                </button>
            </div>

            <!-- Tab Content -->
            <div class="tab-content">
                <!-- Share Tab -->
                <div v-if="activeTab === 'share'" class="tab-pane">
                    <FileSharer @filesUpdated="refreshNetworkUsers" />
                </div>

                <!-- Network Users Tab -->
                <div v-if="activeTab === 'network'" class="tab-pane">
                    <NetworkUsers ref="networkUsers" />
                </div>
            </div>
        </div>
        <BottomBar />
    </DefaultLayouts>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FileSharer from '../../components/FileServer/FileSharer.vue'
import NetworkUsers from '../../components/FileServer/NetworkUsers.vue'
import DefaultLayouts from '../../layouts/DefaultLayouts.vue';
import BottomBar from '../../components/Dashboard/BottomBar.vue';

const activeTab = ref('share') // Default to share tab
const networkUsers = ref<InstanceType<typeof NetworkUsers> | null>(null)
const serverConnected = ref(false)
const serverAddress = ref('')
const checking = ref(false)

// Check server connection
const checkConnection = async () => {
    checking.value = true
    try {
        const response = await fetch('http://localhost:3000/ping')
        if (response.ok) {
            serverConnected.value = true

            // Get server address
            const serverResponse = await fetch('http://localhost:3000/server-ip')
            if (serverResponse.ok) {
                const data = await serverResponse.json()
                serverAddress.value = `${data.ip}:${data.port}`
            }
        } else {
            serverConnected.value = false
        }
    } catch (error) {
        console.error('Server connection check failed:', error)
        serverConnected.value = false
    } finally {
        checking.value = false
    }
}

// Refresh network users when files are shared
const refreshNetworkUsers = () => {
    if (networkUsers.value) {
        networkUsers.value.fetchUsers()
    }
}

onMounted(() => {
    checkConnection()
    // Check connection every 30 seconds
    setInterval(checkConnection, 30000)
})
</script>

<style scoped>
.file-server-container {
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
    color: #ddd;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.server-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    font-weight: 500;
}

.server-status.connected {
    background-color: rgba(76, 175, 80, 0.1);
    border: 1px solid rgba(76, 175, 80, 0.3);
    color: #81c784;
}

.server-status.disconnected {
    background-color: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.3);
    color: #e57373;
}

.status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: currentColor;
}

.status-text {
    flex: 1;
}

.refresh-btn {
    padding: 0.25rem 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: inherit;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
}

.refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.tab-navigation {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #333;
}

.tab-btn {
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: none;
    color: #aaa;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
}

.tab-btn:hover {
    color: #ddd;
    background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
    color: #4fc3f7;
    border-bottom-color: #4fc3f7;
    background: rgba(79, 195, 247, 0.1);
}

.tab-content {
    min-height: 400px;
}

.tab-pane {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>