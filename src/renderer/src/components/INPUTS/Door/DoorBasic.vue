<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import Tooltip from '../../../components/Initializers/ToolTip.vue';
import UnitConverterInput from '../../INPUTS/UnitConverterInput.vue';
import { useRoute } from 'vue-router';
import { useApi } from '../../../composables/useApi';
const { get, post } = useApi()
import type { Options } from '../../../Interfaces/BPP';

// Route and project details
const route = useRoute();
const projectId = route.query.id as string | undefined;
const totalFloors = Number(route.query.totalFloors) || 0;

// Floor selection handler
const selectedFloors = ref<number[]>([]);

const toggleFloor = (floor: number) => {
    const index = selectedFloors.value.indexOf(floor);
    if (index > -1) {
        selectedFloors.value.splice(index, 1);
    } else {
        selectedFloors.value.push(floor);
    }
    emit('update:selectedFloors', [...selectedFloors.value]);
};

// Wall side management
const wallSide = ref<string>('');
const wallSideOptions = ref<Options[]>([]);
const isWallSidePopup = ref(false);
const wallSideName = ref('');
const creatingWallSide = ref(false);

const wallSidePopup = () => {
    isWallSidePopup.value = !isWallSidePopup.value;
};

const closeWallSidePopup = () => {
    isWallSidePopup.value = false;
    wallSideName.value = '';
};

const createWallSide = async () => {
    if (!wallSideName.value.trim() || !projectId) return;

    creatingWallSide.value = true;
    try {
        const data= await post<Options>('/api/create_wall_side', {
            name: wallSideName.value,
            projectId,
        });
        wallSideOptions.value.push(data);
        wallSideName.value = '';
        isWallSidePopup.value = false;
    } catch (error) {
        console.error('Failed to create wall side:', error);
    } finally {
        creatingWallSide.value = false;
    }
};

// Fetch wall side options
onMounted(async () => {
    if (!projectId) return;
    
    

    try {
        const data= await get<Options[]>(`/api/get_wall_side/${projectId}`);
        wallSideOptions.value = data;
    } catch (error) {
        console.error('Failed to fetch wall side options:', error);
    }
});

// Quantity input
const DoorQty = ref<string>('');

const onlyNumber = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '').slice(0, 5);
    DoorQty.value = value;
    emit('update:DoorQty', value);
};

// Props
const props = defineProps<{
    wallHeight: string;
    wallWidth: string;
    wallSide: string;
    DoorQty: string;
    originalWallHeight: string;
    originalWallWidth: string;
    selectedFloors: number[];
}>();

// Emits
const emit = defineEmits<{
    (e: `update:${'wallHeight' | 'wallSide' | 'DoorQty' | 'wallWidth'}`, value: string): void;
    (e: 'update:selectedFloors', value: number[]): void;
    (e: 'input:validate', event: Event, field: string): void;
    (e: 'update:originalValue', field: string, value: string): void;
}>();

// Sync props with local state
watch(
    () => props.selectedFloors,
    (newVal) => {
        selectedFloors.value = [...newVal];
    },
    { immediate: true }
);

watch(
    () => props.wallSide,
    (newVal) => {
        wallSide.value = newVal;
    },
    { immediate: true }
);

watch(
    () => props.DoorQty,
    (newVal) => {
        DoorQty.value = newVal || '';
    },
    { immediate: true }
);

// Emit original values for change tracking
const handleOriginalValue = (field: string, value: string) => {
    emit('update:originalValue', field, value);
};

// Emit wall side updates
const updateWallSides = () => {
    emit('update:wallSide', wallSide.value);
};
</script>

<template>
    <section>
        <!-- BRICK FLOOR SELECTION -->
        <br>
        <fieldset class="fieldset-basic-inputs">
            <legend>Select Floor's</legend>
            <div class="preset-checker make-distance">
                <Tooltip :content="`Floor ${item}`" position="top" v-for="(item, index) in totalFloors" :key="index">
                    <div class="checkbox">
                        <input type="checkbox" :id="`floor-${item}`" :value="item"
                            :checked="selectedFloors.includes(item)" @change="toggleFloor(item)" />
                        <label :for="`floor-${item}`">{{ item }}</label>
                    </div>
                </Tooltip>
            </div>
        </fieldset>
        <br>

        <br>
        <fieldset class="fieldset-basic-inputs">
            <legend>Basic Inputs</legend>

            <!-- BRICK HEIGHT -->
            <UnitConverterInput :value="wallHeight" :modelValue="wallHeight" inputId="wallHeight"
                @update:modelValue="emit('update:wallHeight', $event)"
                @update:originalValue="handleOriginalValue('wallHeight', $event)">
                <template #label>Height</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalWallHeight" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalWallHeight }}</span>
                    </div>
                </template>
            </UnitConverterInput>

            <!-- BRICK WIDTH WIDTH -->
            <UnitConverterInput :value="wallWidth" :modelValue="wallWidth" inputId="wallWidth"
                @update:modelValue="emit('update:wallWidth', $event)"
                @update:originalValue="handleOriginalValue('wallWidth', $event)">
                <template #label>Width</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalWallWidth" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalWallWidth }}</span>
                    </div>
                </template>
            </UnitConverterInput>

            <!-- Door QUANTITY -->
            <div class="input-group-item">
                <label for="Door-qty">Quantity</label>
                <input class="onuman-input2" type="text" maxlength="5" v-model="DoorQty" name="Door-qty" id="Door-qty"
                    placeholder="Type Quantity" @input="onlyNumber($event)" required />
            </div>

            <!-- WALL SIDE -->
            <div class="input-group-item combobox-wrapper">
                <label :for="`wall-sides`">
                    <p>Wall Side</p>
                    <i class="m-plus2 plus-icon-qzs1sd" @click="wallSidePopup"></i>
                </label>

                <div class="popup" v-if="isWallSidePopup">
                    <button type="button" class="bordered-circle onuman-crosxa" @click="closeWallSidePopup">
                        <i class="m-close"></i>
                    </button>

                    <input class="onuman-input2" type="text" id="wall-side-name" name="wall-side-name"
                        placeholder="Enter Wall Side Name" v-model="wallSideName" required />

                    <button class="onuman-23cdasd" type="button" :disabled="creatingWallSide" @click="createWallSide">
                        {{ creatingWallSide ? 'Creating...' : 'Create' }}
                    </button>
                </div>

                <select :name="`wall-sides`" :id="`wall-sides`" class="onuman-select-box" v-model="wallSide"
                    @change="updateWallSides">
                    <option value="" disabled>Select Side</option>
                    <option v-for="(item, index) in wallSideOptions" :key="index" :value="item.name">
                        {{ item.name }}
                    </option>
                </select>
            </div>
        </fieldset>
    </section>
</template>