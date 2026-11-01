<template>
  <DefaultLayouts>
    <div class="main-screen project-insider">
      <!-- TOP (PROJECT SUMMARY) -->
      <CurrentPath :active="'Sand Filling'" />

      <section class="flex-col-container" ref="container">
        <!-- INPUT CONTAINER -->
        <aside ref="leftPanel" class="onuman-insider-scrollbar">
          <SandInputs @submit-response="handleSubmitResponse" :projectID="projectId" :sandData="selectedSandData"
            :unit="currentUnit" />
        </aside>





        <!-- OUTPUT CONTAINER -->
        <aside ref="rightPanel" class="span-8 onuman-insider-scrollbar onuman-input-height-2">

          <!-- SAND TABLE -->
          <section class="formatted-table" style="width: 95%;">
            <h2 class="text-center">SAND</h2>
            <table class="onuman-table text-center row-border-all column-border-all hover-border actioned">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Height</th>
                  <th><b>Area</b></th>
                  <th><b>Volume</b></th>
                  <th class="action">Action</th>
                </tr>
              </thead>

              <tbody class="onuman-insider-scrollbar">
                <tr v-for="sand in getResponse" :key="sand.id">
                  <td>
                    <Comments :typeid="sand.id" :type="type" />
                    {{ sand.name }}
                  </td>

                  <td>{{ formatNumber(unitStore.convertUnit('mm', sand.height ?? 0)) }} {{ unitStore.targetUnit }}</td>

                  <td>{{ formatNumber(unitStore.convertUnit('mm', sand.area ?? 0, 2)) }} {{ unitStore.targetUnit
                  }}<sup>2</sup></td>
                  <td>{{ formatNumber(unitStore.convertUnit('mm', sand.volume ?? 0, 2)) }} {{ unitStore.targetUnit
                    }}<sup>3</sup></td>
                  <td class="action">
                    <Actions :type="type" :sectionDATA="sand" @send-data="handleDataFromActions"
                      @delete-data="handleDelete" />
                  </td>
                </tr>
                <tr class="sub-total">
                  <td colspan="3">Total Volume</td>
                  <td colspan="2">{{ formatNumber(unitStore.convertUnit('mm', totalVolume, 3))
                  }}
                    {{ unitStore.targetUnit }}<sup>3</sup></td>
                </tr>
                <tr class="sub-total">
                  <td colspan="3">Total Dry Volume</td>
                  <td colspan="2">{{ formatNumber(unitStore.convertUnit('mm', totalVolume *
                    1.54, 3))
                  }}
                    {{ unitStore.targetUnit }}<sup>3</sup></td>
                </tr>
              </tbody>
            </table>
          </section>

        </aside>
      </section>
    </div>
    <BottomBar />
  </DefaultLayouts>
</template>

<!-- PAGES/Sand.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import DefaultLayouts from '../../layouts/DefaultLayouts.vue';
import { useRouter } from 'vue-router';
import Comments from '../../components/Dashboard/Comments.vue';
import { useToast } from '../../composables/Toast';
import CurrentPath from '../../components/Dashboard/CurrentPath.vue';
import Actions from '../../components/OUTPUTS/Actions.vue';
import { useApi } from '../../composables/useApi';
const { get, delete: del } = useApi()
import { formatNumber } from '../../composables/DecimalNumberValidator';
import BottomBar from '../../components/Dashboard/BottomBar.vue';
import { useUnitStore } from '../../stores/unitStore';
import SandInputs from '../../components/INPUTS/SAND-FILLING/SandInputs.vue';
import type { InputItems } from '../../Interfaces/Inputs';
import { useSimpleColumnResize  } from '../../composables/useColumnResize';
const { container, leftPanel, rightPanel } = useSimpleColumnResize()

// Use unit store
const unitStore = useUnitStore();
const { showToast } = useToast();
const router = useRouter();

// Extract project ID from URL
const projectId = computed<number>(() => {
  const queryString = router.currentRoute.value.fullPath.split('?')[1];
  const params = new URLSearchParams(queryString);
  return Number(params.get('id')) || 0;
});

// Current Unit
const currentUnit = computed<string | undefined>(() => {
  const unit = router.currentRoute.value.query.unit;
  if (Array.isArray(unit)) return unit[0] ?? undefined;
  return unit ?? undefined;
});

// Type of calculation section
const type = computed<string>(() => router.currentRoute.value.path.replace('/', ''));

interface SandItem extends InputItems {
  area?: number;
  volume?: number;
  type: string;
  quantity?: number;
  height?: number;
  width?: number;
  length?: number;
  diameter?: number;
}


// Data refs
const getResponse = ref<SandItem[]>([]);
const selectedSandData = ref<SandItem | null>(null);

// Total volume computation
const totalVolume = computed<number>(() => {
  return getResponse.value.reduce((sum, sand) => sum + (sand.volume || 0), 0);
});

// Fetch sand data
const fetchSandData = async () => {
  try {
    
    

    


    const response = await get<SandItem[]>(
      `/api/sand/list?projectId=${projectId.value}`
    );
    getResponse.value = response;
  } catch (error: any) {
    const errorMessage =
      error.response?.message || error.message || 'Failed to fetch sand data';
    showToast('error', errorMessage, 5000, 'right-bottom');
    console.error('Fetch sand data error:', error);
  }
};

// Handle submission from SandInputs
const handleSubmitResponse = (response: SandItem) => {
  if (response) {
    const index = getResponse.value.findIndex((sand) => sand.id === response.id);
    if (index !== -1) {
      getResponse.value[index] = response;
    } else {
      getResponse.value.push(response);
    }
    selectedSandData.value = null;
    showToast(
      'success',
      index !== -1 ? 'Sand updated successfully' : 'Sand created successfully',
      5000,
      'right-bottom'
    );
  }
};

// Handle action edit click
const handleDataFromActions = (data: SandItem) => {
  selectedSandData.value = data;
};

// Handle delete sand item
const handleDelete = async (id: string) => {
  const pileId = Number(id);
  const confirmed = await window.electronAPI.showConfirmDialog('Are you sure you want to delete this item?');
  if (!confirmed) return;
  try {

    await del(`/api/sand/delete/${pileId}`);
    getResponse.value = getResponse.value.filter((sand) => sand.id !== pileId);
    showToast('success', 'Sand Filling deleted successfully', 5000, 'right-bottom');
  } catch (error: any) {
    const errorMessage =
      error.response?.message || error.message || 'Failed to delete sand';
    showToast('error', errorMessage, 5000, 'right-bottom');
    console.error('Delete sand error:', error);
  }
};

// Init on mount
onMounted(fetchSandData);
</script>
