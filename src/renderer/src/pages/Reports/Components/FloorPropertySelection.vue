<!-- /src/Reports/components/FloorPropertySelection.vue -->
<template>
    <section class="report-section">
        <!-- BASE ITEMS SELECTION (Grouped by Category) -->
        <fieldset class="fieldset-basic-inputs" v-if="exteriorItems.length && selectedOperations.includes('Exterior')">
            <legend>Exterior Items</legend>

            <div class="all-select-container">
                <input type="checkbox" class="all-select-options" id="select-all-exterior"
                    :checked="isAllSelected('exterior')" @change="toggleAll('exterior')" />
            </div>

            <div class="preset-checker make-distance padding">
                <div class="checkbox" v-for="(item, index) in exteriorItems" :key="index">
                    <input type="checkbox" :id="`exterior-${item}`" :value="item" v-model="selectedBaseItems" />
                    <label :for="`exterior-${item}`">{{ item }}</label>
                </div>
            </div>
        </fieldset>

        <fieldset class="fieldset-basic-inputs" v-if="finishItems.length && selectedOperations.includes('Finish')">
            <legend>Finish Items</legend>

            <div class="all-select-container">
                <input type="checkbox" class="all-select-options" id="select-all-finish"
                    :checked="isAllSelected('finish')" @change="toggleAll('finish')" />
            </div>

            <div class="preset-checker make-distance padding">
                <div class="checkbox" v-for="(item, index) in finishItems" :key="index">
                    <input type="checkbox" :id="`finish-${item}`" :value="item" v-model="selectedBaseItems" />
                    <label :for="`finish-${item}`">{{ item }}</label>
                </div>
            </div>
        </fieldset>

        <fieldset class="fieldset-basic-inputs" v-if="interiorItems.length && selectedOperations.includes('Interior')">
            <legend>Interior Items</legend>

            <div class="all-select-container">
                <input type="checkbox" class="all-select-options" id="select-all-interior"
                    :checked="isAllSelected('interior')" @change="toggleAll('interior')" />
            </div>

            <div class="preset-checker make-distance padding">
                <div class="checkbox" v-for="(item, index) in interiorItems" :key="index">
                    <input type="checkbox" :id="`interior-${item}`" :value="item" v-model="selectedBaseItems" />
                    <label :for="`interior-${item}`">{{ item }}</label>
                </div>
            </div>
        </fieldset>

        <!-- FLOORS SELECTION -->
        <fieldset class="fieldset-basic-inputs">
            <legend>Floor's</legend>

            <div class="all-select-container">
                <input type="checkbox" class="all-select-options" id="select-all-floors" :checked="selectAllFloors"
                    @change="toggleAllFloors" />
            </div>

            <div class="preset-checker make-distance padding">
                <div class="checkbox" v-for="(item, index) in totalFloors" :key="index">
                    <input type="checkbox" :id="`floor-${item}`" :value="item" v-model="selectedFloors" />
                    <label :for="`floor-${item}`">Floor {{ item }}</label>
                </div>
            </div>
        </fieldset>

        <!-- PROPERTIES SELECTION -->
        <!-- Exterior Property -->
        <fieldset class="fieldset-basic-inputs"
            v-if="showProperty && exteriorItems.length && selectedOperations.includes('Exterior')">
            <legend>Exterior Property</legend>

            <div class="all-select-container">
                <input type="checkbox" class="all-select-options" id="select-all-exterior-props"
                    :checked="isAllPropertiesSelected('exterior')" @change="toggleAllProperties('exterior')" />
            </div>

            <div class="preset-checker make-distance">
                <div class="checkbox" v-for="(item, index) in exteriorProperties" :key="index">
                    <input type="checkbox" :id="`property-exterior-${item}`" :value="item"
                        v-model="selectedProperties" />
                    <label :for="`property-exterior-${item}`">{{ item }}</label>
                </div>
            </div>
        </fieldset>

        <!-- Finish Property -->
        <fieldset class="fieldset-basic-inputs"
            v-if="showProperty && finishItems.length && selectedOperations.includes('Finish')">
            <legend>Finish Property</legend>

            <div class="all-select-container">
                <input type="checkbox" class="all-select-options" id="select-all-finish-props"
                    :checked="isAllPropertiesSelected('finish')" @change="toggleAllProperties('finish')" />
            </div>

            <div class="preset-checker make-distance">
                <div class="checkbox" v-for="(item, index) in finishProperties" :key="index">
                    <input type="checkbox" :id="`property-finish-${item}`" :value="item" v-model="selectedProperties" />
                    <label :for="`property-finish-${item}`">{{ item }}</label>
                </div>
            </div>
        </fieldset>

        <!-- Interior Property -->
        <fieldset class="fieldset-basic-inputs"
            v-if="showProperty && interiorItems.length && selectedOperations.includes('Interior')">
            <legend>Interior Property</legend>

            <div class="all-select-container">
                <input type="checkbox" class="all-select-options" id="select-all-interior-props"
                    :checked="isAllPropertiesSelected('interior')" @change="toggleAllProperties('interior')" />
            </div>

            <div class="preset-checker make-distance">
                <div class="checkbox" v-for="(item, index) in interiorProperties" :key="index">
                    <input type="checkbox" :id="`property-interior-${item}`" :value="item"
                        v-model="selectedProperties" />
                    <label :for="`property-interior-${item}`">{{ item }}</label>
                </div>
            </div>
        </fieldset>

    </section>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';
import {
    BASE_ITEMS,
    PROPERTIES,
    normalize,
    type AVAILABLE_DATA
} from '../Types/ReportFormTypes';

interface Props {
    selectedBaseItems: string[];
    selectedFloors: number[];
    selectedProperties: string[];
    totalFloors: number[];
    showProperty: boolean;
    selectedOperations: string[];
    availableChecked: AVAILABLE_DATA | null;
}
const props = defineProps<Props>();

