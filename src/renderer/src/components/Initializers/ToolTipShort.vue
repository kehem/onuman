<!-- components/ToolTipShort.vue -->
<template>
    <div class="tooltip-container" @mouseenter="showTooltip" @mouseleave="hideTooltip" @focus="showTooltip"
        @blur="hideTooltip" tabindex="0">
        <slot />
        <transition name="fade">
            <div v-if="visible" :class="['tooltip', placement]" role="tooltip">
                <div class="main-content" v-html="text"></div>
            </div>
        </transition>

    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
    text: string
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end' | 'start-top' | 'end-top'
}>()

const visible = ref(false)

function showTooltip() {
    visible.value = true
}

function hideTooltip() {
    visible.value = false
}
</script>

<style scoped>
.tooltip-container {
    position: relative;
    display: inline-block;
}

.tooltip {
    position: absolute;
    background-color: #4d4d4d;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
}

.tooltip.top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 8px;
}

.tooltip.bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 8px;
}

.tooltip.left {
    top: 50%;
    right: 100%;
    transform: translateY(-50%);
    margin-right: 8px;
}

.tooltip.right {
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    margin-left: 8px;
}

.tooltip.start {
    top: 100%;
    left: 0;
    margin-top: 8px;
}

.tooltip.end {
    top: 100%;
    right: 0;
    margin-top: 8px;
}

.tooltip.start-top {
    bottom: 100%;
    left: 0;
    margin-bottom: 8px;
}

.tooltip.end-top {
    bottom: 100%;
    right: 0;
    margin-bottom: 8px;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
