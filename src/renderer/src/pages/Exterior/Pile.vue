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
            <section class="formatted-table" style="width: 95%;">
              <h2 class="text-center">PILE</h2>
              <table class="onuman-table text-center row-border-all column-border-all hover-border actioned">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Height</th>
                    <th v-if="hasRectanglePile">Width</th>
                    <th v-if="hasRectanglePile">Length</th>
                    <th>Diameter</th>
                    <th><b>Area</b></th>
                    <th><b>Volume</b></th>
                    <th class="action">Action</th>
                  </tr>
                </thead>

                <tbody class="onuman-insider-scrollbar">
                  <tr v-for="pile in getResponse" :key="pile.id">
                    <td>
                      <Comments :typeid="pile.id" :type="type" />
                      {{ pile.name }}
                    </td>
                    <td>{{ pile.type }}</td>
                    <td>{{ formatNumber(pile.quantity) }}</td>
                    <td>{{ formatNumber(unitStore.convertUnit('mm', pile.height)) }} {{ unitStore.targetUnit }}</td>
                    <td v-if="hasRectanglePile">
                      <span v-if="pile.width !== undefined && pile.width > 0">{{
                        formatNumber(unitStore.convertUnit('mm',
                          pile.width)) }} {{ unitStore.targetUnit }}</span>
                      <span v-else style="color: #ac5;">N/A</span>
                    </td>
                    <td v-if="hasRectanglePile">
                      <span v-if="pile.length !== undefined && pile.length > 0">{{
                        formatNumber(unitStore.convertUnit('mm', pile.length)) }} {{ unitStore.targetUnit }}</span>
                      <span v-else style="color: #ac5;">N/A</span>
                    </td>

                    <td>
                      <span v-if="pile.diameter !== undefined && pile.diameter > 0">{{
                        formatNumber(unitStore.convertUnit('mm', pile.diameter)) }} {{ unitStore.targetUnit }}</span>
                      <span v-else style="color: #ac5;">N/A</span>
                    </td>

                    <td>{{ formatNumber(unitStore.convertUnit('mm', pile.area, 2)) }} {{ unitStore.targetUnit
                    }}<sup>2</sup></td>
                    <td>{{ formatNumber(unitStore.convertUnit('mm', pile.volume, 3)) }} {{ unitStore.targetUnit
                    }}<sup>3</sup></td>
                    <td class="action">
                      <Actions :type="type" :sectionDATA="pile" @send-data="handleDataFromActions"
                        @delete-data="handleDelete" />
                    </td>
                  </tr>
                  <tr class="sub-total">
                    <td :colspan="hasRectanglePile ? 7 : 6">Total Volume</td>
                    <td :colspan="hasRectanglePile ? 3 : 2">{{ formatNumber(unitStore.convertUnit('mm', totalVolume, 3))
                    }}
                      {{ unitStore.targetUnit }}<sup>3</sup></td>
                  </tr>
                  <tr class="sub-total">
                    <td :colspan="hasRectanglePile ? 7 : 6">Total Dry Volume</td>
                    <td :colspan="hasRectanglePile ? 3 : 2">{{ formatNumber(unitStore.convertUnit('mm', totalVolume *
                      1.54, 3))
                    }}
                      {{ unitStore.targetUnit }}<sup>3</sup></td>
                  </tr>
                </tbody>
              </table>
            </section>

            <div class="expand-details">
              <!-- LONG REINFORCEMENTS TABLE -->
              <Reinforcements :reinforcements="onlyReinforcements" />

              <!-- ONLY STIRRUPS TABLE -->
              <Stirrups :stirrups="onlyStirrups" :projectName="projectName" />
            </div>

            <!-- RCC CALCULATION -->
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
import { GroupedReinforcement, InputItems, RCC } from '../../Interfaces/Inputs';
import { OnlyStirrups, PileItem } from '../../Interfaces/Pile';
import Comments from '../../components/Dashboard/Comments.vue';
import { useToast } from '../../composables/Toast';
import CurrentPath from '../../components/Dashboard/CurrentPath.vue';
import Actions from '../../components/OUTPUTS/Actions.vue';
import PileInputs from '../../components/INPUTS/PileInputs.vue';
import { useApi } from '../../composables/useApi';
const { get, delete: del } = useApi()

import Reinforcements from '../../components/OUTPUTS/Reinforcements.vue';
import Stirrups from '../../components/OUTPUTS/Stirrups.vue';
import { formatNumber } from '../../composables/DecimalNumberValidator';
import Graph from '../../components/OUTPUTS/PILE/Graph.vue';
import RCCCalculation from '../../components/OUTPUTS/RCCCalculation.vue';
import BottomBar from '../../components/Dashboard/BottomBar.vue';
import { useSimpleColumnResize } from '../../composables/useColumnResize';
const { container, leftPanel, rightPanel } = useSimpleColumnResize()
// UNIT CONVERSION
import { useUnitStore } from '../../stores/unitStore';
const unitStore = useUnitStore();

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

// Computed property to check for Rectangle piles
const hasRectanglePile = computed(() => {
  return getResponse.value.some(pile => pile.type === 'Rectangle' && pile.width !== undefined && pile.width >= 1);
});

// Total volume
const totalVolume = computed(() => {
  return getResponse.value.reduce((sum, pile) => sum + (pile.volume || 0), 0);
});

// ONLY REINFORCEMENTS
const onlyReinforcements = computed<GroupedReinforcement[]>(() => {
  const grouped: Record<string, GroupedReinforcement> = {};

  getResponse.value.forEach(pile => {
    const reinforcements = pile.reinforcements || [];

    if (!grouped[pile.name]) {
      grouped[pile.name] = {
        columnName: pile.name, // ✅ Rename `pileName` → `columnName`
        reinforcements: [],
      };
    }

    grouped[pile.name].reinforcements.push(
      ...reinforcements.map(reinforcement => ({
        columnName: pile.name, // ✅ Add missing property
        rod_qty: reinforcement.rod_qty,
        rod_diameter: reinforcement.rod_diameter,
        support: reinforcement.support,
        weight: reinforcement.weight ?? 0,
      }))
    );
  });

  return Object.values(grouped);
});



const onlyStirrups = computed(() => {
  const grouped: Record<string, OnlyStirrups> = {};

  getResponse.value.forEach(pile => {
    const stirrups = pile.stirrups || [];

    if (!grouped[pile.name]) {
      grouped[pile.name] = {
        pileName: pile.name,
        stirrups: []
      };
    }

    grouped[pile.name].stirrups.push(...stirrups.map(s => ({
      ...s,
      pileName: pile.name,
      weight: Number(s.weight) || 0,  // Ensure number type
      total_ring: Number(s.total_ring) || 0,  // Ensure number type
      diameter: Number(s.diameter) || 0,  // Ensure number type
      deduction: Number(s.deduction) || 0,  // Ensure number type
      height: s.height !== undefined ? Number(s.height) : undefined, // Optional, ensure number type if present
    })));
  });

  return Object.values(grouped);
});



const projectName = computed(() => getResponse.value.map(p => p.name));



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
