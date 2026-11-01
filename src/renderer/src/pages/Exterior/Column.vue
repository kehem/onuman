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

            <!-- COLUMN TABLE -->
            <section class="formatted-table" style="width: 95%;">
              <h2 class="text-center">COLUMN</h2>
              <table class="onuman-table text-center row-border-all column-border-all hover-border actioned">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Shape</th>
                    <th>Quantity</th>
                    <th>Height</th>
                    <th v-if="hasRectangleColumn">Width</th>
                    <th v-if="hasRectangleColumn">Length</th>
                    <th>Diameter</th>
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
                    <td>{{ column.type }}</td>
                    <td>{{ formatNumber(column.quantity) }}</td>
                    <td>{{ formatNumber(unitStore.convertUnit('mm', column.height)) }} {{ unitStore.targetUnit }}</td>
                    <td v-if="hasRectangleColumn">
                      <span v-if="column.width !== undefined && column.width > 0">{{
                        formatNumber(unitStore.convertUnit('mm',
                          column.width)) }} {{ unitStore.targetUnit }}</span>
                      <span v-else style="color: #ac5;">N/A</span>
                    </td>
                    <td v-if="hasRectangleColumn">
                      <span v-if="column.length !== undefined && column.length > 0">{{
                        formatNumber(unitStore.convertUnit('mm', column.length)) }} {{ unitStore.targetUnit }}</span>
                      <span v-else style="color: #ac5;">N/A</span>
                    </td>

                    <td>
                      <span v-if="column.diameter !== undefined && column.diameter > 0">{{
                        formatNumber(unitStore.convertUnit('mm', column.diameter)) }} {{ unitStore.targetUnit }}</span>
                      <span v-else style="color: #ac5;">N/A</span>
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
                    <td :colspan="hasRectangleColumn ? 7 : 6">Total Volume</td>
                    <td :colspan="hasRectangleColumn ? 3 : 2">{{ formatNumber(unitStore.convertUnit('mm', totalVolume,
                      3))
                    }}
                      {{ unitStore.targetUnit }}<sup>3</sup></td>
                  </tr>
                  <tr class="sub-total">
                    <td :colspan="hasRectangleColumn ? 7 : 6">Total Dry Volume</td>
                    <td :colspan="hasRectangleColumn ? 3 : 2">{{ formatNumber(unitStore.convertUnit('mm', totalVolume *
                      1.54, 3))
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
import Comments from '../../components/Dashboard/Comments.vue';
import { useToast } from '../../composables/Toast';
import Tooltip from '../../components/Initializers/ToolTip.vue';
import CurrentPath from '../../components/Dashboard/CurrentPath.vue';
import Actions from '../../components/OUTPUTS/Actions.vue';
import ColumnInputs from '../../components/INPUTS/COLUMN/ColumnInputs.vue';
import { useApi } from '../../composables/useApi';
const { get, delete: del } = useApi()
import Reinforcements from '../../components/OUTPUTS/Reinforcements.vue';
import Stirrups from '../../components/OUTPUTS/Stirrups.vue';
import { formatNumber } from '../../composables/DecimalNumberValidator';
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
import { useUnitStore } from '../../stores/unitStore';
import Tabs from '../../components/OUTPUTS/Tabs.vue';
import { InputItems } from '../../Interfaces/Inputs';
const unitStore = useUnitStore();

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

// Computed property to check for Rectangle columns
const hasRectangleColumn = computed(() => {
  return getResponse.value.some(column => column.type === 'Rectangle' && column.width !== undefined && column.width >= 1);
});

// Total volume
const totalVolume = computed(() => {
  return getResponse.value.reduce((sum, column) => sum + (column.volume || 0), 0);
});

// ONLY REINFORCEMENTS
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

// ONLY STIRRUP
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

const projectName = computed(() => getResponse.value.map(p => p.name));

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

// DETAILS VIEW
const showDetails = ref(false);
const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

// Initialize component on mount
onMounted(() => {
  fetchLatestColumnData();
});
</script>