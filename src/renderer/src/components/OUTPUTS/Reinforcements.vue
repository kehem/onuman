<template>
    <section>
        <fieldset class="reinforcements-fieldset">
            <legend>Long Reinforcements</legend>

            <section class="formatted-table responsive-table">
                <fieldset class="reinforcements-fieldset responsive-reinfo"
                    v-for="(group, index) in props.reinforcements" :key="index">
                    <legend>{{ group.columnName }}</legend>

                    <table class="onuman-table text-center row-border-all hover-border"
                        v-for="(item, idx) in group.reinforcements" :key="idx">
                        <thead></thead>
                        <tbody>
                            <tr>
                                <th class="top-named" :rowspan="item.support ? 4 : 3">
                                    {{ item.rod_diameter }} mm
                                </th>
                            </tr>
                            <tr>
                                <th class="max-th">Quantity</th>
                                <td>{{ formatNumber(item.rod_qty) }}</td>
                            </tr>
                            <tr>
                                <th class="max-th">Weight (KG)</th>
                                <td>{{ formatNumber(item.weight) }}</td>
                            </tr>
                            <tr v-if="item.support">
                                <th class="max-th">Support</th>
                                <td>
                                    <i class="m-check-alt" style="color: coral; font-size: 0.9rem;"></i>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </fieldset>
            </section>
        </fieldset>

        <div class="sub-total">
            Total Weight : {{ formatNumber(subTotal) }}
        </div>
    </section>
</template>

<!-- components/Reinforcements.vue -->
<script setup lang="ts">
import { computed, watch } from 'vue';
import { formatNumber } from '../../composables/DecimalNumberValidator';
import { GroupedReinforcement } from '../../Interfaces/Inputs';

const props = defineProps<{
    reinforcements: GroupedReinforcement[];
}>();

watch(
    () => props,
    (newVal) => {
        console.log('Props changed:', newVal);
    },
    { deep: true, immediate: true }
);
const subTotal = computed(() => {
    return props.reinforcements.reduce((total, group) => {
        return total + group.reinforcements.reduce((sum, item) => sum + (item.weight || 0), 0);
    }, 0);
});
</script>
