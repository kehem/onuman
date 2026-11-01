<!-- src/pages/Exterior/Tiles -->
<template>
    <DefaultLayouts>
        <div class="main-screen project-insider">
            <!-- TOP SECTION: PROJECT PATH -->
            <FinishPath :active="'Tiles'" />

            <section class="flex-col-container" ref="container">
                <!-- ------------------------------------------
                 * INPUT CONTAINER
                 * ------------------------------------------ -->
                <aside ref="leftPanel" class="onuman-insider-scrollbar">
                    <TilesInputs @submit-response="handleSubmitResponse" :projectID="projectId"
                        :tilesData="selectedTilesData" :unit="currentUnit" />
                </aside>

                <!-- ------------------------------------------
                 * OUTPUT CONTAINER (TABLE, TABS, DETAILS, RCC)
                 * ------------------------------------------ -->
                <aside ref="rightPanel" class="span-8 onuman-insider-scrollbar onuman-input-height-2">
                    <div v-if="toggleStore.isDetailedView">
                        <!-- ------------------------------------------
                     * FLOOR & TILES TYPE TABS
                     * ------------------------------------------ -->
                        <Tabs :mainTabs="mainTabs" @update:selectedMainTab="handleMainTabSelect"
                            :initialMainTab="initialMainTab" />

                        <!-- ------------------------------------------
                     * TILES TABLE
                     * ------------------------------------------ -->
                        <section class="formatted-table" style="width: 95%;">
                            <h2 class="text-center">TILES</h2>
                            <table
                                class="onuman-table text-center row-border-all tiles-border-all hover-border actioned">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>L. Charge</th>
                                        <th>Type</th>
                                        <th>Width</th>
                                        <th>Length</th>
                                        <th>Height</th>
                                        <th>Stair Top</th>
                                        <th>Quantity</th>
                                        <th>Amount</th>
                                        <th><b>Area</b></th>
                                        <th><b>Volume</b></th>
                                        <th class="action">Action</th>
                                    </tr>
                                </thead>

                                <tbody class="onuman-insider-scrollbar">
                                    <!-- ------------------------------------------
                                 * LOOP THROUGH EACH TILES ENTRY
                                 * ------------------------------------------ -->
                                    <tr v-for="tiles in getResponse" :key="tiles.id">
                                        <!-- name -->
                                        <td>
                                            <Comments :typeid="tiles.id" :type="type" />
                                            {{ tiles.name }}
                                        </td>
                                        <!-- labour_bill -->
                                        <td>{{ formatNumber(tiles.labour_bill) }}/=</td>
                                        <!-- type -->
                                        <td>{{ tiles.tiles_type }}</td>
                                        <!-- width -->
                                        <td>
                                            <span v-if="tiles.width !== undefined && tiles.width > 0">
                                                {{ formatNumber(unitStore.convertUnit('mm', tiles.width)) }} {{
                                                    unitStore.targetUnit }}
                                            </span>
                                            <span v-else style="color: #ac5;">N/A</span>
                                        </td>
                                        <!-- length -->
                                        <td>
                                            <span v-if="tiles.length !== undefined && tiles.length > 0">
                                                {{ formatNumber(unitStore.convertUnit('mm', tiles.length)) }} {{
                                                    unitStore.targetUnit }}
                                            </span>
                                            <span v-else style="color: #ac5;">N/A</span>
                                        </td>
                                        <!-- height -->
                                        <td>{{ formatNumber(unitStore.convertUnit('mm', tiles.height)) }} {{
                                            unitStore.targetUnit }}</td>
                                        <!-- stair_height -->
                                        <td>{{ formatNumber(unitStore.convertUnit('mm', tiles.stair_height)) }} {{
                                            unitStore.targetUnit }}</td>
                                        <!-- quantity -->
                                        <td>{{ formatNumber(tiles.quantity) }}</td>
                                        <!-- amount -->
                                        <td>{{ formatNumber(tiles.amount) }}</td>
                                        <!-- area -->
                                        <td>
                                            {{ formatNumber(unitStore.convertUnit('mm', tiles.area, 2)) }} {{
                                                unitStore.targetUnit }}<sup>2</sup>
                                        </td>
                                        <!-- volume -->
                                        <td>
                                            {{ formatNumber(unitStore.convertUnit('mm', tiles.volume, 3)) }} {{
                                                unitStore.targetUnit }}<sup>3</sup>
                                        </td>
                                        <!-- action -->
                                        <td class="action">
                                            <Actions :type="type" :sectionDATA="tiles"
                                                @send-data="handleDataFromActions" @delete-data="handleDelete" />
                                        </td>
                                    </tr>

                                    <!-- ------------------------------------------
                                 * TOTAL VOLUME AND DRY VOLUME
                                 * ------------------------------------------ -->
                                    <tr class="sub-total">
                                        <td colspan="10">Total Volume</td>
                                        <td colspan="2">
                                            {{ formatNumber(unitStore.convertUnit('mm', totalVolume, 3)) }} {{
                                                unitStore.targetUnit }}<sup>3</sup>
                                        </td>
                                    </tr>
                                    <tr class="sub-total">
                                        <td colspan="10">Total Dry Volume</td>
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
import FinishPath from '../../components/Dashboard/FinishPath.vue';
import BottomBar from '../../components/Dashboard/BottomBar.vue';
import TilesInputs from '../../components/INPUTS/TILES/TilesInputs.vue';
import Actions from '../../components/OUTPUTS/Actions.vue';
import Tabs from '../../components/OUTPUTS/Tabs.vue';
import RCCCalculation from '../../components/OUTPUTS/RCCCalculation.vue';
import { useToast } from '../../composables/Toast';
import { useApi } from '../../composables/useApi';
const { get, delete: del } = useApi()
import { formatNumber } from '../../composables/DecimalNumberValidator';
import { useUnitStore } from '../../stores/unitStore';
import { TilesItem } from '../../Interfaces/Tiles';
import { InputItems } from '../../Interfaces/Inputs';
import { useSimpleColumnResize } from '../../composables/useColumnResize';
const { container, leftPanel, rightPanel } = useSimpleColumnResize()

