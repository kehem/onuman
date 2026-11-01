<!-- /src/Reports/components/SpecificItemsSelection.vue -->

<!-- SPECIFIC ITEMS SELECTION COMPONENT -->
<template>
    <div v-if="selectedOption === 'specific'" class="report-section">
        <!-- BASIC ITEMS INDIVIDUAL -->
        <fieldset class="fieldset-basic-inputs">
            <legend class="sdfw43zq1">
                <strong class="success uppercase">BASIC ITEMS INDIVIDUAL</strong>
            </legend>

            <fieldset class="fieldset-basic-inputs" v-for="(property) in selectedBaseItems"
                :key="'item-group-' + property">
                <legend>
                    <strong>{{ property }}</strong>
                </legend>
                <div class="all-select-container">
                    <input type="checkbox" class="all-select-options" :id="`select-all-${property}-items`"
                        :checked="isAllSelectedForProperty(property, 'base')"
                        @change="toggleAllForProperty(property, 'base')" />
                </div>
                <div class="preset-checker make-distance">
                    <div class="checkbox" v-for="(item) in ITEMS.filter(i => !['Reinforcement', 'Casting'].includes(i))"
                        :key="`${property}-item-${item}`">
                        <input type="checkbox" :id="`item-${property}-${item}`" :value="`${property}:${item}`"
                            v-model="selectedItemsValue" />
                        <label :for="`item-${property}-${item}`">{{ item }}</label>

                        <!-- ITEM CONTROLS -->
                        <ItemControls :wastage="wastage" :materials-name="materialsName"
                            :show-wastage-control="item === 'Total Wastage' && selectedItems.some(i => i.endsWith(':Total Wastage'))"
                            :show-material-control="item === 'Casting' && selectedItems.some(i => i.endsWith(':Casting'))"
                            @update:wastage="$emit('update:wastage', $event)"
                            @update:materialsName="$emit('update:materialsName', $event)" />
                    </div>
                </div>

                <!-- REINFORCEMENT & CASTING ROWS -->
                <fieldset class="fieldset-basic-inputs padding">
                    <legend class="warning">Select Row's Item</legend>
                    <div class="preset-checker make-distance"
                        v-if="ITEMS.includes('Reinforcement') || ITEMS.includes('Casting')">
                        <!-- REINFORCEMENT -->
                        <div class="checkbox" v-if="ITEMS.includes('Reinforcement')">
                            <input type="checkbox" :id="`item-${property}-Reinforcement`"
                                :value="`${property}:Reinforcement`" v-model="selectedItemsValue" />
                            <label :for="`item-${property}-Reinforcement`">Reinforcement</label>
                        </div>

                        <!-- CASTING -->
                        <div class="checkbox" v-if="ITEMS.includes('Casting')">
                            <input type="checkbox" class="daser3346t" :id="`item-${property}-Casting`"
                                :value="`${property}:Casting`" v-model="selectedItemsValue" />
                            <label :for="`item-${property}-Casting`">Casting</label>

                            <!-- CASTING MATERIAL CONTROL -->
                            <ItemControls :wastage="wastage" :materials-name="materialsName"
                                :show-wastage-control="false"
                                :show-material-control="selectedItems.some(i => i === `${property}:Casting`)"
                                @update:wastage="$emit('update:wastage', $event)"
                                @update:materialsName="$emit('update:materialsName', $event)" />
                        </div>
                    </div>
                </fieldset>
            </fieldset>
        </fieldset>

        <!-- PROPERTY INDIVIDUAL -->
        <fieldset class="fieldset-basic-inputs">
            <legend class="sdfw43zq1">
                <strong class="success uppercase">PROPERTY INDIVIDUAL</strong>
            </legend>

            <fieldset class="fieldset-basic-inputs" v-for="(property) in selectedProperties"
                :key="'item-group-' + property">
                <legend>
                    <strong>{{ property }}</strong>
                </legend>
                <div class="all-select-container">
                    <input type="checkbox" class="all-select-options" :id="`select-all-${property}-property-items`"
                        :checked="isAllSelectedForProperty(property, 'property')"
                        @change="toggleAllForProperty(property, 'property')" />
                </div>

                <div class="preset-checker make-distance">
                    <div class="checkbox" v-for="(item) in ITEMS.filter(i => !['Reinforcement', 'Casting'].includes(i))"
                        :key="`${property}-item-${item}`">
                        <input type="checkbox" :id="`item-${property}-${item}`" :value="`${property}:${item}`"
                            v-model="selectedItemsValue" />
                        <label :for="`item-${property}-${item}`">{{ item }}</label>

                        <!-- ITEM CONTROLS -->
                        <ItemControls :wastage="wastage" :materials-name="materialsName"
                            :show-wastage-control="item === 'Total Wastage' && selectedItems.some(i => i.endsWith(':Total Wastage'))"
                            :show-material-control="item === 'Casting' && selectedItems.some(i => i.endsWith(':Casting'))"
                            @update:wastage="$emit('update:wastage', $event)"
                            @update:materialsName="$emit('update:materialsName', $event)" />
                    </div>
                </div>

                <!-- REINFORCEMENT & CASTING ROWS -->
                <fieldset class="fieldset-basic-inputs padding">
                    <legend class="warning">Select Row's Item</legend>
                    <div class="preset-checker make-distance"
                        v-if="ITEMS.includes('Reinforcement') || ITEMS.includes('Casting')">
                        <!-- REINFORCEMENT -->
                        <div class="checkbox" v-if="ITEMS.includes('Reinforcement')">
                            <input type="checkbox" :id="`item-${property}-Reinforcement`"
                                :value="`${property}:Reinforcement`" v-model="selectedItemsValue" />
                            <label :for="`item-${property}-Reinforcement`">Reinforcement</label>
                        </div>

                        <!-- CASTING -->
                        <div class="checkbox" v-if="ITEMS.includes('Casting')">
                            <input type="checkbox" class="daser3346t" :id="`item-${property}-Casting`"
                                :value="`${property}:Casting`" v-model="selectedItemsValue" />
                            <label :for="`item-${property}-Casting`">Casting</label>

                            <!-- CASTING MATERIAL CONTROL -->
                            <ItemControls :wastage="wastage" :materials-name="materialsName"
                                :show-wastage-control="false"
                                :show-material-control="selectedItems.some(i => i === `${property}:Casting`)"
                                @update:wastage="$emit('update:wastage', $event)"
                                @update:materialsName="$emit('update:materialsName', $event)" />
                        </div>
                    </div>
                </fieldset>
            </fieldset>
        </fieldset>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SelectOptionType } from '../Types/ReportFormTypes';
