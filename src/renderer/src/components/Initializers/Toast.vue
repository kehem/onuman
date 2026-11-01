<template>
    <div class="toast" :class="toastClasses" role="alert" @click="closeOnClick && hideToast()">
        <div v-if="props.showProgress" class="toast-progress" :style="progressStyle"></div>
        <div class="toast-content">
            <span v-if="props.icon" class="toast-icon" :class="iconClasses"></span>
            <span class="toast-message">{{ props.message }}</span>
            <i v-if="props.showClose" @click="hideToast" class="m-cross1 toast-close" title="Stop Notification"></i>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

interface Props {
    message: string
    type?: 'success' | 'error' | 'info' | 'warning' | 'critical' | 'loading' | 'notification' | 'help' | 'maintenance' | 'reminder'
    duration?: number
    visible: boolean
    position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
    transition?: 'slide' | 'fade' | 'bounce'
    icon?: boolean
    showClose?: boolean
    showProgress?: boolean
    closeOnClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    type: 'success',
    duration: 5000,
    visible: false,
    position: 'bottom-right',
    transition: 'slide',
    icon: true,
    showClose: true,
    showProgress: true,
    closeOnClick: false
})

const isVisible = ref(props.visible)
const progress = ref(100)
let timeoutId: NodeJS.Timeout | null = null
let progressInterval: NodeJS.Timeout | null = null

const toastClasses = computed(() => ({
    'toast--success': props.type === 'success',
    'toast--error': props.type === 'error',
    'toast--info': props.type === 'info',
    'toast--warning': props.type === 'warning',
    'toast--critical': props.type === 'critical',
    'toast--loading': props.type === 'loading',
    'toast--notification': props.type === 'notification',
    'toast--help': props.type === 'help',
    'toast--maintenance': props.type === 'maintenance',
    'toast--reminder': props.type === 'reminder',
    [`toast--${props.position}`]: true,
    [`toast--transition-${props.transition}`]: true,
    'toast--hidden': !isVisible.value
}))


const iconClasses = computed(() => ({
    'icon-success': props.type === 'success',
    'icon-error': props.type === 'error',
    'icon-info': props.type === 'info',
    'icon-warning': props.type === 'warning',
    'icon-critical': props.type === 'critical',
    'icon-loading': props.type === 'loading',
    'icon-notification': props.type === 'notification',
    'icon-help': props.type === 'help',
    'icon-maintenance': props.type === 'maintenance',
    'icon-reminder': props.type === 'reminder'
}))


const progressStyle = computed(() => ({
    width: `${progress.value}%`
}))

const hideToast = () => {
    isVisible.value = false
    if (timeoutId) clearTimeout(timeoutId)
    if (progressInterval) clearInterval(progressInterval)
}

const showToast = () => {
    if (props.message && props.visible) {
        isVisible.value = true
        progress.value = 100
        if (props.duration > 0) {
            if (timeoutId) clearTimeout(timeoutId)
            timeoutId = setTimeout(hideToast, props.duration)

            if (props.showProgress) {
                const interval = 50
                const decrement = (100 / props.duration) * interval
                if (progressInterval) clearInterval(progressInterval)
                progressInterval = setInterval(() => {
                    progress.value = Math.max(0, progress.value - decrement)
                }, interval)
            }
        }
    } else {
        hideToast()
    }
}

watch(
    () => [props.visible, props.message, props.type, props.duration],
    () => {
        showToast()
    },
    { immediate: true }
)

onUnmounted(() => {
    if (timeoutId) clearTimeout(timeoutId)
    if (progressInterval) clearInterval(progressInterval)
})
</script>



<style scoped lang="scss">
// $color-success-gradient: linear-gradient(135deg, #005c15, #005068);
// $color-error-gradient: linear-gradient(135deg, #880815, #14006e);
// $color-info-gradient: linear-gradient(135deg, #005b69, #70004b);
// $color-warning-gradient: linear-gradient(135deg, #ff9900, #cc7a00);
// $color-critical-gradient: linear-gradient(135deg, #ff0033, #800000);
// $color-loading-gradient: linear-gradient(135deg, #4b79a1, #283e51);
// $color-notification-gradient: linear-gradient(135deg, #0074d9, #005fa3);
// $color-help-gradient: linear-gradient(135deg, #00c3ff, #0077be);
// $color-maintenance-gradient: linear-gradient(135deg, #5a6268, #343a40);
// $color-reminder-gradient: linear-gradient(135deg, #ffcc00, #d4a200);

