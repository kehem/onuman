<!-- src/pages/Exterior/Beam -->
<template>
    <DefaultLayouts>
        <div class="main-screen project-insider">
            <!-- TOP SECTION: PROJECT PATH -->
            <CurrentPath :active="'Beam'" />

            <section class="flex-col-container" ref="container">
                <!-- ------------------------------------------
                 * INPUT CONTAINER
                 * ------------------------------------------ -->
                <aside ref="leftPanel" class="onuman-insider-scrollbar">
                    <BeamInputs @submit-response="handleSubmitResponse" :projectID="projectId"
                        :beamData="selectedBeamData" :unit="currentUnit" />
                </aside>

                <!-- ------------------------------------------
                 * OUTPUT CONTAINER (TABLE, TABS, DETAILS, RCC)
                 * ------------------------------------------ -->
                <aside ref="rightPanel" class="span-8 onuman-insider-scrollbar onuman-input-height-2">

                    <div v-if="toggleStore.isDetailedView">
                        <!-- ------------------------------------------
                     * FLOOR & BEAM TYPE TABS
                     * ------------------------------------------ -->
                        <Tabs :mainTabs="mainTabs" :subTabs="subTabs" @update:selectedMainTab="handleMainTabSelect"
                            :exceptions="'grade'" @update:selectedSubTab="handleSubTabSelect" :itemType="'Beam Type'"
                            :initialMainTab="initialMainTab" :initialSubTab="initialSubTab" />

                        <!-- ------------------------------------------
                     * BEAM TABLE
                     * ------------------------------------------ -->
                        <section class="formatted-table" style="width: 95%;">
                            <h2 class="text-center">BEAM</h2>
                            <table class="onuman-table text-center row-border-all beam-border-all hover-border">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Quantity</th>
                                        <th>Height</th>
                                        <th>Width</th>
                                        <th>Length</th>
                                        <th><b>Area</b></th>
                                        <th><b>Volume</b></th>
                                        <th class="action">Action</th>
                                    </tr>
                                </thead>

                                <tbody class="onuman-insider-scrollbar">
                                    <!-- ------------------------------------------
                                 * LOOP THROUGH EACH BEAM ENTRY
                                 * ------------------------------------------ -->
                                    <tr v-for="beam in getResponse" :key="beam.id">
                                        <td>
                                            <Comments :typeid="beam.id" :type="type" />
                                            {{ beam.name }}
                                        </td>
                                        <td>{{ formatNumber(beam.quantity) }}</td>
                                        <td>{{ formatNumber(unitStore.convertUnit('mm', beam.height)) }} {{
                                            unitStore.targetUnit }}</td>
                                        <td>
                                            <span v-if="beam.width !== undefined && beam.width > 0">
                                                {{ formatNumber(unitStore.convertUnit('mm', beam.width)) }} {{
                                                    unitStore.targetUnit }}
                                            </span>
                                            <span v-else style="color: #ac5;">N/A</span>
                                        </td>
                                        <td>
                                            <span v-if="beam.length !== undefined && beam.length > 0">
                                                {{ formatNumber(unitStore.convertUnit('mm', beam.length)) }} {{
                                                    unitStore.targetUnit }}
                                            </span>
                                            <span v-else style="color: #ac5;">N/A</span>
                                        </td>
                                        <td>
                                            {{ formatNumber(unitStore.convertUnit('mm', beam.area, 2)) }} {{
                                                unitStore.targetUnit }}<sup>2</sup>
                                        </td>
                                        <td>
                                            {{ formatNumber(unitStore.convertUnit('mm', beam.volume, 3)) }} {{
                                                unitStore.targetUnit }}<sup>3</sup>
                                        </td>
                                        <td class="action">
                                            <Actions :type="type" :sectionDATA="beam" @send-data="handleDataFromActions"
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
                     * REINFORCEMENT AND STIRRUPS TABLE
                     * ------------------------------------------ -->
                        <div class="expand-details">
                            <Reinforcements :reinforcements="onlyReinforcements" />
                            <Stirrups :stirrups="onlyStirrups" :projectName="projectName" />
                        </div>

                        <!-- ------------------------------------------
                     * RCC CALCULATION BLOCK
                     * ------------------------------------------ -->
                        <RCCCalculation :projectId="projectId" :type="type" :totalVolume="totalVolume" />
                    </div>

                    <Graph v-if="toggleStore.isGraphView" :initialMainTab="initialMainTab"
                        :initialSubTab="initialSubTab" />
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
import BeamInputs from '../../components/INPUTS/BEAM/BeamInputs.vue';
import Actions from '../../components/OUTPUTS/Actions.vue';
import Tabs from '../../components/OUTPUTS/Tabs.vue';
import Reinforcements from '../../components/OUTPUTS/Reinforcements.vue';
import Stirrups from '../../components/OUTPUTS/Stirrups.vue';
import RCCCalculation from '../../components/OUTPUTS/RCCCalculation.vue';
import { useToast } from '../../composables/Toast';
import { useApi } from '../../composables/useApi';
const { get, delete: del } = useApi()

