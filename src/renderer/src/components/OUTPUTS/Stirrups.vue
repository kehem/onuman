<template>
  <section>
    <fieldset class="reinforcements-fieldset" v-if="isStirrups">
      <legend>Stirrups</legend>
      <section class="formatted-table responsive-table">
        <fieldset class="reinforcements-fieldset" v-for="(item, index) in props.stirrups" :key="index">
          <legend>{{ item.pileName }}</legend>

          <table v-for="(stirrup, i) in item.stirrups" :key="i"
            class="onuman-table text-center row-border-all hover-border">
            <tbody>
              <tr>
                <th class="top-named" :rowspan="stirrup.height ? 5 : 4">
                  {{ stirrup.diameter }} mm
                </th>
              </tr>
              <tr>
                <th class="max-th">Deduction</th>
                <td>
                  {{ formatNumber(unitStore.convertUnit('mm', stirrup.deduction)) }}
                  {{ unitStore.targetUnit }}
                </td>
              </tr>
              <tr>
                <th class="max-th">Weight</th>
                <td>
                  {{ formatNumber(stirrup.weight ?? 0) }} Kg/ft
                </td>
              </tr>
              <tr>
                <th class="max-th">Total Ring</th>
                <td>{{ formatNumber(stirrup.total_ring) }} pcs</td>
              </tr>
              <tr v-if="stirrup.height">
                <th class="max-th">Height</th>
                <td>{{ formatNumber(stirrup.height) }} {{ unitStore.targetUnit }}</td>
              </tr>
            </tbody>
          </table>
        </fieldset>
      </section>
    </fieldset>

    <div class="sub-total">Total Weight: {{ formatNumber(subTotal) }} Kg</div>
  </section>
</template>



<script setup lang="ts">
import { computed } from 'vue';
import { OnlyStirrups } from '../../Interfaces/Pile';
import { formatNumber } from '../../composables/DecimalNumberValidator';

// UNIT CONVERSION
import { useUnitStore } from '../../stores/unitStore';
const unitStore = useUnitStore();

const props = defineProps<{
  stirrups: OnlyStirrups[];
  projectName: string[];
}>();

const subTotal = computed(() => {
  return props.stirrups.reduce((total, item) => {
    return total + item.stirrups.reduce((sum, stirrup) => sum + (stirrup.weight || 0), 0);
  }, 0);
});


const isStirrups = computed(() => {
  return props.stirrups.some(item => item.stirrups.length > 0);
});
</script>
