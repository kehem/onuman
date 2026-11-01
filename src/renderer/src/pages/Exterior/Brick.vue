<!-- src/pages/Exterior/Brick -->
<template>
    <DefaultLayouts>
        <div class="main-screen project-insider">
            <!-- TOP SECTION: PROJECT PATH -->
            <CurrentPath :active="'Brick'" />

            <section class="flex-col-container" ref="container">
                <!-- ------------------------------------------
                 * INPUT CONTAINER
                 * ------------------------------------------ -->
                <aside ref="leftPanel" class="onuman-insider-scrollbar">
                    <BrickInputs @submit-response="handleSubmitResponse" :projectID="projectId"
                        :wallData="selectedBrickData" :unit="currentUnit" />
                </aside>
                <!-- ------------------------------------------
                 * OUTPUT CONTAINER (TABLE, TABS, DETAILS, RCC)
                 * ------------------------------------------ -->
                <aside ref="rightPanel" class="span-8 onuman-insider-scrollbar onuman-input-height-2">

                    <div v-if="toggleStore.isDetailedView">
                        <!-- ------------------------------------------
                     * FLOOR & BRICK TYPE TABS
                     * ------------------------------------------ -->
                        <Tabs :mainTabs="mainTabs" @update:selectedMainTab="handleMainTabSelect"
                            :initialMainTab="initialMainTab" />

                        <!-- ------------------------------------------
                     * BRICK TABLE
                     * ------------------------------------------ -->
                        <section class="formatted-table" style="width: 95%;">
                            <h2 class="text-center">BRICK</h2>
                            <table
                                class="onuman-table text-center row-border-all wall-border-all hover-border actioned">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Height</th>
                                        <th>Length</th>
                                        <th>Thickness</th>
                                        <th><b>Area</b></th>
                                        <th><b>Volume</b></th>
                                        <th><b>Bricks</b></th>
                                        <th class="action">Action</th>
                                    </tr>
                                </thead>

                                <tbody class="onuman-insider-scrollbar">
                                    <!-- ------------------------------------------
                                 * LOOP THROUGH EACH BRICK ENTRY
                                 * ------------------------------------------ -->
                                    <tr v-for="wall in getResponse" :key="wall.id">
                                        <td>
                                            <Comments :typeid="wall.id" :type="type" />
                                            {{ wall.name }}
                                        </td>
                                        <td>{{ formatNumber(unitStore.convertUnit('mm', wall.height)) }} {{
                                            unitStore.targetUnit }}</td>
                                        <td>{{ formatNumber(unitStore.convertUnit('mm', wall.length ?? 0)) }} {{
                                            unitStore.targetUnit }}</td>
                                        <td>
                                            {{ formatNumber(unitStore.convertUnit('mm', wall.thickness ?? 0)) }} {{
                                                unitStore.targetUnit }}
                                        </td>
                                        <td>
                                            {{ formatNumber(unitStore.convertUnit('mm', wall.area, 2)) }} {{
                                                unitStore.targetUnit }}<sup>2</sup>
                                        </td>
                                        <td>
                                            {{ formatNumber(unitStore.convertUnit('mm', wall.volume, 3)) }} {{
                                                unitStore.targetUnit }}<sup>3</sup>
                                        </td>
                                        <td>
                                            {{ wall.brick_pcs ?? 0 }} pcs
                                        </td>
                                        <td class="action">
                                            <Actions :type="type" :sectionDATA="wall" @send-data="handleDataFromActions"
                                                @delete-data="handleDelete" />
                                        </td>
                                    </tr>

                                    <!-- ------------------------------------------
                                 * TOTAL VOLUME AND DRY VOLUME
                                 * ------------------------------------------ -->
                                    <tr class="sub-total">
                                        <td colspan="6">Total Volume</td>
                                        <td colspan="2">
                                            {{ formatNumber(unitStore.convertUnit('mm', totalVolume, 3)) }} {{
                                                unitStore.targetUnit }}<sup>3</sup>
                                        </td>
                                    </tr>
                                    <tr class="sub-total">
                                        <td colspan="6">Total Dry Volume</td>
                                        <td colspan="2">
                                            {{ formatNumber(unitStore.convertUnit('mm', totalVolume * 1.54, 3)) }} {{
                                                unitStore.targetUnit }}<sup>3</sup>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>

                        <!-- ------------------------------------------
                     * RCC CALCULATION BLOCK
                     * ------------------------------------------ -->
                        <RCCCalculation :projectId="projectId" :type="type" :totalVolume="totalVolume" />
                    </div>
                    <Graph v-if="toggleStore.isGraphView" :initialMainTab="initialMainTab" />
                </aside>
            </section>
        </div>
        <BottomBar />
    </DefaultLayouts>
