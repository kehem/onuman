// composables/useChart.ts
import { ref, onBeforeUnmount, nextTick, computed, type Ref } from 'vue';
import { Chart, registerables, type ChartConfiguration, type ChartType, type ChartData } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

interface UseChartOptions {
    type: ChartType;
    data: ChartConfiguration['data'];
    options?: ChartConfiguration['options'];
}

interface ChartPreset {
    type: ChartType;
    options: ChartConfiguration['options'];
}

// Custom color palette based on your design system
const colorPalette = {
    text: '#D0D0D0',
    subText: '#A1A1A1',
    subSubText: '#808080',
    bg: '#1F1F1F',
    border: '#3C3C3C', // This is your main dark border color
    primary: '#007ACC',
    secondary: '#5A5A5A',
    btn1: '#3C3C3C',
    btn2: '#cc9600',
    btn3: '#4f885b',
    fuschia: '#d16969',
    fuschiaDark: '#c92278',
    white: '#fcfcfc',
    black: '#111111',
    red: '#f48771',
    warning: '#dcdcaa',
    success: '#71ad54',
    tooltipBg: '#252526',
    tooltipText: '#d4d4d4',
    popupBg: '#2D2D30',
    popupBorder: '#454545',
    menuHover: '#3E3E42',
    skeleton: '#404040',
    skeletonShimmer: '#505050',
    shadow: 'rgba(0, 0, 0, 0.3)',
    cardHover: '#313138',
    metricBg: '#2A2A2A',
    updateBox: '#ce00ce1e',
    visualizerBg: '#0e0816'
};

// Predefined chart presets with custom dark theme
export const chartPresets: Record<string, ChartPreset> = {
    line: {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            backgroundColor: colorPalette.bg,
            color: colorPalette.text,
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: colorPalette.border
                    },
                    ticks: {
                        color: colorPalette.subText
                    },
                    border: {
                        color: colorPalette.border
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: colorPalette.border
                    },
                    ticks: {
                        color: colorPalette.subText
                    },
                    border: {
                        color: colorPalette.border
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: colorPalette.text,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: colorPalette.tooltipBg,
                    titleColor: colorPalette.tooltipText,
                    bodyColor: colorPalette.tooltipText,
                    borderColor: colorPalette.popupBorder,
                    borderWidth: 1
                }
            }
        }
    },
    bar: {
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            backgroundColor: colorPalette.bg,
            color: colorPalette.text,
            scales: {
                x: {
                    grid: {
                        color: colorPalette.border
                    },
                    ticks: {
                        color: colorPalette.subText
                    },
                    border: {
                        color: colorPalette.border
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: colorPalette.border
                    },
                    ticks: {
                        color: colorPalette.subText
                    },
                    border: {
                        color: colorPalette.border
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: colorPalette.text,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: colorPalette.tooltipBg,
                    titleColor: colorPalette.tooltipText,
                    bodyColor: colorPalette.tooltipText,
                    borderColor: colorPalette.popupBorder,
                    borderWidth: 1
                }
            }
        }
    },
    pie: {
        type: 'pie',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            backgroundColor: colorPalette.bg,
            color: colorPalette.text,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: colorPalette.text,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: colorPalette.tooltipBg,
                    titleColor: colorPalette.tooltipText,
                    bodyColor: colorPalette.tooltipText,
                    borderColor: colorPalette.popupBorder,
                    borderWidth: 1
                }
            }
        }
    },
    doughnut: {
        type: 'doughnut',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            backgroundColor: colorPalette.bg,
            color: colorPalette.text,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: colorPalette.text,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: colorPalette.tooltipBg,
                    titleColor: colorPalette.tooltipText,
                    bodyColor: colorPalette.tooltipText,
                    borderColor: colorPalette.popupBorder,
                    borderWidth: 1
                }
            }
        }
    },
    radar: {
        type: 'radar',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            backgroundColor: colorPalette.bg,
            color: colorPalette.text,
            scales: {
                r: {
                    beginAtZero: true,
                    grid: {
                        color: colorPalette.border
                    },
                    angleLines: {
                        color: colorPalette.border
                    },
                    pointLabels: {
                        color: colorPalette.subText
                    },
                    ticks: {
                        color: colorPalette.subText,
                        backdropColor: 'transparent'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: colorPalette.text,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: colorPalette.tooltipBg,
                    titleColor: colorPalette.tooltipText,
                    bodyColor: colorPalette.tooltipText,
                    borderColor: colorPalette.popupBorder,
                    borderWidth: 1
                }
            }
        }
    }
};

