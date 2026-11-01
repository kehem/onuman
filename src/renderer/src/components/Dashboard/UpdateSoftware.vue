<!-- components/Dashboard/UpdateSoftware.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import ToolTipShort from '../Initializers/ToolTipShort.vue';

interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'error'
  version?: string
  error?: string
}

// Reactive state
const updateStatus = ref<UpdateStatus>({ status: 'not-available' });
const currentVersion = ref<string>('');
const showUpdateDetails = ref(false);
const isChecking = ref(false);
const updateDetailsRef = ref<HTMLElement>();

const handleClickOutside = (event: Event) => {
  if (updateDetailsRef.value && !updateDetailsRef.value.contains(event.target as Node)) {
    showUpdateDetails.value = false;
  }
};


// Check for updates manually
const checkForUpdates = async () => {
  if (!window.electronAPI) return;

  isChecking.value = true;
  try {
    await window.electronAPI.checkForUpdates();
  } catch (error) {
    updateStatus.value = {
      status: 'error',
      error: 'Failed to check for updates. Please try again.'
    };
  }
  setTimeout(() => {
    isChecking.value = false;
  }, 2000);
};


// Toggle update details
const toggleUpdateDetails = () => {
  showUpdateDetails.value = !showUpdateDetails.value;
};

// Get status text and icon
const getStatusInfo = () => {
  switch (updateStatus.value.status) {
    case 'checking':
      return {
        text: 'Checking...',
        icon: '🔍',
        color: '#3b82f6',
        clickable: false
      };
    case 'available':
      return {
        text: 'Update Available',
        icon: '🆕',
        color: '#10b981',
        clickable: true
      };
    case 'error':
      return {
        text: 'Update Error',
        icon: '❌',
        color: '#ef4444',
        clickable: true
      };
    default:
      return {
        text: 'Up to Date',
        icon: '✓',
        color: '#6b7280',
        clickable: true
      };
  }
};

// Setup update status listener
onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  if (!window.electronAPI) return;

  try {
    // Get current app version
    currentVersion.value = await window.electronAPI.getAppVersion();

    // Listen for update status changes
    window.electronAPI.onUpdateStatus((status: UpdateStatus) => {
      updateStatus.value = status;
    });
  } catch (error) {
  }
});
// ADD: Auto-check on component mount (optional - since main process will do it)
const performAutoCheck = async () => {
  // Only auto-check if no status has been received yet and it's been a few seconds since mount
  if (updateStatus.value.status === 'not-available') {
    await checkForUpdates();
  }
};

// IMPROVE: Enhanced update status listener
onMounted(async () => {
  if (!window.electronAPI) return;

  try {
    // Get current app version
    currentVersion.value = await window.electronAPI.getAppVersion();

    // Listen for update status changes
    window.electronAPI.onUpdateStatus((status: UpdateStatus) => {
      updateStatus.value = status;

      // AUTO-CLOSE details panel if user just downloaded/updated
      if (status.status === 'not-available' && showUpdateDetails.value) {
        setTimeout(() => {
          showUpdateDetails.value = false;
        }, 3000); // Close after 3 seconds if up-to-date
      }
    });

    // OPTIONAL: Auto-check after component mount (with delay)
    setTimeout(performAutoCheck, 5000);

  } catch (error) {
  }
});

