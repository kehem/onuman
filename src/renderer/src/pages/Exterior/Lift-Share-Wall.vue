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
            <section class="formatted-table" style="width: 95%;">
              <h2 class="text-center">LIFT SHARE WALL</h2>
              <table class="onuman-table text-center row-border-all column-border-all hover-border actioned">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Height</th>
                    <th>Clear Cover</th>
                    <th>Width</th>
                    <th>Length</th>
                    <th><b>Area</b></th>
                    <th><b>Volume</b></th>
                    <th class="action">Action</th>
                  </tr>
                </thead>

                <tbody class="onuman-insider-scrollbar">
                  <tr v-for="column in getResponse" :key="column.id">
                    <td>
                      <Comments :typeid="column.id" :type="type" />
                      {{ column.name }}
                    </td>
                    <td>{{ formatNumber(column.quantity) }}</td>
                    <td>{{ formatNumber(unitStore.convertUnit('mm', column.height)) }} {{ unitStore.targetUnit }}</td>
                    <td>{{ formatNumber(unitStore.convertUnit('mm', column.clear_cover)) }} {{ unitStore.targetUnit }}
                    </td>
                    <td>
                      <span>{{ formatNumber(unitStore.convertUnit('mm', column.width)) }} {{ unitStore.targetUnit
                      }}</span>
                    </td>
                    <td>
                      <span>{{ formatNumber(unitStore.convertUnit('mm', column.length ?? 0)) }} {{ unitStore.targetUnit
                      }}</span>
                    </td>

                    <td>{{ formatNumber(unitStore.convertUnit('mm', column.area, 2)) }} {{ unitStore.targetUnit
                    }}<sup>2</sup></td>
                    <td>{{ formatNumber(unitStore.convertUnit('mm', column.volume, 3)) }} {{ unitStore.targetUnit
                    }}<sup>3</sup></td>
                    <td class="action">
                      <Actions :type="type" :sectionDATA="column" @send-data="handleDataFromActions"
                        @delete-data="handleDelete" />
                    </td>
                  </tr>
                  <tr class="sub-total">
                    <td colspan="7">Total Volume</td>
                    <td colspan="2">{{ formatNumber(unitStore.convertUnit('mm', totalVolume, 3)) }}
                      {{ unitStore.targetUnit }}<sup>3</sup></td>
                  </tr>
                  <tr class="sub-total">
                    <td colspan="7">Total Dry Volume</td>
                    <td colspan="2">{{ formatNumber(unitStore.convertUnit('mm', totalVolume * 1.54, 3))
                    }}
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
/* ============================
 * IMPORTS
 * ============================ */
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useToggleViewStore } from '../../stores/useToggleViewStore'
// TOGGLE GRAPH OR DETAILED
const toggleStore = useToggleViewStore()

import DefaultLayouts from '../../layouts/DefaultLayouts.vue';
import Comments from '../../components/Dashboard/Comments.vue';
import Tooltip from '../../components/Initializers/ToolTip.vue';
import CurrentPath from '../../components/Dashboard/CurrentPath.vue';
import Actions from '../../components/OUTPUTS/Actions.vue';
import LiftInputs from '../../components/INPUTS/LIFT/LiftInputs.vue';
import Reinforcements from '../../components/OUTPUTS/Reinforcements.vue';
import Stirrups from '../../components/OUTPUTS/Stirrups.vue';
import RCCCalculation from '../../components/OUTPUTS/RCCCalculation.vue';
import BottomBar from '../../components/Dashboard/BottomBar.vue';
import Graph from '../../components/OUTPUTS/LIFT/Graph.vue';

import { ColumnItem } from '../../Interfaces/Column';
import { InputItems } from '../../Interfaces/Inputs';
import { useToast } from '../../composables/Toast';
import { useApi } from '../../composables/useApi';
const { get, delete: del } = useApi()
import { formatNumber } from '../../composables/DecimalNumberValidator';
import { useSimpleColumnResize } from '../../composables/useColumnResize';
import { useUnitStore } from '../../stores/unitStore';

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
 * UNIT STORE (FOR CONVERSIONS)
 * ============================ */
const unitStore = useUnitStore();

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
 * COMPUTED: REINFORCEMENTS ONLY
 * ============================ */
const onlyReinforcements = computed(() => {
  return getResponse.value.map(column => ({
    columnName: column.name,
    reinforcements: (column.reinforcements || []).map(reinforcement => ({
      ...reinforcement,
      columnName: column.name,
      weight: reinforcement.weight ?? 0,
    })),
  }));
});

/* ============================
 * COMPUTED: STIRRUPS ONLY
 * ============================ */
const onlyStirrups = computed(() => {
  const grouped: Record<string, any> = {};

  getResponse.value.forEach(column => {
    const stirrups = column.stirrups || [];

    if (!grouped[column.name]) {
      grouped[column.name] = {
        columnName: column.name,
        pileName: column.name,
        stirrups: []
      };
    }

    grouped[column.name].stirrups.push(...stirrups.map(s => ({
      ...s,
      columnName: column.name,
      weight: Number(s.weight) || 0,
      total_ring: Number(s.total_ring) || 0,
      diameter: Number(s.diameter) || 0,
      deduction: Number(s.deduction) || 0,
      height: s.height !== undefined ? Number(s.height) : undefined,
    })));
  });

  return Object.values(grouped);
});

/* ============================
 * COMPUTED: PROJECT NAME LIST
 * ============================ */
const projectName = computed(() => getResponse.value.map(p => p.name));

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

/* ============================
 * DETAILS VIEW TOGGLE
 * ============================ */
const showDetails = ref(false);
const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};
</script>
