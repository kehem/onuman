<!-- components/OnumanCombobox.vue -->
<template>
    <div class="onuman-combobox">
        <!-- COMBOBOX INPUT AND CHEVRON -->
        <div class="combo-inputbox" @click="toggleDropdown">
            <input type="text" :id="id" class="onuman-input2" :value="searchQuery" @input="handleInput"
                :placeholder="placeholder" :disabled="disabled" ref="comboboxInput" />
            <i class="combobox-chevron m-chevron-down d-sub-sub-text" :class="{ 'rotate-180': isOpen }"></i>
        </div>
        <!-- DROPDOWN LIST -->
        <ul class="combo-dropdown-list onuman-scrollbar" v-show="isOpen" ref="dropdownList">
            <li v-if="filteredOptions.length === 0" class="combo-option no-data">
                No data
            </li>
            <li v-else v-for="(option, index) in filteredOptions" :key="option" class="combo-option"
                :class="{ 'focused': index === focusedOptionIndex }" @click="selectOption(option)">
                {{ option }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

import { useOnumanCombobox } from '../../composables/onumanCombobox';

// DEFINE PROPS
interface Props {
    id: string;
    options: string[];
    placeholder: string;
    disabled?: boolean;
    selected?: string;
}


const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    selected: '',
});


// DEFINE EMITS
const emit = defineEmits<{
    (e: 'update:selected', value: string): void;
}>();

// SETUP COMBOBOX LOGIC
const {
    isOpen,
    selectedOption,
    searchQuery,
    filteredOptions,
    comboboxInput,
    dropdownList,
    focusedOptionIndex,
    toggleDropdown,
    selectOption,
    handleInput,
} = useOnumanCombobox(computed(() => props.options));

// WATCH SELECTED OPTION AND EMIT CHANGES
watch(
    () => props.selected,
    (newVal) => {
        selectedOption.value = newVal;
        searchQuery.value = newVal;
    },
    { immediate: true }
);
watch(selectedOption, (newOption) => {
    emit('update:selected', newOption);
});

</script>