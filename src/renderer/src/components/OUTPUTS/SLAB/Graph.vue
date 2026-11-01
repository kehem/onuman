<!-- src/components/OUTPUTS/SLAB/Graph.vue -->
<template>
    <section class="graph-main">
        <section class="graph-container">

            <!-- ALL FLOORS -->
            <Tabs :mainTabs="mainTabs" :subTabs="subTabs" :exceptions="'ground'"
                @update:selectedMainTab="handleMainTabSelect" @update:selectedSubTab="handleSubTabSelect"
                :itemType="'Column Type'" :initialMainTab="initialMainTab" :initialSubTab="initialSubTab" />

            <section class="contents onuman-insider-scroll">

                <!-- LOADING SKELETON -->
                <aside v-if="isLoading" class="graph overview">
                    <section class="canvas-container">
                        <div class="canvas">
                            <div class="skeleton skeleton-header"></div>
                            <div class="skeleton skeleton-chart"></div>
                        </div>
                        <div class="canvas wider">
                            <div class="skeleton skeleton-header"></div>
                            <div class="skeleton skeleton-chart"></div>
                        </div>
                    </section>
                    <div class="skeleton-pile-section">
                        <div class="skeleton skeleton-pile-title"></div>
                        <div class="skeleton-pile-grid">
                            <div class="skeleton-pile-item" v-for="n in 3" :key="n">
                                <div class="skeleton skeleton-pile-name"></div>
                                <div class="skeleton skeleton-pile-chart"></div>
                                <div class="skeleton-pile-stats">
                                    <div class="skeleton skeleton-stat-line"></div>
                                    <div class="skeleton skeleton-stat-line"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <!-- MAIN GRAPH -->
                <aside v-else class="graph overview">

                    <!-- TOTAL CC SUMMERY -->
                    <section class="canvas-container" v-if="hasValidCCData">
                        <div class="canvas">
                            <h2>Material Total Cost Distribution</h2>
                            <ChartComponent preset="doughnut" :labels="CCTotalLables" :datasets="CCTotalDatasets"
                                legend-position="bottom" clickable @chart-click="handleChartClick" />
                        </div>
                        <div class="canvas wider">
                            <h2>Specific Materials Distribution</h2>
                            <ChartComponent preset="bar" :labels="CCSpecificLables" :datasets="CCSpecificDatasets"
                                clickable :options="barChartOptions" @chart-click="handleChartClick" />
                        </div>
                    </section>

                    <!-- SPECIFIC PILE DATA -->
                    <div v-if="hasValidPileData">
                        <h2 class="text-center">Specific Material Cost Distribution</h2><br>
                        <section class="canvas-container grid-chart">
                            <div class="canvas wider" v-for="(pile, index) in PileList"
                                :key="`pile-${pile.pile_name}-${index}`">
                                <h3 class="text-center mb-3 font-semibold text-gray-700">{{ pile.pile_name }}</h3>

                                <ChartComponent v-if="isValidPileData(pile)" preset="pie"
                                    :labels="getDATATotalLabels(pile)" :datasets="getDATATotalDatasets(pile)"
                                    :options="getMaterialCostChartOptions(pile)" legend-position="top" clickable
                                    @chart-click="handleChartClick" />

                                <div v-else class="no-data-message">
                                    <p>No valid weight data available for {{ pile.pile_name }}</p>
                                </div>

                                <div v-if="isValidPileData(pile)" class="pile-summary">
                                    <p>Total Weight: {{ getTotalWeight(pile).toFixed(2) }} kg</p>
                                    <p>Total Cost: {{ getTotalCost(pile).toLocaleString() }}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <!-- NO DATA MESSAGE -->
                    <div v-if="!hasValidCCData && !hasValidPileData" class="no-data-container">
                        <div class="no-data-content">
                            <i class="m-piechart"></i>
                            <h2>No Chart Data Available</h2>
                            <p>Unable to load chart data. Please add data</p>
                        </div>
                    </div>

                </aside>
            </section>
        </section>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RCC } from '../../../Interfaces/Inputs'
import ChartComponent from '../../EXTRA/ChartComponent.vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '../../../composables/Toast'
import { useApi } from '../../../composables/useApi'
import Tabs from '../Tabs.vue'

/* TYPES */
type ChartDataset = {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    hoverBackgroundColor?: string | string[]
    borderColor?: string
    borderWidth?: number
    metadata?: any[]
    [key: string]: any
}

