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
            <section class="formatted-table" style="width: 95%;">
              <h2 class="text-center">FOOTING</h2>
              <table class="onuman-table text-center row-border-all column-border-all hover-border actioned">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Height</th>
                    <th v-if="hasRectangleFooting">Width</th>
                    <th v-if="hasRectangleFooting">Length</th>
                    <th>Diameter</th>
                    <th><b>Area</b></th>
                    <th><b>Volume</b></th>
                    <th class="action">Action</th>
                  </tr>
                </thead>
                <tbody class="onuman-insider-scrollbar">
                  <tr v-for="footing in getResponse" :key="footing.id">
                    <td>
                      <Comments :typeid="footing.id" :type="type" />
                      {{ footing.name }}
                    </td>
                    <td>{{ footing.type }}</td>
                    <td>{{ formatNumber(footing.quantity) }}</td>
                    <td>{{ formatNumber(unitStore.convertUnit('mm', footing.height)) }} {{ unitStore.targetUnit }}</td>
                    <td v-if="hasRectangleFooting">
                      <span v-if="footing.width !== undefined && footing.width > 0">{{
                        formatNumber(unitStore.convertUnit('mm', footing.width)) }} {{ unitStore.targetUnit }}</span>
                      <span v-else style="color: #ac5;">N/A</span>
                    </td>
                    <td v-if="hasRectangleFooting">
                      <span v-if="footing.length !== undefined && footing.length > 0">{{
                        formatNumber(unitStore.convertUnit('mm', footing.length)) }} {{ unitStore.targetUnit }}</span>
                      <span v-else style="color: #ac5;">N/A</span>
                    </td>
                    <td>
                      <span v-if="footing.diameter !== undefined && footing.diameter > 0">{{
                        formatNumber(unitStore.convertUnit('mm', footing.diameter)) }} {{ unitStore.targetUnit }}</span>
                      <span v-else style="color: #ac5;">N/A</span>
                    </td>
                    <td>{{ formatNumber(unitStore.convertUnit('mm', footing.area, 2)) }} {{ unitStore.targetUnit
                    }}<sup>2</sup></td>
                    <td>{{ formatNumber(unitStore.convertUnit('mm', footing.volume, 3)) }} {{ unitStore.targetUnit
                    }}<sup>3</sup></td>
                    <td class="action">
                      <Actions :type="type" :sectionDATA="footing" @send-data="handleDataFromActions"
                        @delete-data="handleDelete" />
                    </td>
                  </tr>
                  <tr class="sub-total">
                    <td :colspan="hasRectangleFooting ? 7 : 6">Total Volume</td>
                    <td :colspan="hasRectangleFooting ? 3 : 2">{{ formatNumber(unitStore.convertUnit('mm', totalVolume,
                      3)) }}
                      {{ unitStore.targetUnit }}<sup>3</sup></td>
                  </tr>
                  <tr class="sub-total">
                    <td :colspan="hasRectangleFooting ? 7 : 6">Total Dry Volume</td>
                    <td :colspan="hasRectangleFooting ? 3 : 2">{{ formatNumber(unitStore.convertUnit('mm', totalVolume *
                      1.54, 3)) }}
                      {{ unitStore.targetUnit }}<sup>3</sup></td>
                  </tr>
                </tbody>
              </table>
            </section>

            <div class="expantion" @click="toggleDetails">
              <Tooltip content="Click to show reinforcements and stirrups" position="left">
                <span v-if="!showDetails">Details View</span>
                <span v-else>Hide Details</span>
              </Tooltip>
            </div>
            <div class="expand-details" v-if="showDetails">
              <!-- LONG REINFORCEMENTS TABLE -->
              <Reinforcements :reinforcements="onlyReinforcements" />
              <!-- ONLY STIRRUPS TABLE -->
              <Stirrups :stirrups="onlyStirrups" :projectName="projectName" />
            </div>

            <!-- RCC CALCULATION -->
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
import { OnlyStirrups, FootingItem } from '../../Interfaces/Footing';
import Comments from '../../components/Dashboard/Comments.vue';
import { useToast } from '../../composables/Toast';
import Tooltip from '../../components/Initializers/ToolTip.vue';
import CurrentPath from '../../components/Dashboard/CurrentPath.vue';
import Actions from '../../components/OUTPUTS/Actions.vue';
import FootingInputs from '../../components/INPUTS/FOOTING/FootingInputs.vue';
import { useApi } from '../../composables/useApi';
const { get, delete: del } = useApi()
import Reinforcements from '../../components/OUTPUTS/Reinforcements2.vue';
import Stirrups from '../../components/OUTPUTS/Stirrups.vue';
import { formatNumber } from '../../composables/DecimalNumberValidator';
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
import { useUnitStore } from '../../stores/unitStore';
import { OnlyReinforcement, InputItems } from '../../Interfaces/Inputs';
const unitStore = useUnitStore();

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
 * CHECK FOR RECTANGLE FOOTINGS
 * ------------------------------------------ */
const hasRectangleFooting = computed(() => {
  return getResponse.value.some(footing => footing.type === 'Rectangle' && footing.width !== undefined && footing.width >= 1);
});

/* ------------------------------------------
 * CALCULATE TOTAL VOLUME
 * ------------------------------------------ */
const totalVolume = computed(() => {
  return getResponse.value.reduce((sum, footing) => sum + (footing.volume || 0), 0);
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

  getResponse.value.forEach(footing => {
    const reinforcements = footing.reinforcements || [];

    if (!grouped[footing.name]) {
      grouped[footing.name] = {
        columnName: footing.name,
        reinforcements: [],
      };
    }

    grouped[footing.name].reinforcements.push(
      ...(reinforcements as FullReinforcement[]).map(reinforcement => ({
        columnName: footing.name,
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
 * COMPUTE STIRRUPS DATA
 * ------------------------------------------ */
const onlyStirrups = computed(() => {
  const grouped: Record<string, OnlyStirrups> = {};

  getResponse.value.forEach(footing => {
    const stirrups = footing.stirrups || [];

    if (!grouped[footing.name]) {
      grouped[footing.name] = {
        pileName: footing.name,
        stirrups: []
      };
    }

    grouped[footing.name].stirrups.push(...stirrups.map(s => ({
      ...s,
      footingName: footing.name,
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
 * EXTRACT PROJECT NAME
 * ------------------------------------------ */
const projectName = computed(() => getResponse.value.map(p => p.name));

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
 * TOGGLE DETAILS VIEW
 * ------------------------------------------ */
const showDetails = ref(false);
const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

/* ------------------------------------------
 * INITIALIZE DATA ON COMPONENT MOUNT
 * ------------------------------------------ */
onMounted(fetchFootingData);
</script>