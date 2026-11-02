<!-- pages/Exterior/Footing.vue -->

<template>
  <DefaultLayouts>
    <div class="main-screen project-insider">
      <!-- TOP (PROJECT SUMMARY) -->
      <CurrentPath :active="'Footing'" />

      <section class="flex-col-container" ref="container">
        <!-- INPUT CONTAINER -->
        <aside ref="leftPanel" class="onuman-insider-scrollbar">
          <FootingInputs @submit-response="handleSubmitResponse" :projectID="projectId"
            :footingData="selectedFootingData" :unit="currentUnit" />
        </aside>

        <!-- OUTPUT CONTAINER -->
        <aside ref="rightPanel" class="span-8 onuman-insider-scrollbar onuman-input-height-2">

          <div v-if="toggleStore.isDetailedView">
            <!-- FOOTING TABLE -->
            <StructuralResults :columns="getResponse" :type="type" :totalVolume="totalVolume" kind="footing"
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
/* ------------------------------------------
 * IMPORTS AND INITIAL SETUP
 * ------------------------------------------ */
import { ref, onMounted, computed } from 'vue';
import DefaultLayouts from '../../layouts/DefaultLayouts.vue';
import { useRouter } from 'vue-router';
import { FootingItem } from '../../Interfaces/Footing';
import StructuralResults from '../../components/OUTPUTS/StructuralResults.vue';
import { useToast } from '../../composables/Toast';
import CurrentPath from '../../components/Dashboard/CurrentPath.vue';
import FootingInputs from '../../components/INPUTS/FOOTING/FootingInputs.vue';
import { useApi } from '../../composables/useApi';
const { get, delete: del } = useApi()
import RCCCalculation from '../../components/OUTPUTS/RCCCalculation.vue';
import BottomBar from '../../components/Dashboard/BottomBar.vue';
import { useSimpleColumnResize } from '../../composables/useColumnResize';
const { container, leftPanel, rightPanel } = useSimpleColumnResize()

// TOGGLE GRAPH OR DETAILED
import { useToggleViewStore } from '../../stores/useToggleViewStore'
const toggleStore = useToggleViewStore()
import Graph from '../../components/OUTPUTS/FOOTING/Graph.vue';

/* ------------------------------------------
 * UNIT CONVERSION STORE
 * ------------------------------------------ */
import { InputItems } from '../../Interfaces/Inputs';

/* ------------------------------------------
 * TOAST AND ROUTER INITIALIZATION
 * ------------------------------------------ */
const { showToast } = useToast();
const router = useRouter();

/* ------------------------------------------
 * EXTRACT PROJECT ID FROM URL
 * ------------------------------------------ */
const projectId = computed(() => {
  const queryString = router.currentRoute.value.fullPath.split('?')[1];
  const params = new URLSearchParams(queryString);
  return Number(params.get('id'));
});

/* ------------------------------------------
 * EXTRACT CURRENT UNIT FROM URL
 * ------------------------------------------ */
const currentUnit = computed(() => {
  const unit = router.currentRoute.value.query.unit;
  if (Array.isArray(unit)) return unit[0] ?? undefined;
  return unit ?? undefined;
});

/* ------------------------------------------
 * DETERMINE TYPE FROM ROUTE PATH
 * ------------------------------------------ */
const type = computed(() => router.currentRoute.value.path.replace('/', ''));

/* ------------------------------------------
 * API CLIENT INITIALIZATION
 * ------------------------------------------ */

/* ------------------------------------------
 * FOOTING DATA MANAGEMENT
 * ------------------------------------------ */
const getResponse = ref<FootingItem[]>([]);
const selectedFootingData = ref<FootingItem | null>(null);

/* ------------------------------------------
 * CALCULATE TOTAL VOLUME
 * ------------------------------------------ */
const totalVolume = computed(() => {
  return getResponse.value.reduce((sum, footing) => sum + (footing.volume || 0), 0);
});

/* ------------------------------------------
 * FETCH FOOTING DATA FROM API
 * ------------------------------------------ */
const fetchFootingData = async () => {
  try {


    const response = await get(`/api/footing/list?projectId=${projectId.value}`);
    getResponse.value = response;
  } catch (error: any) {
    const errorMessage = error.response?.message || error.message || 'Failed to fetch footing data';
    showToast('error', errorMessage, 5000, 'right-bottom');
    console.error('Fetch footing data error:', error);
  }
};

/* ------------------------------------------
 * HANDLE FORM SUBMISSION RESPONSE
 * ------------------------------------------ */
const handleSubmitResponse = (response: FootingItem) => {
  if (response) {
    const index = getResponse.value.findIndex(footing => footing.id === response.id);
    if (index !== -1) {
      getResponse.value[index] = response;
    } else {
      getResponse.value.push(response);
    }
    selectedFootingData.value = null;
    showToast('success', index !== -1 ? 'Footing updated successfully' : 'Footing created successfully', 5000, 'right-bottom');
  }
};

/* ------------------------------------------
 * HANDLE EDIT ACTION
 * ------------------------------------------ */
const handleDataFromActions = (data: InputItems | FootingItem) => {
  selectedFootingData.value = data as FootingItem;
};

/* ------------------------------------------
 * HANDLE DELETE ACTION
 * ------------------------------------------ */
const handleDelete = async (id: string) => {
  const footingId = Number(id);
  const confirmed = await window.electronAPI.showConfirmDialog('Are you sure you want to delete this item?');
  if (!confirmed) return;
  // const confirmed = window.confirm(
  //   'Are you sure you want to permanently delete this footing? This action cannot be undone.'
  // );

  // if (!confirmed) return;

  try {

    await del(`/api/footing/delete/${footingId}`);
    getResponse.value = getResponse.value.filter(footing => footing.id !== footingId);
    showToast('success', 'Footing deleted successfully', 5000, 'right-bottom');
  } catch (error: any) {
    const errorMessage = error.response?.message || error.message || 'Failed to delete footing';
    showToast('error', errorMessage, 5000, 'right-bottom');
    console.error('Delete footing error:', error);
  }
};

/* ------------------------------------------
 * INITIALIZE DATA ON COMPONENT MOUNT
 * ------------------------------------------ */
onMounted(fetchFootingData);
</script>