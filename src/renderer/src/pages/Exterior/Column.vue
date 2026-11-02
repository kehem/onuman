<!-- src/pages/Exterior/Column -->
<template>
  <DefaultLayouts>
    <div class="main-screen project-insider">
      <!-- TOP (PROJECT SUMMARY) -->
      <CurrentPath :active="'Column'" />

      <section class="flex-col-container" ref="container">
        <!-- INPUT CONTAINER -->
        <aside ref="leftPanel" class="onuman-insider-scrollbar">
          <ColumnInputs @submit-response="handleSubmitResponse" :projectID="projectId" :columnData="selectedColumnData"
            :unit="currentUnit" />
        </aside>

        <!-- OUTPUT CONTAINER -->
        <aside ref="rightPanel" class="span-8 onuman-insider-scrollbar onuman-input-height-2">

          <div v-if="toggleStore.isDetailedView">
            <!-- ALL FLOORS -->
            <Tabs :mainTabs="mainTabs" :subTabs="subTabs" :exceptions="'short'"
              @update:selectedMainTab="handleMainTabSelect" @update:selectedSubTab="handleSubTabSelect"
              :itemType="'Column Type'" :initialMainTab="initialMainTab" :initialSubTab="initialSubTab" />

            <StructuralResults :columns="getResponse" :type="type" :total-volume="totalVolume"
              @edit="handleDataFromActions" @delete="handleDelete" />

            <div class="overall-calculation-heading">
              <p>OVERALL / CURRENT SELECTION</p>
              <h2>CC calculation</h2>
            </div>
            <!-- RCC CALCULATION -->
            <RCCCalculation :projectId="projectId" :type="type" :totalVolume="totalVolume" />

          </div>
          <Graph v-if="toggleStore.isGraphView" :initialMainTab="initialMainTab" :initialSubTab="initialSubTab" />
        </aside>
      </section>
    </div>
    <BottomBar />
  </DefaultLayouts>
</template>

<!-- PAGES/Column.vue -->
<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import DefaultLayouts from '../../layouts/DefaultLayouts.vue';
import { useRouter } from 'vue-router';
import { ColumnItem } from '../../Interfaces/Column';
import { useToast } from '../../composables/Toast';
import CurrentPath from '../../components/Dashboard/CurrentPath.vue';
import ColumnInputs from '../../components/INPUTS/COLUMN/ColumnInputs.vue';
import StructuralResults from '../../components/OUTPUTS/StructuralResults.vue';
import { useApi } from '../../composables/useApi';
const { get, delete: del } = useApi()
import RCCCalculation from '../../components/OUTPUTS/RCCCalculation.vue';
import BottomBar from '../../components/Dashboard/BottomBar.vue';
import { useRoute } from 'vue-router';
import { useSimpleColumnResize } from '../../composables/useColumnResize';
const { container, leftPanel, rightPanel } = useSimpleColumnResize()

// TOGGLE GRAPH OR DETAILED
import { useToggleViewStore } from '../../stores/useToggleViewStore'
const toggleStore = useToggleViewStore()
import Graph from '../../components/OUTPUTS/COLUMN/Graph.vue';



// UNIT CONVERSION
import Tabs from '../../components/OUTPUTS/Tabs.vue';
import { InputItems } from '../../Interfaces/Inputs';

const { showToast } = useToast();
const router = useRouter();

// Extract project ID from URL
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


// Column data
const getResponse = ref<ColumnItem[]>([]);
const selectedColumnData = ref<ColumnItem | null>(null);
const initialMainTab = ref<number | null>(null);
const initialSubTab = ref<string | null>(null);

// Total volume
const totalVolume = computed(() => {
  return getResponse.value.reduce((sum, column) => sum + (column.volume || 0), 0);
});

// FLOOR AND COLUMN TYPE TAB COMPONENT
const totalFloors = Number(useRoute().query.totalFloors);

const mainTabs = Array.from({ length: totalFloors }, (_, i) => i + 1);
const subTabs = ['short', 'long'];

const selectedMainTab = ref<number | null>(null);
const selectedSubTab = ref<string | null>(null);