$color-success-gradient: linear-gradient(135deg, #3e9628, #29b606);
$color-error-gradient: linear-gradient(135deg, #cc2132, #c51f1f);
$color-info-gradient: linear-gradient(135deg, #265a8a, #133296);
$color-warning-gradient: linear-gradient(135deg, #a3862e, #ad8610);
$color-critical-gradient: linear-gradient(135deg, #c93b53, #b86d28);
$color-loading-gradient: linear-gradient(135deg, #8798a5, #577ba0);
$color-notification-gradient: linear-gradient(135deg, #12fc87, #26609e);
$color-help-gradient: linear-gradient(135deg, #b17d30, #7e4eca);
$color-maintenance-gradient: linear-gradient(135deg, #0f1922, #00191d);
$color-reminder-gradient: linear-gradient(135deg, #db8946, #a34614);


$color-text: #cecece;
$color-text-hover: #ffffff;
$color-shadow: rgba(0, 0, 0, 0.2);
$color-progress: #8f8f8f;

$border-radius: 0;
$padding: 0.3rem;
$font-size: 1rem;
$font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

$shadow: 0 6px 16px $color-shadow;
$glow: 0 0 8px rgba(255, 255, 255, 0.3);
$transition-duration: 0.3s;
$transition-easing: cubic-bezier(0.4, 0, 0.2, 1);

.toast {
    position: fixed;
    width: 100%;
    border-radius: $border-radius;
    box-shadow: $shadow;
    font-family: $font-family;
    cursor: pointer;
    z-index: 3;

    // Type Backgrounds
    &--success {
        background: $color-success-gradient;
    }

    &--error {
        background: $color-error-gradient;
    }

    &--info {
        background: $color-info-gradient;
    }

    &--warning {
        background: $color-warning-gradient;
    }

    &--critical {
        background: $color-critical-gradient;
    }

    &--loading {
        background: $color-loading-gradient;
    }

    &--notification {
        background: $color-notification-gradient;
    }

    &--help {
        background: $color-help-gradient;
    }

    &--maintenance {
        background: $color-maintenance-gradient;
    }

    &--reminder {
        background: $color-reminder-gradient;
    }

    // Positions
    &--top-right {
        top: 2rem;
        right: 0;
    }

    &--bottom-right {
        bottom: 0;
        right: 0;
    }

    &--top-left {
        top: 2rem;
        left: 0;
    }

    &--bottom-left {
        bottom: 0;
        left: 0;
    }

    // Transitions
    &--transition-slide {
        transition: transform $transition-duration $transition-easing,
            opacity $transition-duration $transition-easing;
        transform: translateY(0);
        opacity: 1;

        &.toast--hidden {
            opacity: 0;
            transform: translateY(30px);
        }
    }

    &--transition-fade {
        transition: opacity $transition-duration $transition-easing;
        opacity: 1;

        &.toast--hidden {
            opacity: 0;
        }
    }

    &--transition-bounce {
        transition: transform $transition-duration $transition-easing,
            opacity $transition-duration $transition-easing;
        transform: scale(1);
        opacity: 1;

        &.toast--hidden {
            opacity: 0;
            transform: scale(0.8);
        }
    }
}

.toast-content {
    display: flex;
    align-items: center;
    padding: $padding;
    color: $color-text;
}

.toast-message {
    flex: 1;
    font-size: $font-size;
    text-align: center;
    padding: 0 1rem;
}

.toast-close {
    display: flex;
    text-align: left;
    height: 100%;
    border: none;
    color: $color-text;
    cursor: pointer;
    transition: color $transition-duration $transition-easing;

    &:hover {
        color: $color-text-hover;
        text-shadow: $glow;
    }
}

.toast-progress {
    position: absolute;
    height: 2px;
    top: -2px;
    background: $color-progress;
    transition: width $transition-duration linear;
}
</style>