const emit = defineEmits<{
    'update:selectedBaseItems': [value: string[]];
    'update:selectedFloors': [value: number[]];
    'update:selectedProperties': [value: string[]];
}>();

// --- Two-way binding for props ---
const selectedBaseItems = computed({
    get: () => props.selectedBaseItems,
    set: (value) => emit('update:selectedBaseItems', value)
});
const selectedFloors = computed({
    get: () => props.selectedFloors,
    set: (value) => emit('update:selectedFloors', value)
});
const selectedProperties = computed({
    get: () => props.selectedProperties,
    set: (value) => emit('update:selectedProperties', value)
});

// --- Helpers to filter items by prefix ---
const getItemsByPrefix = (prefix: string) =>
    BASE_ITEMS.filter(item => item.startsWith(`${prefix}:`))
        .map(item => item.replace(`${prefix}:`, ''));

// Computed lists
const exteriorItems = computed(() => getItemsByPrefix('exterior'));
const interiorItems = computed(() => getItemsByPrefix('interior'));
const finishItems = computed(() => getItemsByPrefix('finish'));

// --- Helpers to filter properties ---
const getPropertiesByPrefix = (prefix: string) =>
    PROPERTIES.filter(p => p.startsWith(`${prefix}:`))
        .map(p => p.replace(`${prefix}:`, ''));

// Computed lists for properties
const exteriorProperties = computed(() => getPropertiesByPrefix('exterior'));
const finishProperties = computed(() => getPropertiesByPrefix('finish'));
const interiorProperties = computed(() => getPropertiesByPrefix('interior'));


// --- Auto-check based on availableChecked data ---
const autoCheckItems = () => {
    if (!props.availableChecked) {
        selectedBaseItems.value = [];
        return;
    }

    const autoCheckedBaseItems: string[] = [];

    // ONLY check base_items - remove keys checking from here
    if (props.availableChecked.base_items) {
        Object.entries(props.availableChecked.base_items).forEach(([apiKey, isAvailable]) => {
            if (isAvailable) {
                const match = BASE_ITEMS.find(item =>
                    normalize(item.split(':')[1]) === apiKey
                );
                if (match) {
                    const displayName = match.split(':')[1];
                    autoCheckedBaseItems.push(displayName);
                }
            }
        });
    }


    selectedBaseItems.value = [...new Set(autoCheckedBaseItems)]; // Remove duplicates

    // Auto-check floors based on available floor array
    if (props.availableChecked.floor && Array.isArray(props.availableChecked.floor)) {
        const autoCheckedFloors = props.availableChecked.floor
            .map(floor => parseInt(floor))
            .filter(floorNum => !isNaN(floorNum));

        selectedFloors.value = autoCheckedFloors;
    }
};

// Auto-check properties based on available data
const autoCheckProperties = () => {
    if (!props.availableChecked) {
        selectedProperties.value = [];
        return;
    }

    const autoCheckedProperties: string[] = [];

    // Only check based on keys
    if (props.availableChecked.keys) {
        Object.entries(props.availableChecked.keys).forEach(([apiKey, isAvailable]) => {
            if (isAvailable) {
                const match = PROPERTIES.find(prop =>
                    normalize(prop.split(':')[1]) === apiKey
                );
                if (match) {
                    const propName = match.split(':')[1];
                    autoCheckedProperties.push(propName);
                }
            }
        });
    }


    // ✅ Removed default Exterior/Interior pushes
    selectedProperties.value = [...new Set(autoCheckedProperties)];
};


// --- Select All logic per group ---
const isAllSelected = (prefix: string) => {
    const items = getItemsByPrefix(prefix);
    return items.length > 0 && items.every(item => selectedBaseItems.value.includes(item));
};

const toggleAll = (prefix: string) => {
    const items = getItemsByPrefix(prefix);
    if (isAllSelected(prefix)) {
        selectedBaseItems.value = selectedBaseItems.value.filter(i => !items.includes(i));
    } else {
        selectedBaseItems.value = [...new Set([...selectedBaseItems.value, ...items])];
    }
};

// --- Select All logic for floors ---
const selectAllFloors = computed(() => {
    return selectedFloors.value.length === props.totalFloors.length;
});

const toggleAllFloors = () => {
    if (selectAllFloors.value) {
        selectedFloors.value = [];
    } else {
        selectedFloors.value = [...props.totalFloors];
    }
};

// --- Select All logic for properties ---
const isAllPropertiesSelected = (prefix: string) => {
    const properties = getPropertiesByPrefix(prefix);
    return properties.length > 0 && properties.every(prop => selectedProperties.value.includes(prop));
};

const toggleAllProperties = (prefix: string) => {
    const properties = getPropertiesByPrefix(prefix);
    if (isAllPropertiesSelected(prefix)) {
        selectedProperties.value = selectedProperties.value.filter(p => !properties.includes(p));
    } else {
        selectedProperties.value = [...new Set([...selectedProperties.value, ...properties])];
    }
};

// --- Watchers and lifecycle hooks ---
onMounted(() => {
    autoCheckItems();
    // Auto-check properties after items are loaded
    setTimeout(() => {
        autoCheckProperties();
    }, 100);
});

watch(() => props.availableChecked, () => {
    autoCheckItems();
    // Auto-check properties when available data changes
    setTimeout(() => {
        autoCheckProperties();
    }, 100);
}, { deep: true });

watch([() => selectedFloors.value, () => props.selectedOperations], () => {
    autoCheckProperties();
}, { deep: true });

// Watch for base items changes to update properties accordingly
watch(() => selectedBaseItems.value, () => {
    autoCheckProperties();
}, { deep: true });
</script>