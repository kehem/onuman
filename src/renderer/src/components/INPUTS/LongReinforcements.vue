<!-- components/INPUTS/LongReinforcements.vue -->


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Reinforcement } from '../../Interfaces/Pile';
import Tooltip from '../../components/Initializers/ToolTip.vue';
import UnitConverterInput from '../INPUTS/UnitConverterInput.vue';
import { useApi } from '../../composables/useApi'
const { get } = useApi()

/* ------------------------------------------
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
    (e: 'reinforcement-height', height: string): void;
    (e: 'reinforcement-height_original', index: number, height_original: string): void;
}>();

// import { watch } from 'vue';

// watch(
//     () => props.reinforcements,
//     (newVal, oldVal) => {
//         console.log('Reinforcements changed:', { oldVal, newVal });
//     },
//     { deep: true }
// );

/* ------------------------------------------
 * TYPES & API STATE
 * ------------------------------------------ */
interface HeightOption {
    bar: string;
    suta: string;
}

const diameterOptions = ref<HeightOption[]>([]);

/* ------------------------------------------
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
        case 'diameter':
            const dia = typeof value === 'string' ? parseFloat(value) : Number(value);
            if (!isNaN(dia)) {
                updated[index] = { ...updated[index], diameter: dia };
                emit('reinforcement-diameter', dia);
            }
            break;

        case 'height':
            const height = String(value);
            updated[index] = { ...updated[index], height };
            emit('reinforcement-height', height);
            emit('reinforcement-height_original', index, height);
            break;

        case 'height_original':
            updated[index] = { ...updated[index], height_original: String(value) };
            break;

        case 'support':
            updated[index] = { ...updated[index], support: Boolean(value) };
            break;

        case 'qty':
            // Only allow positive integers for qty
            const qtyValue = String(value).replace(/[^0-9]/g, '');
            const qty = qtyValue ? parseInt(qtyValue) : 0;
            if (qtyValue && !isNaN(qty) && qty > 0) {
                updated[index] = { ...updated[index], qty: qtyValue };
            } else {
                updated[index] = { ...updated[index], qty: '' };
            }
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

                <!-- QTY -->
                <aside>
                    <label :for="`rod-qty-${index}`">Rod Qty</label>
                    <input class="onuman-input2" type="text" maxlength="5" :value="reinforcement.qty"
                        :name="`rod-qty-${index}`" :id="`rod-qty-${index}`" placeholder="Enter Rod Qty"
                        @input="updateReinforcementField(index, 'qty', ($event.target as HTMLInputElement).value)" />
                </aside>

                <!-- DIAMETER -->
                <div class="input-group-item combobox-wrapper">
                    <label :for="`reinforcement-height-${index}`">Diameter</label>
                    <select :name="`reinforcement-height-${index}`" :id="`reinforcement-height-${index}`"
                        class="onuman-select-box" v-model="reinforcements[index].diameter"
                        @change="updateReinforcementField(index, 'diameter', ($event.target as HTMLSelectElement).value)">
                        <option value="" disabled>Select Diameter (bar)</option>
                        <option v-for="d in diameterOptions" :key="`${d.bar}-${d.suta}`" :value="Number(d.bar)">
                            #{{ d.suta }} ({{ d.bar }} mm)
                        </option>
                    </select>
                </div>

                <!-- HEIGHT -->
                <UnitConverterInput v-model="reinforcements[index].height" :inputId="`rodHeight-${index}`"
                    :originalValue="reinforcements[index].height_original"
                    @update:originalValue="updateReinforcementField(index, 'height_original', $event)">
                    <template #label>Rod Length</template>

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
.error-message {
    color: #e29118;
    font-size: 0.9em;
    margin-top: 0.5em;
}
</style>

<style>
.error-message {
    color: #e29118;
    font-size: 0.9em;
    margin-top: 0.5em;
}
</style>