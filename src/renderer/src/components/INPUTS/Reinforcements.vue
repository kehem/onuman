<!-- components/INPUTS/Reinforcements.vue -->


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Reinforcement, HeightOption } from '../../Interfaces/Inputs';
import Tooltip from '../../components/Initializers/ToolTip.vue';
import UnitConverterInput from '../INPUTS/UnitConverterInput.vue';
import { useApi } from '../../composables/useApi'
const { get } = useApi()

/* ---------------------------------------------
 * PROPS & EMITS
 * ------------------------------------------ */
const props = defineProps<{
    reinforcements: Reinforcement[];
}>();

const emit = defineEmits<{
    (e: 'update:reinforcements', value: Reinforcement[]): void;
    (e: 'add-reinforcement'): void;
    (e: 'remove-reinforcement', index: number): void;
    (e: 'reinforcement-diameter', diameter: number): void;
    (e: 'reinforcement-horizontal', horizontal: string): void;
    (e: 'reinforcement-horizontal_original', index: number, horizontal_original: string): void;
    (e: 'reinforcement-horizontal_diameter', diameter: number): void;
    (e: 'reinforcement-vertical_diameter', diameter: number): void;
}>();

/* ------------------------------------------
 * API STATE
 * ------------------------------------------ */


const diameterOptions = ref<HeightOption[]>([]);

/* --------------------------------------------
 * FETCH DIAMETER OPTIONS
 * ------------------------------------------ */

onMounted(async () => {
    try {
        const data = await get<HeightOption[]>('/api/bar_list');
        diameterOptions.value = data;
    } catch (e) {
        // Silent fail
    }
});

/* ------------------------------------------
 * HANDLE FIELD UPDATE
 * ------------------------------------------ */
const updateReinforcementField = (
    index: number,
    field: keyof Reinforcement,
    value: string | number | boolean
) => {
    const updated = [...props.reinforcements];

    switch (field) {
        case 'horizontal_diameter':
            const diaa = typeof value === 'string' ? parseFloat(value) : Number(value);
            if (!isNaN(diaa)) {
                updated[index] = { ...updated[index], horizontal_diameter: diaa };
                emit('reinforcement-horizontal_diameter', diaa);
            }
            break;
        case 'vertical_diameter':
            const dia = typeof value === 'string' ? parseFloat(value) : Number(value);
            if (!isNaN(dia)) {
                updated[index] = { ...updated[index], vertical_diameter: dia };
                emit('reinforcement-vertical_diameter', dia);
            }
            break;

        case 'horizontal':
            const horizontal = String(value);
            updated[index] = { ...updated[index], horizontal };
            emit('reinforcement-horizontal', horizontal);
            emit('reinforcement-horizontal_original', index, horizontal);
            break;

        case 'horizontal_original':
            updated[index] = { ...updated[index], horizontal_original: String(value) };
            break;

        case 'support':
            updated[index] = { ...updated[index], support: Boolean(value) };
            break;

        default:
            updated[index] = { ...updated[index], [field]: String(value) };
    }

    emit('update:reinforcements', updated);
};
</script>

