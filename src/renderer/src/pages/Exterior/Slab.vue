<!-- pages/Exterior/Slab.vue -->

<template>
  <DefaultLayouts>
    <div class="main-screen project-insider">
      <!-- TOP (PROJECT SUMMARY) -->
      <CurrentPath :active="'Slab'" />

      <section class="flex-col-container" ref="container">
        <!-- INPUT CONTAINER -->
        <aside ref="leftPanel" class="onuman-insider-scrollbar">
          <SlabInputs @submit-response="handleSubmitResponse" :projectID="projectId" :slabData="selectedSlabData"
            :unit="currentUnit" />
        </aside>

        <!-- OUTPUT CONTAINER -->
        <aside ref="rightPanel" class="span-8 onuman-insider-scrollbar onuman-input-height-2">

          <div v-if="toggleStore.isDetailedView">
            <!-- SLAB TABLE -->
            <!-- ------------------------------------------
          * FLOOR & BEAM TYPE TABS
          * ------------------------------------------ -->
            <Tabs :mainTabs="mainTabs" :subTabs="subTabs" @update:selectedMainTab="handleMainTabSelect"
              :exceptions="'Ground'" @update:selectedSubTab="handleSubTabSelect" :itemType="'Type'"
              :initialMainTab="initialMainTab" :initialSubTab="initialSubTab" />

            <section class="formatted-table" style="width: 95%;">
              <h2 class="text-center">SLAB</h2>
              <table class="onuman-table text-center row-border-all column-border-all hover-border actioned">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Length</th>
                    <th>Width</th>
                    <th>Thickness</th>
                    <th><b>Area</b></th>
                    <th>Top Bar</th>
                    <th>Crank Bar</th>
                    <th class="action">Action</th>
                  </tr>
                </thead>
                <tbody class="onuman-insider-scrollbar">
                  <tr v-for="slab in getResponse" :key="slab.id">
                    <td>
                      <Comments :typeid="slab.id" :type="type" />
                      {{ slab.name }}
                    </td>
                    <td>{{ slab.type }}</td>
                    <td>
                      <span v-if="slab.length !== undefined && slab.length > 0">
                        {{ formatNumber(unitStore.convertUnit('mm', slab.length)) }} {{ unitStore.targetUnit }}
                      </span>
                      <span v-else style="color: #ac5;">N/A</span>
                    </td>
                    <td>
                      <span v-if="slab.width !== undefined && slab.width > 0">
                        {{ formatNumber(unitStore.convertUnit('mm', slab.width)) }} {{ unitStore.targetUnit }}
                      </span>
                      <span v-else style="color: #ac5;">N/A</span>
                    </td>
                    <td>{{ slab.thickness }}</td>
                    <td>
                      {{ formatNumber(unitStore.convertUnit('mm', slab.area, 2)) }} {{ unitStore.targetUnit
                      }}<sup>2</sup>
                    </td>
                    <td>
                      <span v-if="slab.top_bar.length > 0">
                        <i class="m-m-round-tick-mark" style="color: greenyellow"></i>
                      </span>
                      <span v-else>
                        <i class="m-m-round-cross" style="color: #ff4040"></i>
                      </span>
                    </td>
                    <td>
                      <span v-if="slab.crank_bar.length > 0">
                        <i class="m-m-round-tick-mark" style="color: greenyellow"></i>
                      </span>
                      <span v-else>
                        <i class="m-m-round-cross" style="color: #ff4040"></i>
                      </span>
                    </td>
                    <td class="action">
                      <Actions :type="type" :sectionDATA="slab" @send-data="handleDataFromActions"
                        @delete-data="handleDelete" />
                    </td>
                  </tr>
                  <tr class="sub-total">
                    <td :colspan="hasRectangleSlab ? 8 : 7">Total Volume</td>
                    <td :colspan="hasRectangleSlab ? 3 : 2">
                      {{ formatNumber(unitStore.convertUnit('mm', totalVolume, 3)) }}
                      {{ unitStore.targetUnit }}<sup>3</sup>
                    </td>
                  </tr>
                  <tr class="sub-total">
                    <td :colspan="hasRectangleSlab ? 8 : 7">Total Dry Volume</td>
                    <td :colspan="hasRectangleSlab ? 3 : 2">
                      {{ formatNumber(unitStore.convertUnit('mm', totalVolume * 1.54, 3)) }}
                      {{ unitStore.targetUnit }}<sup>3</sup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <div class="expand-details">
              <!-- LONG REINFORCEMENTS TABLE -->
              <Reinforcements :reinforcements="onlyReinforcements" :topBar="topBar" :crankBar="crankBar"
                @editTopBar="handleEditTopBar" @editCrankBar="handleEditCrankBar"
                @updateReinforcements="handleReinforcementUpdate" />
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