// IMPROVE: Better error handling in openUpdateWebsite
const openUpdateWebsite = async () => {
  if (!window.electronAPI || updateStatus.value.status !== 'available') return;

  // IMPROVE: Better confirmation message with version info
  const confirmed = await window.electronAPI.showConfirmDialog(
    `🚀 A new version (v${updateStatus.value.version}) of Onuman is available!\n\nCurrent version: v${currentVersion.value}\n\nWould you like to visit the download page to get the latest version?`,
    'Update Available - Onuman'
  );

  if (confirmed) {
    try {
      const success = await window.electronAPI.openUpdateWebsite();
      if (success) {
        showUpdateDetails.value = false;

        // IMPROVE: Show success message to user
        updateStatus.value = {
          ...updateStatus.value,
          status: 'not-available' // Reset status after directing to website
        };
      } else {
      }
    } catch (error) {
    }
  }
};
// Cleanup
onBeforeUnmount(() => {
  if (window.electronAPI) {
    window.electronAPI.removeUpdateStatusListener();
  }
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="update-software" :class="{ 'has-details': showUpdateDetails }">
    <!-- Main update status -->
    <div class="update-status" :class="{
      'clickable': getStatusInfo().clickable,
      'checking': isChecking,
      [`status-${updateStatus.status}`]: true
    }" @click="getStatusInfo().clickable ? toggleUpdateDetails() : null">
      <ToolTipShort :text="getStatusInfo().text" placement="top">
        <div class="status-content">
          <span class="status-icon">{{ getStatusInfo().icon }}</span>
          <span class="status-text" :style="{ color: getStatusInfo().color }">
            {{ getStatusInfo().text }}
          </span>
        </div>
      </ToolTipShort>
    </div>

    <!-- Update details panel -->
    <div class="update-details" v-if="showUpdateDetails" ref="updateDetailsRef">
      <div class="update-panel">
        <!-- Current Version -->
        <div class="version-info">
          <span class="label">Current:</span>
          <span class="value">v{{ currentVersion }}</span>
        </div>

        <!-- Available Version -->
        <div class="version-info" v-if="updateStatus.version">
          <span class="label">Available:</span>
          <span class="value">v{{ updateStatus.version }}</span>
        </div>

        <!-- Error Message -->
        <div class="error-info" v-if="updateStatus.error">
          <span class="error-text">{{ updateStatus.error }}</span>
        </div>

        <!-- MODIFIED: Action Buttons for External Link Updates -->
        <div class="update-actions">
          <!-- Check for Updates Button -->
          <button class="action-btn check-btn" @click="checkForUpdates" :disabled="isChecking">
            {{ isChecking ? 'Checking...' : 'Check Now' }}
          </button>

          <!-- MODIFIED: Open Website Button instead of Download -->
          <button class="action-btn update-btn" @click="openUpdateWebsite" v-if="updateStatus.status === 'available'">
            🌐 Get Update
          </button>
        </div>

        <!-- Manual Update Info -->
        <div class="manual-update-info" v-if="updateStatus.status === 'not-available'">
          <p class="info-text">🎉 You're running the latest version!</p>
          <p class="sub-text">Updates are checked manually. Click "Check Now" to look for new versions.</p>
        </div>

        <!-- IMPROVE: Better update available info -->
        <div class="update-available-info" v-if="updateStatus.status === 'available'">
          <p class="info-text">🚀 New version available!</p>
          <p class="sub-text">
            Version {{ updateStatus.version }} is ready for download.
            Click "Get Update" to visit our website and install the latest version.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// styles/variables/index.scss
@use 'sass:color';
@use '../../assets/styles/variables/index' as *;

.update-software {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  font-size: 0.75rem;
}

.update-status {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.update-status.clickable {
  cursor: pointer;
}

.update-status.clickable:hover {
  background-color: $d-menu-hover;
}

.update-status.checking {
  animation: pulse 1.5s infinite;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.status-icon {
  font-size: 0.875rem;
  line-height: 1;
}

.status-text {
  font-weight: 500;
  white-space: nowrap;
  transition: color 0.2s ease;
}

/* Status-specific styles */
.status-checking .status-text {
  color: $d-primary;
}

.status-available .status-text {
  color: $d-success;
}

.status-downloading .status-text {
  color: $d-warning;
}

.status-downloaded .status-text {
  color: $d-success;
}

.status-error .status-text {
  color: $d-red;
}

.status-not-available .status-text {
  color: $d-sub-sub-text;
}

/* Update details panel */
.update-details {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 0.5rem;
  z-index: 1000;
  animation: slideUp 0.2s ease;
}

.update-panel {
  background: $d-popup-bg;
  border: 1px solid $d-popup-border;
  border-radius: 0.5rem;
  padding: 1rem;
  min-width: 220px;
  max-width: 280px;
  box-shadow: $box-shadow;
}

.version-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.label {
  color: $d-sub-text;
  font-weight: 500;
}

.value {
  color: $d-text;
  font-weight: 600;
}

.progress-info {
  margin: 0.75rem 0;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: $d-border;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: $d-success;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.625rem;
  color: $d-sub-text;
}

.error-info {
  margin: 0.5rem 0;
}

.error-text {
  color: $d-red;
  font-size: 0.625rem;
  word-wrap: break-word;
}

.update-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.action-btn {
  flex: 1;
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.check-btn {
  background: $d-btn-1;
  color: $d-white;
}

.check-btn:hover:not(:disabled) {
  background: $d-card-hover;
}

.check-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Download/Update button styles */
.download-btn,
.update-btn {
  background: $d-primary;
  color: $d-white;
}

.download-btn:hover:not(:disabled),
.update-btn:hover:not(:disabled) {
  background: $d-fuschia;
}

.download-btn:disabled,
.update-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.install-btn {
  background: $d-btn-3;
  color: $d-white;
}

.install-btn:hover {
  background: $d-success;
}

/* Manual update info styles */
.manual-update-info,
.update-available-info,
.auto-update-info {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid $d-border;
}

.info-text {
  color: $d-success;
  font-size: 0.625rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.sub-text {
  color: $d-sub-text;
  font-size: 0.5625rem;
  line-height: 1.3;
  margin: 0;
}

/* Animations */
@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .update-panel {
    min-width: 180px;
    padding: 0.75rem;
  }

  .status-text {
    display: none;
  }
}
</style>