<template>
    <fieldset class="fieldset-basic-inputs">
        <legend>Long Reinforcements</legend>

        <div v-for="(reinforcement, index) in props.reinforcements" :key="reinforcement.id"
            class="input-group-item cas78aXwe354">
            <div class="inaline">
                <!-- HEADER -->
                <div class="reinforcement-divider">
                    <div class="reinforcement-counter">Reinforcement {{ index + 1 }}</div>
                    <div class="reinforcement-checked">
                        <Tooltip content="Reinforcement <span style='color:turquoise;'>Check for Support</span>"
                            position="left">
                            <span class="checkbox">
                                <input type="checkbox" :checked="reinforcement.support"
                                    :name="`checked-reinforcement-${index + 1}`"
                                    :id="`checked-reinforcement-${index + 1}`"
                                    @change="updateReinforcementField(index, 'support', ($event.target as HTMLInputElement).checked)" />
                            </span>
                        </Tooltip>
                    </div>
                </div>



                <!-- HORIZONTAL -->
                <fieldset class="fieldset-basic-inputs">
                    <legend>HORIZONTAL</legend>
                    <!-- DIAMETER -->
                    <div class="input-group-item combobox-wrapper">
                        <label :for="`reinforcement-horizontal-${index}`">Diameter</label>
                        <select :name="`reinforcement-horizontal-${index}`" :id="`reinforcement-horizontal-${index}`"
                            class="onuman-select-box" v-model="reinforcements[index].horizontal_diameter"
                            @change="updateReinforcementField(index, 'diameter', ($event.target as HTMLSelectElement).value)">
                            <option value="" disabled>Select Diameter (bar)</option>
                            <option v-for="d in diameterOptions" :key="`${d.bar}-${d.suta}`" :value="Number(d.bar)">
                                #{{ d.suta }} ({{ d.bar }} mm)
                            </option>
                        </select>
                    </div>

                    <!-- HORIZONTAL DISTANCE -->
                    <UnitConverterInput v-model="reinforcements[index].horizontal" :inputId="`rodhorizontal-${index}`"
                        :originalValue="reinforcements[index].horizontal_original"
                        @update:originalValue="updateReinforcementField(index, 'horizontal_original', $event)">



                        <template #label>Distance</template>

                        <template #error="{ error }">
                            <span class="error-message">{{ error }}</span>
                        </template>

                        <template #originalInput="{ original }">
                            <div v-if="original" class="original-value">
                                Original: <br />
                                <span class="original-input">{{ original }}</span>
                            </div>
                        </template>
                    </UnitConverterInput>
                </fieldset>


                <!-- VERTICAL -->
                <fieldset class="fieldset-basic-inputs">
                    <legend>VERTICAL</legend>
                    <!-- DIAMETER -->
                    <div class="input-group-item combobox-wrapper">
                        <label :for="`reinforcement-vertical-${index}`">Diameter</label>
                        <select :name="`reinforcement-vertical-${index}`" :id="`reinforcement-vertical-${index}`"
                            class="onuman-select-box" v-model="reinforcements[index].vertical_diameter"
                            @change="updateReinforcementField(index, 'diameter', ($event.target as HTMLSelectElement).value)">
                            <option value="" disabled>Select Diameter (bar)</option>
                            <option v-for="d in diameterOptions" :key="`${d.bar}-${d.suta}`" :value="Number(d.bar)">
                                #{{ d.suta }} ({{ d.bar }} mm)
                            </option>
                        </select>
                    </div>

                    <!-- VERTICAL DISTANCE -->
                    <UnitConverterInput v-model="reinforcements[index].vertical" :inputId="`rodvertical-${index}`"
                        :originalValue="reinforcements[index].vertical_original"
                        @update:originalValue="updateReinforcementField(index, 'vertical_original', $event)">

                        <template #label>Distance</template>

                        <template #error="{ error }">
                            <span class="error-message">{{ error }}</span>
                        </template>

                        <template #originalInput="{ original }">
                            <div v-if="original" class="original-value">
                                Original: <br />
                                <span class="original-input">{{ original }}</span>
                            </div>
                        </template>
                    </UnitConverterInput>

                </fieldset>
            </div>

            <!-- ACTIONS -->
            <div v-if="index === props.reinforcements.length - 1" class="onuman-action-btn">
                <Tooltip content="<span style='color:turquoise;'>Remove</span> Reinforcement" position="bottom">
                    <span class="onuman-minus-btn" @click="emit('remove-reinforcement', index)"></span>
                </Tooltip>
                <Tooltip content="<span style='color:turquoise;'>Add New</span> Reinforcement" position="bottom">
                    <span class="onuman-plus-btn" @click="emit('add-reinforcement')"></span>
                </Tooltip>
            </div>
        </div>
    </fieldset>
</template>

<style>
.inaline {
    flex-direction: column !important;

    .fieldset-basic-inputs {
        flex: 1;
    }
}

.error-message {
    color: #e29118;
    font-size: 0.9em;
    margin-top: 0.5em;
}
</style>