import { formatNumber } from '../../composables/DecimalNumberValidator';
import { useUnitStore } from '../../stores/unitStore';
import { BeamItem } from '../../Interfaces/Beam';
import { InputItems, GroupedReinforcement } from '../../Interfaces/Inputs';
import { useSimpleColumnResize } from '../../composables/useColumnResize';
const { container, leftPanel, rightPanel } = useSimpleColumnResize()

// TOGGLE GRAPH OR DETAILED
import { useToggleViewStore } from '../../stores/useToggleViewStore'
const toggleStore = useToggleViewStore()
import Graph from '../../components/OUTPUTS/BEAM/Graph.vue';

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
 * STATE: API CLIENT, BEAM RESPONSE, SELECTED BEAM
 * ------------------------------------------ */
const getResponse = ref<BeamItem[]>([]);
const selectedBeamData = ref<BeamItem | null>(null);

/* ------------------------------------------
 * COMPUTED: TOTAL VOLUME
 * ------------------------------------------ */
const totalVolume = computed(() => {
    return getResponse.value.reduce((sum, beam) => sum + (beam.volume || 0), 0);
});

/* ------------------------------------------
 * COMPUTED: GROUPED REINFORCEMENTS
 * ------------------------------------------ */
const onlyReinforcements = computed<GroupedReinforcement[]>(() => {
    return getResponse.value.map(beam => ({
        columnName: beam.name,
        beamName: beam.name,
        reinforcements: (beam.reinforcements || []).map(reinforcement => ({
            rod_qty: reinforcement.rod_qty,
            rod_diameter: reinforcement.rod_diameter,
            support: reinforcement.support ?? false,
            weight: reinforcement.weight ?? 0,
            columnName: beam.name,
        })),
    }));
});

/* ------------------------------------------
 * COMPUTED: GROUPED STIRRUPS
 * ------------------------------------------ */
const onlyStirrups = computed(() => {
    const grouped: Record<string, any> = {};
    getResponse.value.forEach(beam => {
        const stirrups = beam.stirrups || [];
        if (!grouped[beam.name]) {
            grouped[beam.name] = {
                beamName: beam.name,
                columnName: beam.name,
                stirrups: []
            };
        }
        grouped[beam.name].stirrups.push(...stirrups.map(s => ({
            ...s,
            beamName: beam.name,
            weight: Number(s.weight) || 0,
            total_ring: Number(s.total_ring) || 0,
            diameter: Number(s.diameter) || 0,
            deduction: Number(s.deduction) || 0,
            height: s.height !== undefined ? Number(s.height) : undefined,
        })));
    });
    return Object.values(grouped);
});

/* ------------------------------------------
 * TABS: FLOOR & SUB TAB OPTIONS
 * ------------------------------------------ */
const totalFloors = Number(useRoute().query.totalFloors);
const mainTabs = Array.from({ length: totalFloors }, (_, i) => i + 1);
const subTabs = ['grade', 'floor', 'lintel'];
const selectedMainTab = ref<number | null>(null);
const selectedSubTab = ref<string | null>(null);
const initialMainTab = ref<number | null>(null);
const initialSubTab = ref<string | null>(null);