<script setup lang="ts">
/* ------------------------------------------
 * IMPORTS AND INITIAL SETUP
 * ------------------------------------------ */
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import DefaultLayouts from '../../layouts/DefaultLayouts.vue';
import { useRouter, useRoute } from 'vue-router';
import { SlabItem } from '../../Interfaces/Slab';
import { TopBar, CrankBar } from '../../Interfaces/Inputs';
import Comments from '../../components/Dashboard/Comments.vue';
import { useToast } from '../../composables/Toast';
import CurrentPath from '../../components/Dashboard/CurrentPath.vue';
import Actions from '../../components/OUTPUTS/Actions.vue';
import SlabInputs from '../../components/INPUTS/SLAB/SlabInputs.vue';
import { useApi } from '../../composables/useApi';
const { get, delete: del } = useApi()

import Reinforcements from '../../components/OUTPUTS/ReinforcementsSlab.vue';
import { formatNumber } from '../../composables/DecimalNumberValidator';
import RCCCalculation from '../../components/OUTPUTS/RCCCalculation.vue';
import BottomBar from '../../components/Dashboard/BottomBar.vue';
import Tabs from '../../components/OUTPUTS/Tabs.vue';
import { useSimpleColumnResize } from '../../composables/useColumnResize';
const { container, leftPanel, rightPanel } = useSimpleColumnResize()

// TOGGLE GRAPH OR DETAILED
import { useToggleViewStore } from '../../stores/useToggleViewStore'
const toggleStore = useToggleViewStore()
import Graph from '../../components/OUTPUTS/SLAB/Graph.vue';

/* ------------------------------------------
 * UNIT CONVERSION STORE
 * ------------------------------------------ */
import { useUnitStore } from '../../stores/unitStore';
import { OnlyReinforcement, InputItems } from '../../Interfaces/Inputs';
const unitStore = useUnitStore();

/* ------------------------------------------
 * TOAST AND ROUTER INITIALIZATION
 * ------------------------------------------ */
const { showToast } = useToast();
const router = useRouter();
const route = useRoute();

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
 * SLAB DATA MANAGEMENT
 * ------------------------------------------ */
const getResponse = ref<SlabItem[]>([]);
const selectedSlabData = ref<SlabItem | null>(null);

/* ------------------------------------------
 * TAB MANAGEMENT
 * ------------------------------------------ */
const totalFloors = Number(route.query.totalFloors) || 1;
const mainTabs = Array.from({ length: totalFloors }, (_, i) => i + 1);
const subTabs = ['Main', 'Sun Shade', 'False', 'Ground'];
const selectedMainTab = ref<number | null>(null);
const selectedSubTab = ref<string | null>(null);
const initialMainTab = ref<number | null>(null);
const initialSubTab = ref<string | null>(null);
const isInitialLoadComplete = ref(false);

/* ------------------------------------------
 * WATCH FOR TAB CHANGES
 * ------------------------------------------ */
watch([selectedMainTab, selectedSubTab], ([main, sub]) => {
  if (main !== null && sub !== null && isInitialLoadComplete.value) {
    fetchSlabData();
  }
});
function handleMainTabSelect(value: number) {
  selectedMainTab.value = value;
}