// Helper function to generate chart data from simple arrays
export function createChartData(
    labels: string[],
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string;
        borderWidth?: number;
    }>
): ChartData {
    return {
        labels,
        datasets: datasets.map(dataset => ({
            backgroundColor: dataset.backgroundColor || generateColors(dataset.data.length),
            borderColor: dataset.borderColor || colorPalette.border,
            borderWidth: dataset.borderWidth || 1,
            ...dataset
        }))
    };
}

// Generate colors using your custom palette
function generateColors(count: number): string[] {
    const colors = [
        colorPalette.primary,     // VS Code blue
        colorPalette.btn2,        // Yellow/orange
        colorPalette.btn3,        // Green
        colorPalette.fuschia,     // Red/pink
        colorPalette.warning,     // Warning yellow
        colorPalette.success,     // Success green
        colorPalette.fuschiaDark, // Dark pink
        colorPalette.secondary,   // Gray
        colorPalette.red,         // Error red
        colorPalette.subText      // Subtle text color
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
}

export function useChart(canvasRef: Ref<HTMLCanvasElement | null>) {
    const chartInstance = ref<Chart | null>(null);
    const isReady = ref(false);
    const error = ref<string | null>(null);
    const loading = ref(false);

    const createChart = async (config: UseChartOptions) => {
        if (!canvasRef.value) return;

        loading.value = true;
        error.value = null;

        try {
            await nextTick();

            // Destroy existing chart if it exists
            if (chartInstance.value) {
                chartInstance.value.destroy();
            }

            const ctx = canvasRef.value.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');

            chartInstance.value = new Chart(ctx, {
                type: config.type,
                data: config.data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    // Apply global dark theme defaults
                    backgroundColor: colorPalette.bg,
                    color: colorPalette.text,
                    ...config.options,
                },
            });

            isReady.value = true;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error('Chart creation error:', err);
        } finally {
            loading.value = false;
        }
    };

    const createFromPreset = async (
        preset: keyof typeof chartPresets | ChartPreset,
        data: ChartConfiguration['data'],
        customOptions?: ChartConfiguration['options']
    ) => {
        const presetConfig = typeof preset === 'string' ? chartPresets[preset] : preset;
        if (!presetConfig) {
            throw new Error(`Chart preset "${preset}" not found`);
        }

        await createChart({
            type: presetConfig.type,
            data,
            options: {
                ...presetConfig.options,
                ...customOptions
            }
        });
    };

    // FIXED: Added validation and proper update handling
    const updateChart = (newData: ChartConfiguration['data']) => {
        if (!chartInstance.value) {
            console.warn('Chart instance not available for update');
            return;
        }

        // Validate newData structure
        if (!newData || !newData.datasets || !Array.isArray(newData.datasets)) {
            console.warn('Invalid chart data provided for update');
            return;
        }

        try {
            // Update data
            chartInstance.value.data.labels = newData.labels || [];
            chartInstance.value.data.datasets = newData.datasets;

            // Use 'none' mode instead of 'active' to prevent animation issues
            chartInstance.value.update('none');
        } catch (err) {
            console.error('Error updating chart:', err);
            error.value = err instanceof Error ? err.message : 'Failed to update chart';
        }
    };

    // FIXED: Added validation for options update
    const updateOptions = (newOptions: ChartConfiguration['options']) => {
        if (!chartInstance.value) {
            console.warn('Chart instance not available for options update');
            return;
        }

        if (!newOptions) {
            console.warn('No options provided for update');
            return;
        }

        try {
            // Deep merge options instead of Object.assign
            chartInstance.value.options = {
                ...chartInstance.value.options,
                ...newOptions
            };
            chartInstance.value.update('none');
        } catch (err) {
            console.error('Error updating chart options:', err);
            error.value = err instanceof Error ? err.message : 'Failed to update chart options';
        }
    };

    const addDataset = (dataset: any) => {
        if (!chartInstance.value) return;

        // Apply default colors if not provided
        if (!dataset.backgroundColor) {
            dataset.backgroundColor = generateColors(1)[0];
        }
        if (!dataset.borderColor) {
            dataset.borderColor = colorPalette.border;
        }

        chartInstance.value.data.datasets.push(dataset);
        chartInstance.value.update('none');
    };

    const removeDataset = (index: number) => {
        if (!chartInstance.value) return;

        chartInstance.value.data.datasets.splice(index, 1);
        chartInstance.value.update('none');
    };

    const addDataPoint = (label: string, data: number[]) => {
        if (!chartInstance.value) return;

        chartInstance.value.data.labels?.push(label);
        chartInstance.value.data.datasets.forEach((dataset, index) => {
            dataset.data.push(data[index] || 0);
        });
        chartInstance.value.update('none');
    };

    const removeDataPoint = (index: number) => {
        if (!chartInstance.value) return;

        chartInstance.value.data.labels?.splice(index, 1);
        chartInstance.value.data.datasets.forEach(dataset => {
            dataset.data.splice(index, 1);
        });
        chartInstance.value.update('none');
    };

    const exportChart = (format: 'png' | 'jpeg' = 'png') => {
        if (!chartInstance.value) return null;

        return chartInstance.value.toBase64Image(`image/${format}`, 1);
    };

    const destroyChart = () => {
        if (chartInstance.value) {
            chartInstance.value.destroy();
            chartInstance.value = null;
            isReady.value = false;
        }
    };

    const resizeChart = () => {
        if (chartInstance.value) {
            chartInstance.value.resize();
        }
    };

    // FIXED: Added better error handling for theme updates
    const updateTheme = (newColorPalette: Partial<typeof colorPalette>) => {
        Object.assign(colorPalette, newColorPalette);

        if (!chartInstance.value) return;

        try {
            // Update chart colors
            const options = chartInstance.value.options;
            if (options) {
                options.color = colorPalette.text;
                options.backgroundColor = colorPalette.bg;

                // Update scales colors if they exist
                if (options.scales) {
                    Object.values(options.scales).forEach(scale => {
                        if (scale && typeof scale === 'object') {
                            if ('grid' in scale && scale.grid) {
                                scale.grid.color = colorPalette.border;
                            }
                            if ('border' in scale && scale.border) {
                                scale.border.color = colorPalette.border;
                            }
                            if ('ticks' in scale && scale.ticks) {
                                scale.ticks.color = colorPalette.subText;
                            }
                        }
                    });
                }

                // Update legend colors
                if (options.plugins?.legend?.labels) {
                    options.plugins.legend.labels.color = colorPalette.text;
                }

                chartInstance.value.update('none');
            }
        } catch (err) {
            console.error('Error updating theme:', err);
            error.value = err instanceof Error ? err.message : 'Failed to update theme';
        }
    };

    // Computed properties for easy access
    const chartData = computed(() => chartInstance.value?.data || null);
    const chartOptions = computed(() => chartInstance.value?.options || null);

    onBeforeUnmount(() => {
        destroyChart();
    });

    return {
        // State
        chartInstance,
        isReady,
        error,
        loading,
        chartData,
        chartOptions,
        colorPalette, // Export color palette for external use

        // Methods
        createChart,
        createFromPreset,
        updateChart,
        updateOptions,
        addDataset,
        removeDataset,
        addDataPoint,
        removeDataPoint,
        exportChart,
        destroyChart,
        resizeChart,
        updateTheme,
    };
}