// Flag to track if initial data loading is complete
const isInitialLoadComplete = ref(false);

// Watch for tab changes - only trigger fetchBeamData after initial load is complete
watch([selectedMainTab, selectedSubTab], ([main, sub]) => {
    if (main !== null && sub !== null && isInitialLoadComplete.value) {
        fetchBeamData();
    }
});

function handleMainTabSelect(value: number) {
    selectedMainTab.value = value;
}

function handleSubTabSelect(value: string) {
    selectedSubTab.value = value;
}

const projectName = computed(() => getResponse.value.map(p => p.name));

/* ------------------------------------------
 * FETCH BEAM DATA BASED ON SELECTED TAB
 * ------------------------------------------ */
// Fetch latest beam data (for initial load)
const fetchLatestBeamData = async () => {
    try {
        const response = await get(`/api/beam/latest?projectId=${projectId.value}`);
        getResponse.value = response;

        // Set initial tab values based on response data
        if (response && response.length > 0) {
            const firstItem = response[0];
            initialMainTab.value = firstItem.floor;
            initialSubTab.value = firstItem.beam_type; // Assuming beam has beam_type field

            // Set the reactive variables for tab display (without triggering watcher)
            selectedMainTab.value = firstItem.floor;
            selectedSubTab.value = firstItem.beam_type;

            // Wait for next tick to ensure all components are updated
            await nextTick();

            // Mark initial load as complete - this will enable the watcher for future tab changes
            isInitialLoadComplete.value = true;
        }
    } catch (error: any) {
        const errorMessage = error.response?.message || error.message || 'Failed to fetch latest beam data';
        showToast('error', errorMessage, 5000, 'right-bottom');
        console.error('Fetch latest beam data error:', error);
    }
};
onMounted(() => {
    fetchLatestBeamData();
});


const fetchBeamData = async () => {
    try {
        const response = await get(`/api/beam/list/${selectedMainTab.value}/${selectedSubTab.value}?projectId=${projectId.value}`);
        getResponse.value = response;
    } catch (error: any) {
        const errorMessage = error.response?.message || error.message || 'Failed to fetch beam data';
        showToast('error', errorMessage, 5000, 'right-bottom');
        console.error('Fetch beam data error:', error);
    }
};

/* ------------------------------------------
 * HANDLE FORM SUBMIT RESPONSE FROM BeamInputs
 * ------------------------------------------ */
const handleSubmitResponse = (response: BeamItem) => {
    if (response) {
        const index = getResponse.value.findIndex(beam => beam.id === response.id);
        if (index !== -1) {
            getResponse.value[index] = response; // UPDATE EXISTING BEAM
        } else {
            getResponse.value.push(response); // ADD NEW BEAM
        }
        selectedBeamData.value = null;
        showToast('success', index !== -1 ? 'Beam updated successfully' : 'Beam created successfully', 5000, 'right-bottom');
    }
};

/* ------------------------------------------
 * HANDLE EDIT ACTION FROM Actions COMPONENT
 * ------------------------------------------ */
const handleDataFromActions = (data: InputItems) => {
    if (!data.selectedFloors || !Array.isArray(data.selectedFloors) || Number(data.selectedFloors.length) === 0) {
        data.selectedFloors = [1]; // SET DEFAULT FLOOR
    }
    selectedBeamData.value = data as BeamItem;
};

/* ------------------------------------------
 * HANDLE DELETE ACTION FROM Actions COMPONENT
 * ------------------------------------------ */
const handleDelete = async (id: string) => {
    const confirmed = await window.electronAPI.showConfirmDialog('Are you sure you want to delete this beam?');
    if (!confirmed) return;

    const beamId = Number(id);
    try {
        await del(`/api/beam/delete/${beamId}`);
        getResponse.value = getResponse.value.filter(beam => beam.id !== beamId);
        showToast('success', 'Beam deleted successfully', 5000, 'right-bottom');
    } catch (error: any) {
        const errorMessage = error.response?.message || error.message || 'Failed to delete beam';
        showToast('error', errorMessage, 5000, 'right-bottom');
        console.error('Delete beam error:', error);
    }
};
</script>