<!-- components/INPUTS/BRICK/BrickBasic.vue -->



<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import Tooltip from '../../../components/Initializers/ToolTip.vue'
import UnitConverterInput from '../../INPUTS/UnitConverterInput.vue'
import { useRoute } from 'vue-router'
import { useApi } from '../../../composables/useApi';
const { get, post } = useApi()

import { Options } from '../../../Interfaces/BPP';

const route = useRoute()
const projectId = route.query.id

const total_floors = Number(route.query.totalFloors)

/* ------------------------------------------
 * FLOOR SELECTION HANDLER
 * ------------------------------------------ */
const selected = ref<number[]>([])

const toggleFloor = (floor: number) => {
    const index = selected.value.indexOf(floor)
    if (index > -1) {
        selected.value.splice(index, 1)
    } else {
        selected.value.push(floor)
    }
    emit('update:selectedFloors', [...selected.value])
}




/* ------------------------------------------
 * WALL SIDES
 * ------------------------------------------ */
const wallSide = ref<string | ''>('')
const wallSideOptions = ref<Options[]>([]);
const isWallSidePopup = ref(false);
const wallSidePopup = () => {
    isWallSidePopup.value = !isWallSidePopup.value
}

/* ------------------------------------------
 * FETCH DIAMETER OPTIONS
 * ------------------------------------------ */
onMounted(async () => {
    
    

    try {
        const data = await get<Options[]>(`/api/get_wall_side/${projectId}`);
        wallSideOptions.value = data;
    } catch (e) {
        // Silent fail
    }
});

const wallSideName = ref('');
const creatingWallSide = ref(false);

const closeWallSidePopup = () => {
    isWallSidePopup.value = false;
    wallSideName.value = '';
};

const createWallSide = async () => {
    if (!wallSideName.value.trim()) return;

    
    creatingWallSide.value = true;

    try {
        const data = await post<Options>('/api/create_wall_side', {
            name: wallSideName.value,
            projectId: projectId,
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



const updateWallSides = () => {
    emit('update:wallSide', wallSide.value);
};

/* ------------------------------------------
 * PROPS: BASIC WALL/BRICK INPUTS
 * ------------------------------------------ */
const props = defineProps<{
    wallHeight: string
    wallThickness: string
    wallLength: string
    wallSide: string
    originalWallHeight: string
    originalWallThickness: string
    originalWallLength: string
    selectedFloors: number[]
}>()

/* ------------------------------------------
 * EMITS
 * ------------------------------------------ */
const emit = defineEmits<{
    (e: `update:${'wallType' | 'wallHeight' | 'wallThickness' | 'wallLength' | 'wallSide'}`, value: string): void
    (e: 'update:selectedFloors', value: number[]): void
    (e: 'input:validate', event: Event, field: string): void
    (e: 'update:originalValue', field: string, value: string): void
}>()

/* ------------------------------------------
 * SYNC SELECTED FLOORS PROP WITH LOCAL STATE
 * ------------------------------------------ */
watch(
    () => props.selectedFloors,
    (newVal) => {
        selected.value = [...newVal]
    },
    { immediate: true }
)
watch(
    () => props.wallSide,  // Watching the 'wallSide' prop
    (newVal) => {
        wallSide.value = newVal
    }
);

/* ------------------------------------------
 * EMIT ORIGINAL VALUES FOR CHANGE TRACKING
 * ------------------------------------------ */
const handleOriginalValue = (field: string, value: string) => {
    emit('update:originalValue', field, value)
}


</script>


<template>
    <section>
        <!-- ------------------------------------------
                    BRICK FLOOR SELECTION
        ------------------------------------------ -->
        <br>
        <fieldset class="fieldset-basic-inputs">
            <legend>Select Floor's</legend>
            <div class="preset-checker make-distance">
                <Tooltip :content="`Floor ${item}`" position="top" v-for="(item, index) in total_floors" :key="index">
                    <!-- FLOOR ${index} -->
                    <div class="checkbox">
                        <input type="checkbox" :id="`floor-${item}`" :value="item" :checked="selected.includes(item)"
                            @change="toggleFloor(item)" />

                        <label :for="`floor-${item}`">{{ item }}</label>
                    </div>
                </Tooltip>
            </div>
        </fieldset>
        <br>

        <br>
        <fieldset class="fieldset-basic-inputs">
            <legend>Wall Basic Inputs</legend>

            <!-- ------------------------------------------
            BRICK HEIGHT
            ------------------------------------------ -->
            <UnitConverterInput :value="wallHeight" :modelValue="wallHeight" inputId="wallHeight"
                @update:modelValue="emit('update:wallHeight', $event)"
                @update:originalValue="handleOriginalValue('wallHeight', $event)">
                <template #label>Wall Height</template>
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

            <!-- ------------------------------------------
            BRICK WIDTH THICKNESS
            ------------------------------------------ -->
            <UnitConverterInput :value="wallThickness" :modelValue="wallThickness" inputId="wallThickness"
                @update:modelValue="emit('update:wallThickness', $event)"
                @update:originalValue="handleOriginalValue('wallThickness', $event)">
                <template #label>Wall Thickness</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalWallThickness" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalWallThickness }}</span>
                    </div>
                </template>
            </UnitConverterInput>

            <!-- ------------------------------------------
            BRICK LENGTH
            ------------------------------------------ -->
            <UnitConverterInput :value="wallLength" :modelValue="wallLength" inputId="wallLength"
                @update:modelValue="emit('update:wallLength', $event)"
                @update:originalValue="handleOriginalValue('wallLength', $event)">
                <template #label>Wall Length</template>
                <template #error="{ error }">
                    <span class="error-message">{{ error }}</span>
                </template>
                <template #originalInput="{ original }">
                    <div v-if="original || originalWallLength" class="original-value">
                        Original:<br />
                        <span class="original-input">{{ original || originalWallLength }}</span>
                    </div>
                </template>
            </UnitConverterInput>

            <!-- ------------------------------------------
            WALL SIDE
            ------------------------------------------ -->
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


                <!-- Update the event handler -->
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