function handleSubTabSelect(value: string) {
  selectedSubTab.value = value;
}

/* ------------------------------------------
 * FETCH LATEST SLAB DATA
 * ------------------------------------------ */
const fetchLatestSlabData = async () => {
  try {




    const response = await get(`/api/slab/latest?projectId=${projectId.value}`);
    getResponse.value = Array.isArray(response) ? response : [];

    // Set initial tab values based on response data
    if (response && response.length > 0) {
      const firstItem = response[0];
      initialMainTab.value = firstItem.floor;
      initialSubTab.value = firstItem.type;

      selectedMainTab.value = firstItem.floor;
      selectedSubTab.value = firstItem.slab_type;
      await nextTick();
      isInitialLoadComplete.value = true;
    }
  } catch (error: any) {
    const errorMessage = error.response?.message || error.message || 'Failed to fetch latest slab data';
    showToast('error', errorMessage, 5000, 'right-bottom');
    console.error('Fetch latest slab data error:', error);
    getResponse.value = [];
  }
};

/* ------------------------------------------
 * FETCH SLAB DATA BASED ON SELECTED TAB
 * ------------------------------------------ */
const fetchSlabData = async () => {
  try {






    if (selectedMainTab.value === null || selectedSubTab.value === null) {
      console.warn('Main tab or sub tab not selected');
      return;
    }

    const response = await get(
      `/api/slab/list/${selectedMainTab.value}/${selectedSubTab.value}?projectId=${projectId.value}`
    );

    getResponse.value = Array.isArray(response) ? response : [];
  } catch (error: any) {
    const errorMessage = error.response?.message || error.message || 'Failed to fetch slab data';
    showToast('error', errorMessage, 5000, 'right-bottom');
    console.error('Fetch slab data error:', error);
    getResponse.value = []; // Reset to empty array on error
  }
};

/* ------------------------------------------
 * CHECK FOR RECTANGLE SLABS
 * ------------------------------------------ */
const hasRectangleSlab = computed(() => {
  return getResponse.value.some(slab => slab.type === 'Rectangle' && slab.width !== undefined && slab.width >= 1);
});

/* ------------------------------------------
 * CALCULATE TOTAL VOLUME
 * ------------------------------------------ */
const totalVolume = computed(() => {
  return getResponse.value.reduce((sum, slab) => sum + (slab.volume || 0), 0);
});

/* ------------------------------------------
 * REINFORCEMENT INTERFACE EXTENSION
 * ------------------------------------------ */
interface FullReinforcement extends OnlyReinforcement {
  horizontal_weight?: number;
  vertical_weight?: number;
  horizontal_bar?: number;
  vertical_bar?: number;
}

/* ------------------------------------------
 * COMPUTE REINFORCEMENTS DATA
 * ------------------------------------------ */
const onlyReinforcements = computed<{
  columnName: string;
  reinforcements: FullReinforcement[];
}[]>(() => {
  const grouped: Record<string, { columnName: string; reinforcements: FullReinforcement[] }> = {};

  getResponse.value.forEach(slab => {
    const reinforcements = slab.reinforcements || [];

    if (!grouped[slab.name]) {
      grouped[slab.name] = {
        columnName: slab.name,
        reinforcements: [],
      };
    }

    grouped[slab.name].reinforcements.push(
      ...(reinforcements as FullReinforcement[]).map(reinforcement => ({
        columnName: slab.name,
        rod_qty: reinforcement.rod_qty ?? 0,
        support: reinforcement.support ?? false,
        rod_diameter: reinforcement.rod_diameter,
        weight: reinforcement.weight ?? 0,
        height: reinforcement.height ?? 0,
        height_original: reinforcement.height_original,
        horizontal_diameter: reinforcement.horizontal_diameter,
        horizontal: reinforcement.horizontal,
        horizontal_original: reinforcement.horizontal_original,
        vertical_diameter: reinforcement.vertical_diameter,
        vertical: reinforcement.vertical,
        vertical_original: reinforcement.vertical_original,
        horizontal_weight: reinforcement.horizontal_weight ?? 0,
        vertical_weight: reinforcement.vertical_weight ?? 0,
        horizontal_bar: reinforcement.horizontal_bar ?? 0,
        vertical_bar: reinforcement.vertical_bar ?? 0
      }))
    );
  });

  return Object.values(grouped);
});

