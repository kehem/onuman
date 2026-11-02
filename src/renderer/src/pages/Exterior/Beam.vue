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
                        <StructuralResults :columns="getResponse" :type="type" :totalVolume="totalVolume" kind="beam"
                            @edit="handleDataFromActions" @delete="handleDelete" />

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
import StructuralResults from '../../components/OUTPUTS/StructuralResults.vue';
import CurrentPath from '../../components/Dashboard/CurrentPath.vue';
import BottomBar from '../../components/Dashboard/BottomBar.vue';
import BeamInputs from '../../components/INPUTS/BEAM/BeamInputs.vue';
import Tabs from '../../components/OUTPUTS/Tabs.vue';
import RCCCalculation from '../../components/OUTPUTS/RCCCalculation.vue';
import { useToast } from '../../composables/Toast';
import { useApi } from '../../composables/useApi';
const { get, delete: del } = useApi()

import { BeamItem } from '../../Interfaces/Beam';
import { InputItems } from '../../Interfaces/Inputs';
import { useSimpleColumnResize } from '../../composables/useColumnResize';
const { container, leftPanel, rightPanel } = useSimpleColumnResize()

// TOGGLE GRAPH OR DETAILED
import { useToggleViewStore } from '../../stores/useToggleViewStore'
const toggleStore = useToggleViewStore()
import Graph from '../../components/OUTPUTS/BEAM/Graph.vue';

/* ------------------------------------------
 * INITIALIZE TOAST AND ROUTER
 * ------------------------------------------ */
const { showToast } = useToast();
const router = useRouter();

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