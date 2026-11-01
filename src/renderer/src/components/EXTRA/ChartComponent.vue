<!-- src/components/ChartComponent.vue -->
<template>
    <div class="chart-wrapper" :class="wrapperClasses">
        <div class="chart-container" :style="containerStyle">
            <canvas ref="canvasRef" :width="width" :height="height" :style="canvasStyle" @click="handleChartClick" />

            <!-- Loading State -->
            <div v-if="isLoading" class="chart-overlay">
                <slot name="loading">
                    <div class="loading-content">
                        <div class="loading-spinner"></div>
                        <span>{{ loadingText }}</span>
                    </div>
                </slot>
            </div>

            <!-- Error State -->
            <div v-if="hasError" class="chart-overlay error">
                <slot name="error" :error="error">
                    <div class="error-content">
                        <span class="error-icon">⚠️</span>
                        <span class="error-message">{{ error || 'Failed to load chart' }}</span>
                        <button @click="retry" class="retry-btn">Retry</button>
                    </div>
                </slot>
            </div>

            <!-- Empty State -->
            <div v-if="isEmpty && !isLoading && !hasError" class="chart-overlay empty">
                <slot name="empty">
                    <div class="empty-content">
                        <span class="empty-icon">📊</span>
                        <span>No data available</span>
                    </div>
                </slot>
            </div>
        </div>

        <!-- Chart Controls -->
        <div v-if="showControls && isReady" class="chart-controls">
            <slot name="controls" :chart="chartInstance" :exportChart="exportChart">
                <button @click="exportChart('png')" class="control-btn">📥 Export PNG</button>
                <button @click="exportChart('jpeg')" class="control-btn">📥 Export JPEG</button>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useChart, chartPresets, createChartData } from '../../composables/useChart';
import type { ChartConfiguration, ChartType } from 'chart.js';

interface Props {
    // Chart Configuration
    type?: ChartType;
    preset?: keyof typeof chartPresets;
    data?: ChartConfiguration['data'];
    options?: ChartConfiguration['options'];

    // Simple Data Input (alternative to data prop)
    labels?: string[];
    datasets?: Array<{
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string;
        borderWidth?: number;
    }>;

    // Layout
    width?: number;
    height?: string | number;
    responsive?: boolean;
    maintainAspectRatio?: boolean;

    // State
    loading?: boolean;
    loadingText?: string;

    // Features
    showControls?: boolean;
    clickable?: boolean;
    showLegend?: boolean;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';

    // Styling
    containerClass?: string;

    // Auto-refresh
    autoRefresh?: number; // milliseconds
}

const props = withDefaults(defineProps<Props>(), {
    preset: 'line',
    width: 400,
    height: '300px',
    responsive: true,
    maintainAspectRatio: false,
    loading: false,
    loadingText: 'Loading chart...',
    showControls: false,
    clickable: false,
    showLegend: true,
    legendPosition: 'top',
    autoRefresh: 0,
});

