<script setup lang="ts">
import { useOnumanToolTip } from '../../composables/OnumanToolTip';

defineProps<{
    content: string
    position?: 'top' | 'bottom' | 'left' | 'right'
}>()

const { isVisible, tooltipRef, triggerRef, showTooltip, hideTooltip } = useOnumanToolTip()
</script>

<template>
    <div class="tooltip-container">
        <span ref="triggerRef" @mouseenter="showTooltip" @mouseleave="hideTooltip" @click="showTooltip"
            class="tooltip-trigger">
            <slot></slot>
        </span>
        <div v-if="isVisible" ref="tooltipRef" class="tooltip" :class="{
            'tooltip-top': position === 'top',
            'tooltip-bottom': position === 'bottom',
            'tooltip-left': position === 'left',
            'tooltip-right': position === 'right',
        }">
            <span v-html="content"></span>
            <div class="tooltip-arrow" :class="{
                'tooltip-arrow-top': position === 'top',
                'tooltip-arrow-bottom': position === 'bottom',
                'tooltip-arrow-left': position === 'left',
                'tooltip-arrow-right': position === 'right',
            }" />
        </div>

    </div>
</template>

<style scoped lang="scss">
$d-tooltip-bg: #505050;
$d-tooltip-text: #e0e0e0;
$d-border: #5c5c5c;


.tooltip-container {
    position: relative;
    display: block;
}

.tooltip-trigger {
    cursor: help;
}

.tooltip {
    position: absolute;
    z-index: 10;
    padding: 0.5rem 0.6rem;
    font-size: 0.9rem;
    min-width: 10rem;
    max-width: 40rem;
    text-align: center;
    font-weight: 500;
    color: $d-tooltip-text;
    background-color: $d-tooltip-bg;
    border: 1px solid $d-border;
    border-radius: 3px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: opacity 0.3s ease;
    opacity: 1;
}

.tooltip-top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-8px);
}

.tooltip-bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(8px);
}

.tooltip-left {
    right: 100%;
    top: 50%;
    transform: translateX(-8px) translateY(-50%);
}

.tooltip-right {
    left: 100%;
    top: 50%;
    transform: translateX(8px) translateY(-50%);
}

.tooltip-arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: $d-tooltip-bg;
    transform-origin: center;
    transform: rotate(45deg);
}

.tooltip-arrow-top {
    top: 100%;
    left: 50%;
    margin-top: -4px;
    transform: translateX(-50%) rotate(45deg);
}

.tooltip-arrow-bottom {
    bottom: 100%;
    left: 50%;
    margin-bottom: -4px;
    transform: translateX(-50%) rotate(45deg);
}

.tooltip-arrow-left {
    left: 100%;
    top: 50%;
    margin-left: -4px;
    transform: translateY(-50%) rotate(45deg);
}

.tooltip-arrow-right {
    right: 100%;
    top: 50%;
    margin-right: -4px;
    transform: translateY(-50%) rotate(45deg);
}
</style>