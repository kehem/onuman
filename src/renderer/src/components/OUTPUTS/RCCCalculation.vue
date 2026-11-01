<template>
    <section>
        <fieldset class="reinforcements-fieldset" :class="{ 'no-overflow': dynamicOverflowBool }">
            <legend>CC CALCULATIONS</legend>

            <section class="formatted-table responsive-table">
                <!-- ------------------------------------------ 
                 * LOADING OVERLAY
                 * ------------------------------------------ -->
                <div v-if="isLoading" class="loading-overlay">
                    <div class="shape-loader"></div>
                </div>

                <!-- ------------------------------------------ 
                 * MAIN CALCULATIONS TABLE
                 * ------------------------------------------ -->
                <table v-else class="onuman-table text-center row-border-all hover-border width-xxl">
                    <thead>
                        <tr>
                            <th class="top-named" colspan="5">CASTING</th>
                        </tr>
                        <tr>
                            <th>MATERIAL</th>
                            <th>
                                MIX RATIO
                                <span class="iconed" ref="popupWrapper" @click.stop="toggleMixRatioPopup">
                                    <i class="m-compose"></i>
                                    <div class="mix-ration-change">
                                        <!-- ------------------------------------------ 
                                         * SET MIX RATIO POPUP
                                         * ------------------------------------------ -->
                                        <section class="setMixRatioPopup" :class="{ show: setMixRatioPopup }"
                                            @click.stop>
                                            <table class="short-table">
                                                <thead>
                                                    <tr>
                                                        <th class="full-inline" colspan="2">SET NEW MIX RATIO</th>
                                                    </tr>
                                                    <tr>
                                                        <th>MATERIAL</th>
                                                        <th>RATIO</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>CEMENT</td>
                                                        <td class="f-center gap-10 bordered-all relative">
                                                            <input type="number" class="onuman-input2"
                                                                v-model.number="formData.mixRatioCement"
                                                                placeholder="ADD CEMENT" required min="0" step="0.1" />
                                                            <span v-if="errors.mixRatioCement" class="error-message">{{
                                                                errors.mixRatioCement }}</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>BRICK</td>
                                                        <td>
                                                            <input type="number" class="onuman-input2"
                                                                v-model.number="formData.mixRatioBrick"
                                                                placeholder="ADD BRICK" required min="0" step="0.1" />
                                                            <span v-if="errors.mixRatioBrick" class="error-message">{{
                                                                errors.mixRatioBrick }}</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>SAND</td>
                                                        <td>
                                                            <input type="number" class="onuman-input2"
                                                                v-model.number="formData.mixRatioSand"
                                                                placeholder="ADD SAND" required min="0" step="0.1" />
                                                            <span v-if="errors.mixRatioSand" class="error-message">{{
                                                                errors.mixRatioSand }}</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>STONE</td>
                                                        <td>
                                                            <input type="number" class="onuman-input2"
                                                                v-model.number="formData.mixRatioStone"
                                                                placeholder="ADD STONE" required min="0" step="0.1" />
                                                            <span v-if="errors.mixRatioStone" class="error-message">{{
                                                                errors.mixRatioStone }}</span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <div class="d-block">
                                                <strong><i class="m-bubble1"></i> ADD COMMENT</strong>
                                                <textarea class="m-tb-05 onuman-input2" v-model="formData.comment"
                                                    placeholder="OPTIONAL COMMENT"></textarea>
                                            </div>
                                            <button type="button" class="button project-btn m-b-05"
                                                @click="sendMixRatio">SUBMIT</button>
                                        </section>
                                    </div>
                                </span>
                            </th>
                            <th>VOLUME</th>
                            <th>QUANTITY</th>
                            <th>
                                <!-- ------------------------------------------ 
                                 * PRICE LIST WITH HOVER PREVIEW
                                 * ------------------------------------------ -->
                                <div class="price-list-container" @mouseenter="priceList = true"
                                    @mouseleave="priceList = false">
                                    PRICE
                                    <span class="price-preview">
                                        <i class="m-info3 circle-border"></i>
                                    </span>
                                    <div class="price-list" v-if="priceList">
                                        <ul v-for="item in materialsList" class="price-item" :key="item.id">
                                            <li>{{ item.name }}</li>
                                            <li>{{ item.price }}/=</li>
                                        </ul>
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </thead>

                    <!-- ------------------------------------------ 
                     * MATERIALS DATA ROWS
                     * ------------------------------------------ -->
                    <tbody>
                        <tr>
                            <td><b>CEMENT</b></td>
                            <td>{{ rcc?.mix_ratio.cement ?? '-' }}</td>
                            <td>{{ formatNumber(unitStore.convertUnit('mm', rcc?.cement_volume ?? 0, 3)) }} {{
                                unitStore.targetUnit }}<sup>3</sup></td>
                            <td>{{ formatNumber(rcc?.cement_bag) }} BAG</td>
                            <td>{{ rcc?.cement_price }}/=</td>
                        </tr>
                        <tr>
                            <td><b>SAND</b></td>
                            <td>{{ rcc?.mix_ratio.sand ?? '-' }}</td>
                            <td>{{ formatNumber(unitStore.convertUnit('mm', rcc?.sand_volume ?? 0, 3)) }} {{
                                unitStore.targetUnit }}<sup>3</sup></td>
                            <td>-</td>
                            <td>{{ rcc?.sand_price }}/=</td>
                        </tr>
                        <tr>
                            <td><b>STONE</b></td>
                            <td>{{ rcc?.mix_ratio.stone ?? '-' }}</td>
                            <td>{{ formatNumber(unitStore.convertUnit('mm', rcc?.stone_volume ?? 0, 3)) }} {{
                                unitStore.targetUnit }}<sup>3</sup></td>
                            <td>-</td>
                            <td>{{ rcc?.stone_price }}/=</td>
                        </tr>
                        <tr>
                            <td><b>BRICK CHIPS</b></td>
                            <td>{{ rcc?.mix_ratio.brick ?? '-' }}</td>
                            <td>{{ formatNumber(unitStore.convertUnit('mm', rcc?.brick_volume ?? 0, 3)) }} {{
                                unitStore.targetUnit }}<sup>3</sup></td>
                            <td>{{ formatNumber(rcc?.brick_pcs) }} PCS</td>
                            <td>{{ rcc?.brick_price }}/=</td>
                        </tr>
                        <tr class="ready-mix">
                            <td><b>READY MIX</b></td>
                            <td>-</td>
                            <td>{{ formatNumber(unitStore.convertUnit('mm', rcc?.dry_mixture ?? 0, 3)) }} {{
                                unitStore.targetUnit }}<sup>3</sup></td>
                            <td>-</td>
                            <td>{{ formatNumber(rcc?.ready_mixture_total) }}/=</td>
                        </tr>

                        <!-- ------------------------------------------ 
                         * TOTAL PRICING SUMMARY ROWS
                         * ------------------------------------------ -->
                        <tr class="rcc-sub">
                            <td colspan="4">TOTAL STONE DRY MIXING PRICE</td>
                            <td colspan="1">{{ formatNumber(rcc?.total_price_stone) }}/=</td>
                        </tr>
                        <tr class="rcc-sub">
                            <td colspan="4">TOTAL BRICK DRY MIXING PRICE</td>
                            <td colspan="1">{{ formatNumber(rcc?.total_price_brick) }}/=</td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </fieldset>
    </section>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted, computed } from 'vue';