/* PROPS */
const props = defineProps<{
    initialMainTab: number | null
    initialSubTab: string | null
}>()

/* COMPOSABLES */
const { get } = useApi()
const router = useRouter()
const route = useRoute()
const { showToast } = useToast()

/* ROUTE PARAMS */
const projectId = computed(() => {
    const queryString = router.currentRoute.value.fullPath.split('?')[1]
    return Number(new URLSearchParams(queryString).get('id'))
})

/* TAB CONFIGURATION */
const totalFloors = Number(route.query.totalFloors)
const mainTabs = Array.from({ length: totalFloors }, (_, i) => i + 1)
const subTabs = ['Main', 'Sun Shade', 'False', 'Ground']

/* TAB STATE */
const selectedMainTab = ref<number | null>(props.initialMainTab || 1)
const selectedSubTab = ref<string | null>(props.initialSubTab || 'short')
const isInitialLoadComplete = ref(false)

/* STATE */
const graphData = ref<any>('')
const isLoading = ref(false)

/* TAB HANDLERS */
const handleMainTabSelect = (value: number) => {
    selectedMainTab.value = value
}

const handleSubTabSelect = (value: string) => {
    selectedSubTab.value = value
}

/* API FETCH */
const fetchGraphData = async () => {
    if (!selectedMainTab.value || !selectedSubTab.value) {
        console.warn('Cannot fetch data: missing tab selections')
        return
    }

    isLoading.value = true
    try {
        graphData.value = await get(`/api/slab/graph/${selectedMainTab.value}/${selectedSubTab.value}?projectId=${projectId.value}`)
    } catch (error: any) {
        const msg = error.response?.message || error.message || 'Failed to fetch pile data'
        showToast('error', msg, 5000, 'right-bottom')
    } finally {
        isLoading.value = false
        if (!isInitialLoadComplete.value) {
            isInitialLoadComplete.value = true
        }
    }
}

/* LIFECYCLE */
onMounted(() => {
    if (!selectedMainTab.value) selectedMainTab.value = props.initialMainTab || 1
    if (!selectedSubTab.value) selectedSubTab.value = props.initialSubTab || 'short'
    fetchGraphData()
})

/* WATCHERS */
watch([selectedMainTab, selectedSubTab], ([main, sub]) => {
    if (main !== null && sub !== null) {
        fetchGraphData()
    }
}, { immediate: false })

/* VALIDATION HELPERS */
const isValidPileData = (pile: any): boolean =>
    pile?.weights?.length > 0 && pile.weights.some((w: any) => w.weight > 0)

/* PARSED GRAPH DATA */
const parsedGraphData = computed(() => {
    if (!graphData.value) return null
    try {
        return typeof graphData.value === 'string' ? JSON.parse(graphData.value) : graphData.value
    } catch (err) {
        console.error('Graph Data Parse Error:', err)
        return null
    }
})

/* MATERIAL DATA */
const PileList = computed(() => parsedGraphData.value?.material_cost ?? [])
const hasValidPileData = computed(() => PileList.value.some(isValidPileData))

const getDATATotalLabels = (pile: any) =>
    isValidPileData(pile) ? pile.weights.map((w: any) => `${w.diameter || 'Unknown'}mm`) : []

const getDATATotalDatasets = (pile: any): ChartDataset[] => {
    if (!isValidPileData(pile)) return []
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF']
    return [{
        label: 'Weight Distribution',
        data: pile.weights.map((w: any) => Number(w.weight) || 0),
        backgroundColor: colors.slice(0, pile.weights.length),
        hoverBackgroundColor: colors.slice(0, pile.weights.length).map((color: string) => color + 'CC'),
        borderWidth: 2,
        borderColor: '#ffffff',
        metadata: pile.weights.map((w: any) => ({
            diameter: w.diameter || 0,
            weight: Number(w.weight) || 0,
            price: Number(w.price) || 0,
        })),
    }]
}

const getMaterialCostChartOptions = (pile: any) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' as const },
        tooltip: {
            callbacks: {
                title: (ctx: any) => ctx[0]?.label || 'Unknown',
                label: (ctx: any) => {
                    const w = pile.weights?.[ctx.dataIndex]
                    return w ? [
                        `Diameter: ${w.diameter || 'Unknown'}mm`,
                        `Weight: ${(Number(w.weight) || 0).toFixed(2)} kg`,
                        `Price: ${(Number(w.price) || 0).toLocaleString()}`
                    ] : `Weight: ${ctx.parsed} kg`
                },
                afterLabel: (ctx: any) => {
                    const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0)
                    return total > 0 ? `Percentage: ${((ctx.parsed / total) * 100).toFixed(1)}%` : ''
                }
            }
        }
    }
})