import Graph from '../../components/OUTPUTS/FINISH_WORK/TILES/Graph.vue';
import { useToggleViewStore } from '../../stores/useToggleViewStore'
// TOGGLE GRAPH OR DETAILED
const toggleStore = useToggleViewStore()

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
 * STATE: API CLIENT, TILES RESPONSE, SELECTED TILES
 * ------------------------------------------ */
const getResponse = ref<TilesItem[]>([]);
const selectedTilesData = ref<TilesItem | null>(null);

/* ------------------------------------------
 * COMPUTED: TOTAL VOLUME
 * ------------------------------------------ */
const totalVolume = computed(() => {
    return getResponse.value.reduce((sum, tiles) => sum + (tiles.volume || 0), 0);
});

/* ------------------------------------------
 * TABS: FLOOR & SUB TAB OPTIONS
 * ------------------------------------------ */
const totalFloors = Number(useRoute().query.totalFloors);
const mainTabs = Array.from({ length: totalFloors }, (_, i) => i + 1);
const selectedMainTab = ref<number | null>(null);
const initialMainTab = ref<number | null>(null);
const isInitialLoadComplete = ref(false);

function handleMainTabSelect(value: number) {
    selectedMainTab.value = value;
}

watch([selectedMainTab], ([main]) => {
    if (main !== null && isInitialLoadComplete.value) {
        fetchTilesData();
    }
});

/* ------------------------------------------
 * FETCH TILES DATA LATEST FIRST
 * ------------------------------------------ */
const fetchLatestTilesData = async () => {
    try {




        const response = await get(`/api/tiles/latest?projectId=${projectId.value}`);
        getResponse.value = response;

        if (response && response.length > 0) {
            const firstItem = response[0];
            initialMainTab.value = firstItem.floor;

            selectedMainTab.value = firstItem.floor;

            await nextTick();
            isInitialLoadComplete.value = true;
        }
    } catch (error: any) {
        const errorMessage = error.response?.message || error.message || 'Failed to fetch latest tiles data';
        showToast('error', errorMessage, 5000, 'right-bottom');
        console.error('Fetch latest tiles data error:', error);
    }
};

/* ------------------------------------------
 * INITIALIZE DATA ON COMPONENT MOUNT
 * ------------------------------------------ */
onMounted(() => {
    fetchLatestTilesData();
});

/* ------------------------------------------
 * FETCH TILES DATA BASED ON SELECTED TAB
 * ------------------------------------------ */
const fetchTilesData = async () => {
    try {




        const response = await get(`/api/tiles/list/${selectedMainTab.value}?projectId=${projectId.value}`);
        getResponse.value = response;
    } catch (error: any) {
        const errorMessage = error.response?.message || error.message || 'Failed to fetch tiles data';
        showToast('error', errorMessage, 5000, 'right-bottom');
        console.error('Fetch tiles data error:', error);
    }
};

/* ------------------------------------------
 * HANDLE FORM SUBMIT RESPONSE FROM TilesInputs
 * ------------------------------------------ */
const handleSubmitResponse = (response: TilesItem) => {
    if (response) {
        const index = getResponse.value.findIndex(tiles => tiles.id === response.id);
        if (index !== -1) {
            getResponse.value[index] = response; // UPDATE EXISTING TILES
        } else {
            getResponse.value.push(response); // ADD NEW TILES
        }
        selectedTilesData.value = null;
        showToast('success', index !== -1 ? 'Tiles updated successfully' : 'Tiles created successfully', 5000, 'right-bottom');
    }
};

/* ------------------------------------------
 * HANDLE EDIT ACTION FROM Actions COMPONENT
 * ------------------------------------------ */
const handleDataFromActions = (data: InputItems) => {
    if (!data.selectedFloors || !Array.isArray(data.selectedFloors) || Number(data.selectedFloors.length) === 0) {
        data.selectedFloors = [1]; // SET DEFAULT FLOOR
    }
    selectedTilesData.value = data as TilesItem;
};

/* ------------------------------------------
 * HANDLE DELETE ACTION FROM Actions COMPONENT
 * ------------------------------------------ */
const handleDelete = async (id: string) => {
    const tilesId = Number(id);
    const confirmed = await window.electronAPI.showConfirmDialog('Are you sure you want to delete this item?');
    if (!confirmed) return;
    try {


        await del(`/api/tiles/delete/${tilesId}`);
        getResponse.value = getResponse.value.filter(tiles => tiles.id !== tilesId);
        showToast('success', 'Tiles deleted successfully', 5000, 'right-bottom');
    } catch (error: any) {
        const errorMessage = error.response?.message || error.message || 'Failed to delete tiles';
        showToast('error', errorMessage, 5000, 'right-bottom');
        console.error('Delete tiles error:', error);
    }
};

</script>