import { ITEMS } from '../Types/ReportFormTypes';
import ItemControls from './ItemControls.vue';

// COMPONENT PROPS
interface Props {
    selectedOption: SelectOptionType;
    selectedItems: string[];
    selectedBaseItems: string[];
    selectedProperties: string[];
    wastage: number;
    materialsName: string;
}

const props = defineProps<Props>();

// COMPONENT EMITS
const emit = defineEmits<{
    'update:selectedItems': [value: string[]];
    'update:wastage': [value: number];
    'update:materialsName': [value: string];
}>();

// COMPUTED PROPERTIES
const selectedItemsValue = computed({
    get: () => props.selectedItems,
    set: (value) => emit('update:selectedItems', value)
});

// METHODS
const isAllSelectedForProperty = (property: string, _type: 'base' | 'property') => {
    const expectedItems = ITEMS.map(item => `${property}:${item}`);
    return expectedItems.every(item => props.selectedItems.includes(item));
};

const toggleAllForProperty = (property: string, _type: 'base' | 'property') => {
    const propertyItems = ITEMS.map(item => `${property}:${item}`);

    if (isAllSelectedForProperty(property, _type)) {
        selectedItemsValue.value = props.selectedItems.filter(item => !propertyItems.includes(item));
    } else {
        selectedItemsValue.value = Array.from(new Set([...props.selectedItems, ...propertyItems]));
    }
};
</script>