const getTotalWeight = (pile: any) =>
    isValidPileData(pile) ? pile.weights.reduce((s: number, w: any) => s + (Number(w.weight) || 0), 0) : 0

const getTotalCost = (pile: any) =>
    isValidPileData(pile) ? pile.weights.reduce((s: number, w: any) => s + (Number(w.price) || 0), 0) : 0

/* RCC CHART DATA */
const CC = computed<RCC | null>(() => parsedGraphData.value?.rcc ?? null)

const hasValidCCData = computed(() =>
    CC.value && (
        (CC.value.total_price_brick && CC.value.total_price_brick > 0) ||
        (CC.value.total_price_stone && CC.value.total_price_stone > 0) ||
        (CC.value.ready_mixture_total && CC.value.ready_mixture_total > 0)
    )
)

const CCTotalLables = ref(['Brick', 'Stone', 'Ready Mixture'])
const CCSpecificLables = ref(['Cement', 'Sand', 'Stone', 'Brick'])
const MATERIALS = ['Cement', 'Sand', 'Stone', 'Brick'] as const
type MaterialName = typeof MATERIALS[number]

const VOLUME_KEY: Record<MaterialName, keyof RCC> = {
    Cement: 'cement_volume',
    Sand: 'sand_volume',
    Stone: 'stone_volume',
    Brick: 'brick_volume',
}

const TOTAL_PRICE_KEY: Record<MaterialName, keyof RCC> = {
    Cement: 'cement_price',
    Sand: 'sand_price',
    Stone: 'stone_price',
    Brick: 'brick_price',
}

/* RCC CHARTS */
const CCTotalDatasets = computed<ChartDataset[]>(() => {
    if (!hasValidCCData.value) {
        return [{
            label: 'Material Costs',
            data: [] as number[],
            backgroundColor: [] as string[],
            hoverBackgroundColor: [] as string[]
        }]
    }

    const raw = [
        CC.value?.total_price_brick || 0,
        CC.value?.total_price_stone || 0,
        CC.value?.ready_mixture_total || 0
    ]
    const colors = ['#FF6384', '#36A2EB', '#FFCE56']
    const hoverColors = ['#FF6B9D', '#4BC0C0', '#FFD93D']

    const filtered = raw
        .map((v, i) => ({ v, c: colors[i], h: hoverColors[i] }))
        .filter(x => x.v > 0)

    return [{
        label: 'Material Costs',
        data: filtered.map(x => x.v),
        backgroundColor: filtered.map(x => x.c),
        hoverBackgroundColor: filtered.map(x => x.h)
    }]
})

const CCSpecificDatasets = computed<ChartDataset[]>(() => [{
    label: 'Material Prices',
    data: [
        CC.value?.cement_price || 0,
        CC.value?.sand_price || 0,
        CC.value?.stone_price || 0,
        CC.value?.brick_price || 0
    ],
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#36A2EB']
}])

const barChartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        tooltip: {
            callbacks: {
                label: (ctx: any) => {
                    if (!CC.value) return ''

                    const matName = MATERIALS[ctx.dataIndex] as MaterialName
                    const mats = CC.value.materials_cost || []
                    const mat = mats.find((m: any) => m.name === matName)

                    const vol = Number(CC.value[VOLUME_KEY[matName]] || 0)
                    const totalPrice = Number(CC.value[TOTAL_PRICE_KEY[matName]] || 0)

                    return mat ? [
                        `Company: ${mat.company_name || 'Unknown'}`,
                        `Unit Price: ${mat.price || 0}`,
                        `Volume: ${vol.toFixed(2)}`,
                        `Total Price: ${totalPrice.toFixed(2)}`
                    ] : `Price: ${ctx.parsed?.y || 0}`
                }
            }
        }
    }
}))

/* EVENTS */
const handleChartClick = (_event: any, elements: any[]) => {
    if (elements.length) {
        const el = elements[0]
        console.log('Clicked on:', { datasetIndex: el.datasetIndex, index: el.index })
    }
}
</script>