const emit = defineEmits<{
    chartCreated: [chart: any];
    chartDestroyed: [];
    chartClick: [event: any, elements: any[]];
    error: [error: string];
    ready: [];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const autoRefreshTimer = ref<NodeJS.Timeout>();
const isInitializing = ref(false);

const {
    chartInstance,
    isReady,
    error,
    loading: chartLoading,
    createChart,
    createFromPreset,
    updateChart,
    updateOptions,
    exportChart,
    destroyChart,
    resizeChart
} = useChart(canvasRef);

// FIXED: Add data validation helper
const isValidChartData = (data: ChartConfiguration['data'] | null): boolean => {
    if (!data) return false;
    if (!data.datasets || !Array.isArray(data.datasets)) return false;
    if (data.datasets.length === 0) return false;

    // Check if at least one dataset has data
    return data.datasets.some(dataset =>
        dataset.data && Array.isArray(dataset.data) && dataset.data.length > 0
    );
};

// Computed properties
const isLoading = computed(() => props.loading || chartLoading.value || isInitializing.value);
const hasError = computed(() => !!error.value);
const isEmpty = computed(() => {
    return !isValidChartData(chartData.value);
});

const chartData = computed((): ChartConfiguration['data'] | null => {
    // If explicit data is provided, use it
    if (props.data) {
        return isValidChartData(props.data) ? props.data : null;
    }

    // If labels and datasets are provided, create chart data
    if (props.labels && props.datasets && props.labels.length > 0 && props.datasets.length > 0) {
        const data = createChartData(props.labels, props.datasets);
        return isValidChartData(data) ? data : null;
    }

    return null;
});

const wrapperClasses = computed(() => [
    'chart-component',
    props.containerClass,
    {
        'chart-loading': isLoading.value,
        'chart-error': hasError.value,
        'chart-empty': isEmpty.value,
        'chart-ready': isReady.value,
        'chart-responsive': props.responsive
    }
]);

const containerStyle = computed(() => ({
    position: 'relative' as const,
    width: props.responsive ? '100%' : `${props.width}px`,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    minHeight: '200px'
}));

const canvasStyle = computed(() => ({
    display: (isLoading.value || hasError.value || isEmpty.value) ? 'none' : 'block',
}));

// FIXED: Enhanced chart initialization with better error handling
const initChart = async () => {
    if (!chartData.value || !isValidChartData(chartData.value)) {
        console.warn('ChartComponent: Invalid or missing chart data');
        return;
    }

    if (isInitializing.value) {
        console.warn('ChartComponent: Already initializing, skipping...');
        return;
    }

    isInitializing.value = true;

    try {
        await nextTick(); // Ensure DOM is ready

        // Clear any existing errors
        if (error.value) {
            error.value = null;
        }

        const commonOptions = {
            responsive: props.responsive,
            maintainAspectRatio: props.maintainAspectRatio,
            onClick: props.clickable ? handleChartClick : undefined,
            plugins: {
                legend: {
                    display: props.showLegend,
                    position: props.legendPosition
                }
            },
            ...props.options,
        };

        if (props.preset && !props.type) {
            await createFromPreset(props.preset, chartData.value, commonOptions);
        } else {
            await createChart({
                type: props.type || 'line',
                data: chartData.value,
                options: commonOptions,
            });
        }

        if (chartInstance.value) {
            emit('chartCreated', chartInstance.value);
            emit('ready');
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create chart';
        console.error('ChartComponent initialization error:', err);
        emit('error', errorMessage);
    } finally {
        isInitializing.value = false;
    }
};

const retry = async () => {
    if (error.value) {
        error.value = null;
        await initChart();
    }
};

const handleChartClick = (event: any, elements?: any[]) => {
    if (props.clickable && elements) {
        emit('chartClick', event, elements);
    }
};

const setupAutoRefresh = () => {
    if (props.autoRefresh && props.autoRefresh > 0) {
        autoRefreshTimer.value = setInterval(() => {
            if (isReady.value && chartData.value && isValidChartData(chartData.value)) {
                updateChart(chartData.value);
            }
        }, props.autoRefresh);
    }
};

const clearAutoRefresh = () => {
    if (autoRefreshTimer.value) {
        clearInterval(autoRefreshTimer.value);
        autoRefreshTimer.value = undefined;
    }
};

// FIXED: Enhanced watchers with better validation
watch(() => chartData.value, async (newData, oldData) => {
    // Skip if data hasn't actually changed (deep comparison)
    if (JSON.stringify(newData) === JSON.stringify(oldData)) {
        return;
    }

    if (isReady.value && newData && isValidChartData(newData)) {
        try {
            updateChart(newData);
        } catch (err) {
            console.error('Error updating chart data:', err);
            // Reinitialize if update fails
            await initChart();
        }
    } else if (!newData || !isValidChartData(newData)) {
        // If data becomes invalid, destroy the chart
        destroyChart();
    }
}, { deep: true });

watch(() => props.options, async (newOptions, oldOptions) => {
    // Skip if options haven't actually changed
    if (JSON.stringify(newOptions) === JSON.stringify(oldOptions)) {
        return;
    }

    if (isReady.value && newOptions) {
        try {
            updateOptions(newOptions);
        } catch (err) {
            console.error('Error updating chart options:', err);
            // Reinitialize if update fails
            await initChart();
        }
    }
}, { deep: true });

watch(() => [props.type, props.preset], async () => {
    if (isReady.value && !isInitializing.value) {
        await initChart();
    }
});

watch(() => props.autoRefresh, () => {
    clearAutoRefresh();
    setupAutoRefresh();
});

// FIXED: Better lifecycle management
onMounted(async () => {
    await nextTick(); // Ensure canvas is in DOM
    if (chartData.value && isValidChartData(chartData.value)) {
        await initChart();
    }
    setupAutoRefresh();
});

onBeforeUnmount(() => {
    clearAutoRefresh();
    isInitializing.value = false;
});

// Watch for canvas ref changes (in case it gets re-rendered)
watch(canvasRef, async (newCanvas) => {
    if (newCanvas && chartData.value && isValidChartData(chartData.value) && !isReady.value) {
        await initChart();
    }
});

// Expose methods for parent component
defineExpose({
    chartInstance,
    isReady,
    updateChart,
    updateOptions,
    destroyChart,
    resizeChart,
    exportChart,
    retry,
    isValidChartData
});
</script>

<style scoped>
/* Custom CSS Variables based on your color palette */
:root {
    --d-text: #D0D0D0;
    --d-sub-text: #A1A1A1;
    --d-sub-sub-text: #808080;
    --d-bg: #1F1F1F;
    --d-border: #3C3C3C;
    --d-primary: #007ACC;
    --d-secondary: #5A5A5A;
    --d-btn-1: #3C3C3C;
    --d-btn-2: #cc9600;
    --d-btn-3: #4f885b;
    --d-fuschia: #d16969;
    --d-fuschiaDark: #c92278;
    --d-white: #fcfcfc;
    --d-black: #111111;
    --d-red: #f48771;
    --d-warning: #dcdcaa;
    --d-success: #71ad54;
    --d-tooltip-bg: #252526;
    --d-tooltip-text: #d4d4d4;
    --d-popup-bg: #2D2D30;
    --d-popup-border: #454545;
    --d-menu-hover: #3E3E42;
    --d-skeleton: #404040;
    --d-skeleton-shimmer: #505050;
    --d-shadow: rgba(0, 0, 0, 0.3);
    --d-card-hover: #313138;
    --d-metric-bg: #2A2A2A;
    --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    --update-box: #ce00ce1e;
    --visualizer-bg: #0e0816;
}

.chart-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: var(--d-bg);
    color: var(--d-text);
    border-radius: 8px;
    padding: 16px;
    border: 1px solid var(--d-border);
    box-shadow: var(--box-shadow);
}

.chart-container {
    position: relative;
    background: var(--d-metric-bg);
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--d-border);
}