</template>

<!-- ------------------------------------------
 * SCRIPT SECTION STARTS BELOW WITH FULL COMMENTS
 * ------------------------------------------ -->
<script setup lang="ts">

/* ------------------------------------------
 * IMPORTS: COMPONENTS, STORES, UTILITIES
 * ------------------------------------------ */
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DefaultLayouts from '../../layouts/DefaultLayouts.vue';
import Comments from '../../components/Dashboard/Comments.vue';
import CurrentPath from '../../components/Dashboard/CurrentPath.vue';
import BottomBar from '../../components/Dashboard/BottomBar.vue';
import BrickInputs from '../../components/INPUTS/BRICK/BrickInputs.vue';
import Actions from '../../components/OUTPUTS/Actions.vue';
import Tabs from '../../components/OUTPUTS/Tabs.vue';
import RCCCalculation from '../../components/OUTPUTS/RCCCalculation.vue';
import { useToast } from '../../composables/Toast';
import { useApi } from '../../composables/useApi';
const { get, delete: del } = useApi()
import { formatNumber } from '../../composables/DecimalNumberValidator';
import { useUnitStore } from '../../stores/unitStore';
import { BPP } from '../../Interfaces/BPP';
import { InputItems } from '../../Interfaces/Inputs';
import { useSimpleColumnResize } from '../../composables/useColumnResize';
const { container, leftPanel, rightPanel } = useSimpleColumnResize()

// TOGGLE GRAPH OR DETAILED
import { useToggleViewStore } from '../../stores/useToggleViewStore'
const toggleStore = useToggleViewStore()
import Graph from '../../components/OUTPUTS/BRICK/Graph.vue';

/* ------------------------------------------
 * INITIALIZE TOAST, ROUTER, UNIT STORE
 * ------------------------------------------ */
const { showToast } = useToast();
const router = useRouter();
const unitStore = useUnitStore();

/* ------------------------------------------
 * COMPUTED: PROJECT ID & UNIT FROM URL
 * ------------------------------------------ */
const projectId = computed(() => {
    const queryString = router.currentRoute.value.fullPath.split('?')[1];
    const params = new URLSearchParams(queryString);
    return Number(params.get('id'));
});

const currentUnit = computed(() => {
    const unit = router.currentRoute.value.query.unit;
    if (Array.isArray(unit)) return unit[0] ?? undefined;
    return unit ?? undefined;
});

const type = computed(() => router.currentRoute.value.path.replace('/', ''));

/* ------------------------------------------
 * STATE: API CLIENT, BRICK RESPONSE, SELECTED BRICK
 * ------------------------------------------ */
const getResponse = ref<BPP[]>([]);
const selectedBrickData = ref<BPP | null>(null);

/* ------------------------------------------
 * COMPUTED: TOTAL VOLUME
 * ------------------------------------------ */
const totalVolume = computed(() => {
    return getResponse.value.reduce((sum, wall) => sum + (wall.volume || 0), 0);
});

/* ------------------------------------------
 * TABS: FLOOR & SUB TAB OPTIONS
 * ------------------------------------------ */