import { RCC } from '../../Interfaces/Inputs';
import { useToast } from '../../composables/Toast';
import { formatNumber } from '../../composables/DecimalNumberValidator';
import { useApi } from '../../composables/useApi';
const { get, patch } = useApi()

import { useUnitStore } from '../../stores/unitStore';

const unitStore = useUnitStore();

/* ------------------------------------------  
 * PROPS DEFINITION
 * ------------------------------------------ */
const props = defineProps<{
    projectId: number;
    type: string;
    totalVolume: number;
}>();

/* ------------------------------------------  
 * REACTIVE STATE
 * ------------------------------------------ */
const isLoading = ref(false);
const rcc = ref<RCC | null>(null);
const { showToast } = useToast();

const emit = defineEmits<{
    (e: 'update:rcc', value: RCC | null): void
}>();
/* ------------------------------------------  
 * API FETCH FUNCTION - RCC CALCULATIONS
 * ------------------------------------------ */
const getRCC = async () => {
    // Don't fetch if totalVolume is 0 or negative
    if (props.totalVolume <= 0) {
        rcc.value = null;
        return;
    }

    isLoading.value = true;
    try {


        const response = await get<RCC>(
            `/api/rcc_calculate/${props.projectId}/${props.type}/${props.totalVolume}`
        );
        rcc.value = response;
    } catch (error: any) {
        const errorMessage = error.response?.message || error.message || 'FAILED TO FETCH RCC DATA';
        showToast('error', errorMessage, 5000, 'right-bottom');
    } finally {
        isLoading.value = false;
    }
};

/* ------------------------------------------  
 * WATCHERS - CONDITIONAL API FETCHING
 * ------------------------------------------ */
watch(
    () => props.totalVolume,
    () => getRCC(),
    { immediate: true }
);

