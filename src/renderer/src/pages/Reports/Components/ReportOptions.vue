<!-- /src/Reports/components/ReportOptions.vue -->

<!-- REPORT OPTIONS COMPONENT -->
<template>
    <section class="report-section">

        <!-- REPORT OPTIONS SELECTION -->
        <fieldset class="fieldset-basic-inputs">
            <legend>SELECT REPORT OPTIONS</legend>
            <div class="input-group extended">
                <!-- DO FOR ALL -->
                <div class="relative">
                    <input type="radio" name="propertyOptions" id="do-for-all" v-model="selectedOptionValue"
                        value="all">
                    <label for="do-for-all">Do for all</label>
                </div>

                <!-- DO SPECIFIC -->
                <div class="relative">
                    <input type="radio" name="propertyOptions" id="do-specific" v-model="selectedOptionValue"
                        value="specific">
                    <label for="do-specific">Do Specific</label>
                </div>
            </div>
        </fieldset>

        <!-- SELECT NEEDS (FOR 'ALL' OPTION) -->
        <fieldset class="fieldset-basic-inputs" v-if="selectedOptionValue !== 'specific'">
            <legend class="sdfw43zq1">
                <strong class="success uppercase">SELECT NEEDS</strong>
            </legend>
            <div class="all-select-container ex238-positional">
                <input type="checkbox" class="all-select-options" id="select-all-needs" :checked="selectAllNeeds"
                    @change="toggleAllNeeds" />
            </div>

            <div class="preset-checker make-distance">
                <!-- REGULAR ITEMS -->
                <div class="checkbox" v-for="(item) in ITEMS.filter(i => !['Reinforcement', 'Casting'].includes(i))"
                    :key="`item-${item}`">
                    <input type="checkbox" :id="`item-${item}`" :value="`:${item}`" v-model="selectedItemsValue" />
                    <label :for="`item-${item}`">{{ item }}</label>

                    <!-- WASTAGE CONTROL -->
                    <ItemControls v-if="item === 'Total Wastage'" :wastage="wastage" :materials-name="materialsName"
                        :show-wastage-control="selectedItemsValue.includes(`:Total Wastage`)"
                        :show-material-control="false" @update:wastage="$emit('update:wastage', $event)"
                        @update:materialsName="$emit('update:materialsName', $event)" />
                </div>
            </div>

            <!-- REINFORCEMENT AND CASTING -->
            <fieldset class="fieldset-basic-inputs padding">
                <legend class="warning">Select Row's Item</legend>
                <div class="preset-checker make-distance"
                    v-if="ITEMS.includes('Reinforcement') || ITEMS.includes('Casting')">
                    <!-- REINFORCEMENT -->
                    <div class="checkbox" v-if="ITEMS.includes('Reinforcement')">
                        <input type="checkbox" id="item-Reinforcement" value=":Reinforcement"
                            v-model="selectedItemsValue" />
                        <label for="item-Reinforcement">Reinforcement</label>
                    </div>

                    <!-- CASTING -->
                    <div class="checkbox" v-if="ITEMS.includes('Casting')">
                        <input type="checkbox" class="daser3346t" id="item-Casting" value=":Casting"
                            v-model="selectedItemsValue" />
                        <label for="item-Casting">Casting</label>

                        <!-- CASTING MATERIAL CONTROL -->
                        <ItemControls :wastage="wastage" :materials-name="materialsName" :show-wastage-control="false"
                            :show-material-control="selectedItemsValue.some(i => i.endsWith(':Casting'))"
                            @update:wastage="$emit('update:wastage', $event)"
                            @update:materialsName="$emit('update:materialsName', $event)" />
                    </div>
                </div>
            </fieldset>
        </fieldset>
        <!-- REPORT SUMMARY ITEMS -->
        <fieldset class="fieldset-basic-inputs">
            <legend>Report Summary Items</legend>
            <div class="all-select-container">
                <input type="checkbox" class="all-select-options" id="select-all-summary" :checked="selectAllSummary"
                    @change="toggleAllSummary" />
            </div>
            <div class="preset-checker make-distance padding">
                <div class="checkbox" v-for="(item, index) in REPORT_SUMMARY_ITEMS" :key="index">
                    <input type="checkbox" :id="`summery-${item}`" :value="item"
                        v-model="selectedReportSummeryItemsValue" />
                    <label :for="`summery-${item}`">{{ item }}</label>
                </div>
            </div>
        </fieldset>
    </section>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import type { SelectOptionType } from '../Types/ReportFormTypes';
import { ITEMS, REPORT_SUMMARY_ITEMS } from '../Types/ReportFormTypes';
import ItemControls from './ItemControls.vue';

// COMPONENT PROPS
interface Props {
    selectedOption: SelectOptionType;
    selectedItems: string[];
    selectedReportSummeryItems: string[];
    wastage: number;
    materialsName: string;
}

const props = defineProps<Props>();

// COMPONENT EMITS
const emit = defineEmits<{
    'update:selectedOption': [value: SelectOptionType];
    'update:selectedItems': [value: string[]];
    'update:selectedReportSummeryItems': [value: string[]];
    'update:wastage': [value: number];
    'update:materialsName': [value: string];
}>();

// COMPUTED PROPERTIES
const selectedOptionValue = computed({
    get: () => props.selectedOption,
    set: (value) => emit('update:selectedOption', value)
});

const selectedItemsValue = computed({
    get: () => props.selectedItems,
    set: (value) => emit('update:selectedItems', value)
});

const selectedReportSummeryItemsValue = computed({
    get: () => props.selectedReportSummeryItems,
    set: (value) => emit('update:selectedReportSummeryItems', value)
});

const selectAllNeeds = computed(() => {
    const expectedItems = ITEMS.map(item => `:${item}`);
    return expectedItems.every(item => props.selectedItems.includes(item));
});

const selectAllSummary = computed(() =>
    props.selectedReportSummeryItems.length === REPORT_SUMMARY_ITEMS.length
);

// METHODS
const toggleAllNeeds = () => {
    if (selectAllNeeds.value) {
        selectedItemsValue.value = props.selectedItems.filter(item => !item.startsWith(':'));
    } else {
        const itemsToAdd = ITEMS.map(item => `:${item}`);
        selectedItemsValue.value = Array.from(new Set([...props.selectedItems, ...itemsToAdd]));
    }
};

const toggleAllSummary = () => {
    if (selectAllSummary.value) {
        selectedReportSummeryItemsValue.value = [];
    } else {
        selectedReportSummeryItemsValue.value = [...REPORT_SUMMARY_ITEMS];
    }
};

onMounted(() => {
    // Default: select all needs
    if (!props.selectedItems.length) {
        selectedItemsValue.value = ITEMS.map(item => `:${item}`);
    }

    // Default: select all summary items
    if (!props.selectedReportSummeryItems.length) {
        selectedReportSummeryItemsValue.value = [...REPORT_SUMMARY_ITEMS];
    }
});
</script>