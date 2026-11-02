<template>
  <DefaultLayouts>
    <div class="main-screen project-insider">
      <!-- TOP (PROJECT SUMMARY) -->
      <CurrentPath :active="'Pile'" />

      <section class="flex-col-container" ref="container">
        <!-- INPUT CONTAINER -->
        <aside ref="leftPanel" class="onuman-insider-scrollbar">
          <PileInputs @submit-response="handleSubmitResponse" :projectID="projectId" :pileData="selectedPileData"
            :unit="currentUnit" />
        </aside>


        <!-- OUTPUT CONTAINER -->
        <aside ref="rightPanel" class="span-8 onuman-insider-scrollbar onuman-input-height-2">
          <div class="" v-if="toggleStore.isDetailedView">

            <!-- PILE TABLE -->
            <StructuralResults :columns="getResponse" :type="type" :totalVolume="totalVolume" kind="pile"
              @edit="handleDataFromActions" @delete="handleDelete" />

            <RCCCalculation :projectId="projectId" @update:rcc="handleRCCUpdate" :type="type"
              :totalVolume="totalVolume" />
          </div>
          <Graph v-if="toggleStore.isGraphView"/>
        </aside>
      </section>
    </div>
    <BottomBar />
  </DefaultLayouts>
</template>

<!-- PAGES/Pile.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useToggleViewStore } from '../../stores/useToggleViewStore'
import DefaultLayouts from '../../layouts/DefaultLayouts.vue';
import { useRouter } from 'vue-router';
import { InputItems, RCC } from '../../Interfaces/Inputs';
import { PileItem } from '../../Interfaces/Pile';
import StructuralResults from '../../components/OUTPUTS/StructuralResults.vue';
import { useToast } from '../../composables/Toast';
import CurrentPath from '../../components/Dashboard/CurrentPath.vue';
import PileInputs from '../../components/INPUTS/PileInputs.vue';
import { useApi } from '../../composables/useApi';
const { get, delete: del } = useApi()

import Graph from '../../components/OUTPUTS/PILE/Graph.vue';
import RCCCalculation from '../../components/OUTPUTS/RCCCalculation.vue';
import BottomBar from '../../components/Dashboard/BottomBar.vue';
import { useSimpleColumnResize } from '../../composables/useColumnResize';
const { container, leftPanel, rightPanel } = useSimpleColumnResize()
// UNIT CONVERSION

const { showToast } = useToast();
const router = useRouter();

// TOGGLE GRAPH OR DETAILED
const toggleStore = useToggleViewStore()


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

// Pile data
const getResponse = ref<PileItem[]>([]);
const selectedPileData = ref<PileItem | null>(null);

// Total volume
const totalVolume = computed(() => {
  return getResponse.value.reduce((sum, pile) => sum + (pile.volume || 0), 0);
});


// Fetch pile data
const fetchPileData = async () => {
  try {

    const response = await get(`/api/pile/list?projectId=${projectId.value}`);
    getResponse.value = response;
  } catch (error: any) {
    const errorMessage = error.response?.message || error.message || 'Failed to fetch pile data';
    showToast('error', errorMessage, 5000, 'right-bottom');
    console.error('Fetch pile data error:', error);
  }
};


// Handle form submission response
const handleSubmitResponse = (response: PileItem) => {
  if (response) {
    const index = getResponse.value.findIndex(pile => pile.id === response.id);
    if (index !== -1) {
      // Update existing pile
      getResponse.value[index] = response;
    } else {
      // Add new pile
      getResponse.value.push(response);
    }
    selectedPileData.value = null; // Reset selected pile after submission
    showToast('success', index !== -1 ? 'Pile updated successfully' : 'Pile created successfully', 5000, 'right-bottom');
  }
};

// Handle edit action
const handleDataFromActions = (data: InputItems | PileItem) => {
  selectedPileData.value = data as PileItem;
};


// Handle delete action
const handleDelete = async (id: string) => {
  const pileId = Number(id);

  const confirmed = await window.electronAPI.showConfirmDialog('Are you sure you want to delete this item?');
  if (!confirmed) return;

  try {

    await del(`/api/pile/delete/${pileId}`);
    getResponse.value = getResponse.value.filter(pile => pile.id !== pileId);
    showToast('success', 'Pile deleted successfully', 5000, 'right-bottom');
  } catch (error: any) {
    const errorMessage = error.response?.message || error.message || 'Failed to delete pile';
    showToast('error', errorMessage, 5000, 'right-bottom');
    console.error('Delete pile error:', error);
  }
};

const CCCalculation = ref<RCC | null>(null);

const handleRCCUpdate = (value: RCC | null) => {
  CCCalculation.value = value;
};


onMounted(fetchPileData);
</script>
