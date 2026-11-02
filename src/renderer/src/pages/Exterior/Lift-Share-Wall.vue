<!-- src/pages/Exterior/Lift Share Wall -->

<template>
  <DefaultLayouts>
    <div class="main-screen project-insider">
      <!-- TOP (PROJECT SUMMARY) -->
      <CurrentPath :active="'Share Wall'" />

      <section class="flex-col-container" ref="container">
        <!-- INPUT CONTAINER -->
        <aside ref="leftPanel" class="onuman-insider-scrollbar">
          <LiftInputs @submit-response="handleSubmitResponse" :projectID="projectId" :columnData="selectedColumnData"
            :unit="currentUnit" />
        </aside>
        <!-- OUTPUT CONTAINER -->
        <aside ref="rightPanel" class="span-8 onuman-insider-scrollbar onuman-input-height-2">
          <div v-if="toggleStore.isDetailedView">
            <!-- LIFT SHARE WALL TABLE -->
            <StructuralResults :columns="getResponse" :type="type" :totalVolume="totalVolume" kind="wall"
              @edit="handleDataFromActions" @delete="handleDelete" />

            <RCCCalculation :projectId="projectId" :type="type" :totalVolume="totalVolume" />
          </div>
          <Graph v-if="toggleStore.isGraphView" />

        </aside>
      </section>
    </div>
    <BottomBar />
  </DefaultLayouts>
</template>

<script setup lang="ts">
/* ============================
 * IMPORTS
 * ============================ */
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useToggleViewStore } from '../../stores/useToggleViewStore'
// TOGGLE GRAPH OR DETAILED
const toggleStore = useToggleViewStore()

import DefaultLayouts from '../../layouts/DefaultLayouts.vue';
import StructuralResults from '../../components/OUTPUTS/StructuralResults.vue';
import CurrentPath from '../../components/Dashboard/CurrentPath.vue';
import LiftInputs from '../../components/INPUTS/LIFT/LiftInputs.vue';
import RCCCalculation from '../../components/OUTPUTS/RCCCalculation.vue';
import BottomBar from '../../components/Dashboard/BottomBar.vue';
import Graph from '../../components/OUTPUTS/LIFT/Graph.vue';

import { ColumnItem } from '../../Interfaces/Column';
import { InputItems } from '../../Interfaces/Inputs';
import { useToast } from '../../composables/Toast';
import { useApi } from '../../composables/useApi';
const { get, delete: del } = useApi()
import { useSimpleColumnResize } from '../../composables/useColumnResize';

/* ============================
 * COLUMN RESIZING HANDLER
 * ============================ */
const { container, leftPanel, rightPanel } = useSimpleColumnResize();

/* ============================
 * TOAST AND ROUTER INITIALIZATION
 * ============================ */
const { showToast } = useToast();
const router = useRouter();

/* ============================
 * TOGGLE (GRAPH OR DETAILED)
 * ============================ */
const currentView = ref('graph')
onMounted(() => {
  const saved = localStorage.getItem('currentView')
  if (saved) {
    currentView.value = saved
  }
})

// Optional: watch localStorage in case another component updates it
watch(
  () => localStorage.getItem('currentView'),
  (val) => {
    if (val && val !== currentView.value) {
      currentView.value = val
    }
  }
)

/* ============================
 * COMPUTED: PROJECT ID FROM URL
 * ============================ */
const projectId = computed(() => {
  const queryString = router.currentRoute.value.fullPath.split('?')[1];
  const params = new URLSearchParams(queryString);
  return Number(params.get('id'));
});

/* ============================
 * COMPUTED: UNIT TYPE FROM URL
 * ============================ */
const currentUnit = computed(() => {
  const unit = router.currentRoute.value.query.unit;
  if (Array.isArray(unit)) return unit[0] ?? undefined;
  return unit ?? undefined;
});

/* ============================
 * COMPUTED: PAGE TYPE FROM ROUTE
 * ============================ */
const type = computed(() => router.currentRoute.value.path.replace('/', ''));

/* ============================
 * DATA VARIABLES
 * ============================ */
const getResponse = ref<ColumnItem[]>([]);
const selectedColumnData = ref<ColumnItem | null>(null);

/* ============================
 * COMPUTED: TOTAL VOLUME
 * ============================ */
const totalVolume = computed(() => {
  return getResponse.value.reduce((sum, column) => sum + (column.volume || 0), 0);
});

/* ============================
 * FUNCTION: FETCH COLUMN DATA FROM API
 * ============================ */
const fetchColumnData = async () => {
  try {


    const response = await get(`/api/lift/list?projectId=${projectId.value}`);
    getResponse.value = response;

  } catch (error: any) {
    const errorMessage = error.response?.message || error.message || 'Failed to fetch lift data';
    showToast('error', errorMessage, 5000, 'right-bottom');
  }
};

/* ============================
 * LIFECYCLE: ON MOUNT
 * ============================ */
onMounted(() => {
  fetchColumnData();
});

/* ============================
 * FUNCTION: HANDLE SUBMIT RESPONSE FROM FORM
 * ============================ */
const handleSubmitResponse = (response: ColumnItem) => {
  if (response) {
    const index = getResponse.value.findIndex(column => column.id === response.id);
    if (index !== -1) {
      getResponse.value[index] = response;
    } else {
      getResponse.value.push(response);
    }
    selectedColumnData.value = null;
    showToast('info', index !== -1 ? 'Lift share wall updated successfully' : 'Lift share wall created successfully', 5000, 'right-bottom');
  }
};

/* ============================
 * FUNCTION: HANDLE EDIT ACTION
 * ============================ */
const handleDataFromActions = (data: InputItems) => {
  if (!data.selectedFloors || !Array.isArray(data.selectedFloors) || Number(data.selectedFloors.length) === 0) {
    data.selectedFloors = [1]; // DEFAULT TO FLOOR 1
  }
  selectedColumnData.value = data as ColumnItem;
};

/* ============================
 * FUNCTION: HANDLE DELETE ACTION
 * ============================ */
const handleDelete = async (id: string) => {
  const columnId = Number(id);
  const confirmed = await window.electronAPI.showConfirmDialog('Are you sure you want to delete this item?');
  if (!confirmed) return;

  try {

    await del(`/api/lift/delete/${columnId}`);
    getResponse.value = getResponse.value.filter(column => column.id !== columnId);
    showToast('success', 'Lift share wall deleted successfully', 5000, 'right-bottom');

  } catch (error: any) {
    const errorMessage = error.response?.message || error.message || 'Failed to delete Lift share wall';
    showToast('error', errorMessage, 5000, 'right-bottom');
    console.error('Delete Lift share wall error:', error);
  }
};

</script>