// Flag to track if initial data loading is complete
const isInitialLoadComplete = ref(false);

// Watch for tab changes - only trigger fetchColumnDataByTab after initial load is complete
watch([selectedMainTab, selectedSubTab], ([main, sub]) => {
  if (main !== null && sub !== null && isInitialLoadComplete.value) {
    fetchColumnDataByTab();
  }
});

function handleMainTabSelect(value: number) {
  selectedMainTab.value = value;
}

function handleSubTabSelect(value: string) {
  selectedSubTab.value = value;
}

// Fetch latest column data (for initial load)
const fetchLatestColumnData = async () => {
  try {

    const response = await get(`/api/column/latest?projectId=${projectId.value}`);
    getResponse.value = response;

    // Set initial tab values based on response data
    if (response && response.length > 0) {
      const firstItem = response[0];
      initialMainTab.value = firstItem.floor;
      initialSubTab.value = firstItem.column_type;

      // Set the reactive variables for tab display (without triggering watcher)
      selectedMainTab.value = firstItem.floor;
      selectedSubTab.value = firstItem.column_type;

      // Wait for next tick to ensure all components are updated
      await nextTick();

      // Mark initial load as complete - this will enable the watcher for future tab changes
      isInitialLoadComplete.value = true;
    }
  } catch (error: any) {
    const errorMessage = error.response?.message || error.message || 'Failed to fetch latest column data';
    showToast('error', errorMessage, 5000, 'right-bottom');
    console.error('Fetch latest column data error:', error);
  }
};

// Fetch column data by tab selection
const fetchColumnDataByTab = async () => {
  try {
    const response = await get(`/api/column/list/${selectedMainTab.value}/${selectedSubTab.value}?projectId=${projectId.value}`);
    getResponse.value = response;
  } catch (error: any) {
    const errorMessage = error.response?.message || error.message || 'Failed to fetch column data';
    showToast('error', errorMessage, 5000, 'right-bottom');
    console.error('Fetch column data error:', error);
  }
};

// Handle form submission response
const handleSubmitResponse = (response: ColumnItem) => {
  if (response) {
    const index = getResponse.value.findIndex(column => column.id === response.id);
    if (index !== -1) {
      // Update existing column
      getResponse.value[index] = response;
    } else {
      // Add new column
      getResponse.value.push(response);
    }
    selectedColumnData.value = null;
    showToast('success', index !== -1 ? 'Column updated successfully' : 'Column created successfully', 5000, 'right-bottom');
  }
};

// Handle edit action
const handleDataFromActions = (data: InputItems) => {
  // Ensure selectedFloors is always [number]
  if (!data.selectedFloors || !Array.isArray(data.selectedFloors) || Number(data.selectedFloors.length) === 0) {
    // Provide a default value, e.g., [1]
    data.selectedFloors = [1];
  }
  selectedColumnData.value = data as ColumnItem;
};

// Handle delete action
const handleDelete = async (id: string) => {
  const columnId = Number(id);
  const confirmed = await window.electronAPI.showConfirmDialog('Are you sure you want to delete this item?');
  if (!confirmed) return;

  try {
    await del(`/api/column/delete/${columnId}`);
    getResponse.value = getResponse.value.filter(column => column.id !== columnId);
    showToast('success', 'Column deleted successfully', 5000, 'right-bottom');
  } catch (error: any) {
    const errorMessage = error.response?.message || error.message || 'Failed to delete column';
    showToast('error', errorMessage, 5000, 'right-bottom');
    console.error('Delete column error:', error);
  }
};


// Initialize component on mount
onMounted(() => {
  fetchLatestColumnData();
});
</script>

<style scoped>
.overall-calculation-heading { margin: 0 1.25rem 0.8rem; }
.overall-calculation-heading p { margin: 0 0 0.3rem; color: #8aaba4; font-size: 0.64rem; font-weight: 700; letter-spacing: 0.13em; }
.overall-calculation-heading h2 { margin: 0; color: #e2e9e7; font-size: 1.1rem; }
</style>