/* ------------------------------------------
 * TOP BAR AND CRANK BAR DATA
 * ------------------------------------------ */
const topBar = computed<TopBar[]>(() => {
  const allTopBars: TopBar[] = [];

  getResponse.value.forEach(slab => {
    if (slab.top_bar && Array.isArray(slab.top_bar)) {
      allTopBars.push(...slab.top_bar);
    }
  });

  return allTopBars;
});

const crankBar = computed<CrankBar[]>(() => {
  const allCrankBars: CrankBar[] = [];

  getResponse.value.forEach(slab => {
    if (slab.crank_bar && Array.isArray(slab.crank_bar)) {
      allCrankBars.push(...slab.crank_bar);
    }
  });

  return allCrankBars;
});

/* ------------------------------------------
 * HANDLE TOP BAR AND CRANK BAR EDITING
 * ------------------------------------------ */
const handleEditTopBar = (topBarData: TopBar[]) => {
  console.log('Edit Top Bar requested:', topBarData);
  showToast('info', 'Top Bar editing feature will be implemented', 3000, 'right-bottom');

  // You can emit this to a parent component or handle it locally
  // For example, you might want to open a modal or navigate to an edit page
  // emit('editTopBar', topBarData);
};

const handleEditCrankBar = (crankBarData: CrankBar[]) => {
  console.log('Edit Crank Bar requested:', crankBarData);
  showToast('info', 'Crank Bar editing feature will be implemented', 3000, 'right-bottom');

  // You can emit this to a parent component or handle it locally
  // emit('editCrankBar', crankBarData);
};

const handleReinforcementUpdate = (data: { topBar?: TopBar[], crankBar?: CrankBar[] }) => {
  if (data.topBar || data.crankBar) {
  }
};

/* ------------------------------------------
 * HANDLE FORM SUBMISSION RESPONSE
 * ------------------------------------------ */
const handleSubmitResponse = (response: SlabItem) => {
  if (response) {
    const index = getResponse.value.findIndex(slab => slab.id === response.id);
    if (index !== -1) {
      getResponse.value[index] = response;
    } else {
      getResponse.value.push(response);
    }
    selectedSlabData.value = null;
    showToast('info', index !== -1 ? 'Slab updated successfully' : 'Slab created successfully', 5000, 'right-bottom');
  }
};

/* ------------------------------------------
 * HANDLE EDIT ACTION
 * ------------------------------------------ */
const handleDataFromActions = (data: InputItems | SlabItem) => {
  console.log('Edit action triggered with data:', data);
  selectedSlabData.value = data as SlabItem;
};

/* ------------------------------------------
 * HANDLE DELETE ACTION
 * ------------------------------------------ */
const handleDelete = async (id: string | number) => {
  const slabId = typeof id === 'string' ? Number(id) : id;
  const confirmed = await window.electronAPI.showConfirmDialog('Are you sure you want to delete this item?');
  if (!confirmed) return;



  try {


    await del(`/api/slab/delete/${slabId}`);
    getResponse.value = getResponse.value.filter(slab => slab.id !== slabId);
    showToast('success', 'Slab deleted successfully', 5000, 'right-bottom');
  } catch (error: any) {
    const errorMessage = error.response?.message || error.message || 'Failed to delete slab';
    showToast('error', errorMessage, 5000, 'right-bottom');
    console.error('Delete slab error:', error);
  }
};

/* ------------------------------------------
 * INITIALIZE DATA ON COMPONENT MOUNT
 * ------------------------------------------ */
onMounted(async () => {
  await fetchLatestSlabData();
});
</script>