.chart-responsive .chart-container {
    width: 100%;
    height: 100%;
}

.chart-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(31, 31, 31, 0.8);
    backdrop-filter: blur(2px);
    border-radius: 6px;
}

.loading-content,
.error-content,
.empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
    padding: 20px;
    color: var(--d-text);
}

.loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--d-border);
    border-top: 3px solid var(--d-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.error-content {
    color: var(--d-red);
}

.error-content .error-message {
    color: var(--d-red);
    font-weight: 500;
}

.error-icon,
.empty-icon {
    font-size: 24px;
}

.retry-btn,
.control-btn {
    padding: 8px 16px;
    border: 1px solid var(--d-border);
    border-radius: 4px;
    background: var(--d-btn-1);
    color: var(--d-text);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    outline: none;
}

.retry-btn:hover,
.control-btn:hover {
    background: var(--d-menu-hover);
    border-color: var(--d-primary);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px var(--d-shadow);
}

.retry-btn {
    background: var(--d-red);
    border-color: var(--d-red);
    color: var(--d-white);
}

.retry-btn:hover {
    background: var(--d-fuschia);
    border-color: var(--d-fuschia);
    color: var(--d-white);
}

.control-btn {
    background: var(--d-primary);
    border-color: var(--d-primary);
    color: var(--d-white);
}

.control-btn:hover {
    background: #0099ff;
    border-color: #0099ff;
}

.chart-controls {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
    padding: 8px 0;
    border-top: 1px solid var(--d-border);
    margin-top: 8px;
}

.empty-content {
    color: var(--d-sub-text);
}

.empty-content span:last-child {
    font-weight: 500;
    color: var(--d-sub-sub-text);
}

/* Loading state styling */
.chart-loading .chart-container {
    background: var(--d-skeleton);
}

.chart-loading .loading-content {
    animation: pulse 2s ease-in-out infinite alternate;
}

@keyframes pulse {
    0% {
        opacity: 0.6;
    }

    100% {
        opacity: 1;
    }
}

/* Error state styling */
.chart-error .chart-container {
    border-color: var(--d-red);
    background: rgba(244, 135, 113, 0.05);
}

/* Ready state styling */
.chart-ready .chart-container {
    border-color: var(--d-success);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .chart-wrapper {
        padding: 12px;
    }

    .chart-controls {
        flex-direction: column;
        align-items: center;
    }

    .control-btn,
    .retry-btn {
        width: 100%;
        max-width: 200px;
    }
}

/* Focus states for accessibility */
.retry-btn:focus,
.control-btn:focus {
    outline: 2px solid var(--d-primary);
    outline-offset: 2px;
}
</style>