/* ------------------------------------------  
 * MIX RATIO POPUP LOGIC
 * ------------------------------------------ */
const popupWrapper = ref<HTMLElement | null>(null);
const setMixRatioPopup = ref(false);

const toggleMixRatioPopup = () => {
    setMixRatioPopup.value = !setMixRatioPopup.value;
};

const handleOutsideClick = (event: MouseEvent) => {
    if (popupWrapper.value && !popupWrapper.value.contains(event.target as Node)) {
        setMixRatioPopup.value = false;
    }
};

/* ------------------------------------------  
 * DYNAMIC OVERFLOW HANDLING
 * ------------------------------------------ */
const dynamicOverflowBool = ref(true);
const dynamicOverflow = () => {
    setTimeout(() => {
        dynamicOverflowBool.value = false;
    }, 200);
};

/* ------------------------------------------  
 * LIFECYCLE HOOKS
 * ------------------------------------------ */
onMounted(() => {
    document.addEventListener('click', handleOutsideClick);
    dynamicOverflow();
});

onUnmounted(() => document.removeEventListener('click', handleOutsideClick));

/* ------------------------------------------  
 * FORM DATA & VALIDATION
 * ------------------------------------------ */
const formData = reactive({
    mixRatioCement: 0,
    mixRatioBrick: 0,
    mixRatioSand: 0,
    mixRatioStone: 0,
    comment: ''
});

const errors = reactive({
    mixRatioCement: '',
    mixRatioBrick: '',
    mixRatioSand: '',
    mixRatioStone: ''
});

/* ------------------------------------------  
 * SYNC FORM DATA WITH RCC DATA
 * ------------------------------------------ */
watch(rcc, (newVal) => {
    if (newVal?.mix_ratio) {
        formData.mixRatioCement = newVal.mix_ratio.cement ?? 0;
        formData.mixRatioBrick = newVal.mix_ratio.brick ?? 0;
        formData.mixRatioSand = newVal.mix_ratio.sand ?? 0;
        formData.mixRatioStone = newVal.mix_ratio.stone ?? 0;
        formData.comment = newVal.mix_ratio.comment ?? '';
    }
    emit('update:rcc', newVal)
});

/* ------------------------------------------  
 * SUBMIT MIX RATIO CHANGES
 * ------------------------------------------ */
const sendMixRatio = async () => {
    // Reset validation errors
    Object.assign(errors, {
        mixRatioCement: '',
        mixRatioBrick: '',
        mixRatioSand: '',
        mixRatioStone: ''
    });

    // Form validation
    let hasError = false;
    if (formData.mixRatioCement <= 0) {
        errors.mixRatioCement = 'CEMENT RATIO MUST BE > 0';
        hasError = true;
    }
    if (formData.mixRatioBrick < 0) {
        errors.mixRatioBrick = 'BRICK RATIO CANNOT BE NEGATIVE';
        hasError = true;
    }
    if (formData.mixRatioSand < 0) {
        errors.mixRatioSand = 'SAND RATIO CANNOT BE NEGATIVE';
        hasError = true;
    }
    if (formData.mixRatioStone < 0) {
        errors.mixRatioStone = 'STONE RATIO CANNOT BE NEGATIVE';
        hasError = true;
    }

    if (hasError) return;

    const payload = {
        project: props.projectId,
        type: props.type,
        cement: formData.mixRatioCement,
        brick: formData.mixRatioBrick,
        sand: formData.mixRatioSand,
        stone: formData.mixRatioStone,
        comment: formData.comment || ''
    };

    try {


        await patch('/api/create_indivisual_mix_ratio', payload);
        showToast('success', 'MIX RATIO UPDATED SUCCESSFULLY', 5000, 'right-bottom');
        setMixRatioPopup.value = false;
        getRCC();
    } catch (error: any) {
        const errorMessage = error.response?.message || error.message || 'FAILED TO UPDATE MIX RATIO';
        showToast('error', errorMessage, 5000, 'right-bottom');
    }
};

/* ------------------------------------------  
 * COMPUTED PROPERTIES
 * ------------------------------------------ */
const materialsList = computed(() => {
    return rcc.value?.materials_cost.map(material => material) || [];
});

const priceList = ref(false);
</script>

<style scoped>
.iconed {
    position: relative;
    cursor: pointer;
}

.setMixRatioPopup {
    position: absolute;
    bottom: -500%;
    left: 200%;
    transition: all 0.3s ease;
    opacity: 0;
    visibility: hidden;
    z-index: 999;
}

.setMixRatioPopup.show {
    opacity: 1;
    visibility: visible;
}

.loading-overlay {
    position: relative;
    width: 100%;
    height: 30vh;
    z-index: 1000;
}
</style>