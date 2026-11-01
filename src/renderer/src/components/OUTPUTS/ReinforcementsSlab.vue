<template>
    <section>
        <fieldset class="reinforcements-fieldset">
            <legend>Long Reinforcements</legend>

            <section class="formatted-table responsive-table">
                <!-- LONG REINFORCEMENTS -->
                <fieldset class="reinforcements-fieldset responsive-reinfo"
                    v-for="(group, index) in props.reinforcements" :key="index">
                    <legend>{{ group.columnName }}</legend>

                    <table class="onuman-table text-center row-border-all hover-border"
                        v-for="(item, idx) in group.reinforcements" :key="idx">
                        <thead></thead>
                        <tbody>
                            <tr>
                                <th class="top-named" :rowspan="item.support ? 4 : 3">
                                    {{ item.horizontal_diameter }} mm
                                </th>
                            </tr>
                            <tr>
                                <th class="max-th">Horizontal Total Rods</th>
                                <td>{{ item.horizontal_bar }} pcs</td>
                            </tr>
                            <tr>
                                <th class="max-th">Horizontal Weight</th>
                                <td>{{ formatNumber(item.horizontal_weight) }} kg</td>
                            </tr>
                            <tr v-if="item.support">
                                <th class="max-th">Support</th>
                                <td>
                                    <i class="m-check-alt" style="color: coral; font-size: 0.9rem;"></i>
                                </td>
                            </tr>
                            <tr>
                                <th class="top-named" :rowspan="item.support ? 4 : 3">
                                    {{ item.vertical_diameter }} mm
                                </th>
                            </tr>
                            <tr>
                                <th class="max-th">Vertical Total Rods</th>
                                <td>{{ formatNumber(item.vertical_bar) }} pcs</td>
                            </tr>
                            <tr>
                                <th class="max-th">Vertical Weight</th>
                                <td>{{ formatNumber(item.vertical_weight) }} kg</td>
                            </tr>
                        </tbody>
                    </table>
                </fieldset>

            </section>
            <section class="formatted-table responsive-table">

                <!-- TOP BAR SECTION -->
                <fieldset class="reinforcements-fieldset responsive-reinfo"
                    v-if="props.topBar && props.topBar.length > 0">
                    <legend>Top Bar Details</legend>

                    <table class="onuman-table text-center row-border-all hover-border"
                        v-for="(topBarItem, idx) in props.topBar" :key="`topbar-${idx}`">
                        <thead></thead>
                        <tbody>
                            <tr>
                                <th class="top-named" :rowspan="topBarItem.support ? 7 : 6">
                                    {{ topBarItem.diameter }} mm
                                </th>
                            </tr>

                            <tr>
                                <th class="max-th">Number of Bars</th>
                                <td>{{ formatNumber(topBarItem.no_of_bar || 0) }} pcs</td>
                            </tr>
                            <tr>
                                <th class="max-th">Total Weight</th>
                                <td>{{ formatNumber(topBarItem.total_weight || 0) }} kg</td>
                            </tr>
                            <tr v-if="topBarItem.support">
                                <th class="max-th">Support</th>
                                <td>
                                    <i class="m-check-alt" style="color: coral; font-size: 0.9rem;"></i>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </fieldset>

                <!-- CRANK BAR SECTION -->
                <fieldset class="reinforcements-fieldset responsive-reinfo"
                    v-if="props.crankBar && props.crankBar.length > 0">
                    <legend>Crank Bar Details</legend>

                    <table class="onuman-table text-center row-border-all hover-border"
                        v-for="(crankBarItem, idx) in props.crankBar" :key="`crankbar-${idx}`">
                        <thead></thead>
                        <tbody>
                            <tr>
                                <th class="top-named" :rowspan="crankBarItem.support ? 8 : 7">
                                    {{ crankBarItem.diameter }} mm
                                </th>
                            </tr>
                            <tr>
                                <th class="max-th">Number of Bars</th>
                                <td>{{ formatNumber(crankBarItem.no_of_bar || 0) }} pcs</td>
                            </tr>
                            <tr>
                                <th class="max-th">Total Weight</th>
                                <td>{{ formatNumber(crankBarItem.total_weight || 0) }} kg</td>
                            </tr>
                            <tr v-if="crankBarItem.support">
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

<script setup lang="ts">
import { computed, watch } from 'vue';
import { formatNumber } from '../../composables/DecimalNumberValidator';
import { GroupedReinforcement, TopBar, CrankBar } from '../../Interfaces/Inputs';

const props = defineProps<{
    reinforcements: GroupedReinforcement[];
    topBar: TopBar[];
    crankBar: CrankBar[];
}>();

// Define emits for parent communication
const emit = defineEmits<{
    editTopBar: [data: TopBar[]];
    editCrankBar: [data: CrankBar[]];
    updateReinforcements: [data: { topBar?: TopBar[], crankBar?: CrankBar[] }];
}>();

watch(
    () => props,
    (newVal) => {
        console.log('Props changed:', newVal);
    },
    { deep: true, immediate: true }
);

// Calculate subtotal including topBar and crankBar weights
const subTotal = computed(() => {
    // Long reinforcements weight
    const reinforcementWeight = props.reinforcements.reduce((total, group) => {
        return total + group.reinforcements.reduce((sum, item) => {
            const horizontalWeight = item.horizontal_weight || 0;
            const verticalWeight = item.vertical_weight || 0;
            const itemWeight = item.weight || 0;
            return sum + horizontalWeight + verticalWeight + itemWeight;
        }, 0);
    }, 0);

    // Top bar weight
    const topBarWeight = props.topBar?.reduce((sum, item) => sum + (item.total_weight || 0), 0) || 0;

    // Crank bar weight
    const crankBarWeight = props.crankBar?.reduce((sum, item) => sum + (item.total_weight || 0), 0) || 0;

    return reinforcementWeight + topBarWeight + crankBarWeight;
});


// Watch for changes in topBar and crankBar to emit updates
watch(
    () => [props.topBar, props.crankBar],
    ([newTopBar, newCrankBar]) => {
        emit('updateReinforcements', {
            topBar: newTopBar,
            crankBar: newCrankBar
        });
    },
    { deep: true }
);
</script>