const totalFloors = Number(useRoute().query.totalFloors);
const mainTabs = Array.from({ length: totalFloors }, (_, i) => i + 1);
const selectedMainTab = ref<number | null>(null);
const initialMainTab = ref<number | null>(null);

// Flag to track if initial data loading is complete
const isInitialLoadComplete = ref(false);

function handleMainTabSelect(value: number) {
    selectedMainTab.value = value;
}
watch([selectedMainTab], ([main]) => {
    if (main !== null && isInitialLoadComplete.value) {
        fetchBrickData();
    }
});

/* ------------------------------------------
 * FETCH BRICK DATA LATEST FIRST
 * ------------------------------------------ */
const fetchLatestBrickData = async () => {
    try {

        const response = await get(`/api/bpp/latest?projectId=${projectId.value}`);
        getResponse.value = response;

        if (response && response.length > 0) {
            const firstItem = response[0];
            initialMainTab.value = firstItem.floor;
            selectedMainTab.value = firstItem.floor;
            await nextTick();

            isInitialLoadComplete.value = true;
        }
    } catch (error: any) {
        const errorMessage = error.response?.message || error.message || 'Failed to fetch latest brick data';
        showToast('error', errorMessage, 5000, 'right-bottom');
        console.error('Fetch latest brick data error:', error);
    }
};
/* ------------------------------------------
 * INITIALIZE DATA ON COMPONENT MOUNT
 * ------------------------------------------ */
onMounted(() => {
    fetchLatestBrickData();
});
/* ------------------------------------------
 * FETCH BRICK DATA BASED ON SELECTED TAB
 * ------------------------------------------ */
const fetchBrickData = async () => {
    try {
        const response = await get(`/api/bpp/list/${selectedMainTab.value}?projectId=${projectId.value}`);
        getResponse.value = response;
    } catch (error: any) {
        const errorMessage = error.response?.message || error.message || 'Failed to fetch wall data';
        showToast('error', errorMessage, 5000, 'right-bottom');
    }
};


/* ------------------------------------------
 * HANDLE FORM SUBMIT RESPONSE FROM BrickInputs
 * ------------------------------------------ */
const handleSubmitResponse = (response: BPP) => {
    if (response) {
        const index = getResponse.value.findIndex(wall => wall.id === response.id);
        if (index !== -1) {
            getResponse.value[index] = response; // UPDATE EXISTING BRICK
        } else {
            getResponse.value.push(response); // ADD NEW BRICK
        }
        selectedBrickData.value = null;
        showToast('success', index !== -1 ? 'Brick updated successfully' : 'Brick created successfully', 5000, 'right-bottom');
    }
};

/* ------------------------------------------
 * HANDLE EDIT ACTION FROM Actions COMPONENT
 * ------------------------------------------ */
const handleDataFromActions = (data: InputItems) => {
    if (!data.selectedFloors || !Array.isArray(data.selectedFloors) || Number(data.selectedFloors.length) === 0) {
        data.selectedFloors = [1]; // SET DEFAULT FLOOR
    }
    selectedBrickData.value = data as BPP;
};

/* ------------------------------------------
 * HANDLE DELETE ACTION FROM Actions COMPONENT
 * ------------------------------------------ */
const handleDelete = async (id: string) => {
    const wallId = Number(id);
    const confirmed = await window.electronAPI.showConfirmDialog('Are you sure you want to delete this item?');
    if (!confirmed) return;
    try {
        await del(`/api/bpp/delete/${wallId}`);
        getResponse.value = getResponse.value.filter(wall => wall.id !== wallId);
        showToast('success', 'Brick deleted successfully', 5000, 'right-bottom');
    } catch (error: any) {
        const errorMessage = error.response?.message || error.message || 'Failed to delete wall';
        showToast('error', errorMessage, 5000, 'right-bottom');
        console.error('Delete wall error:', error);
    }
};

</script>