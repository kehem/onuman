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
import { computed, watch, ref } from 'vue';
import { useOnumanCombobox } from '../../composables/onumanCombobox';
import { useApi } from '../../composables/useApi'
const { get } = useApi()
import { useToast } from '../../composables/Toast';
const { showToast } = useToast()

// DEFINE PROPS
interface Props {
    id: string;
    options: string[];
    placeholder: string;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
});

// DEFINE EMITS
const emit = defineEmits<{
    (e: 'update:selected', value: string): void;
}>();




// SEND PRESET
const newPreset = ref<string>('');
let apiClient: any
    ; (async () => {
        const api = await useApi()
        apiClient = api.apiClient
    })()

const sendNewPreset = async () => {
    if (!apiClient) return

    try {
        const res = await get('/api/project_list')
        newPreset.value = res.data
    } catch (err: string | any) {
        showToast('error', err)
    }
}
setTimeout(() => {
    sendNewPreset()
}, 500)






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
watch(selectedOption, (newOption) => {
    // EMIT SELECTED OPTION TO PARENT
    emit('update:selected', newOption);
});
</script>