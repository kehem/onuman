<!-- components/Dashboard/BottomBar.vue -->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import ToolTipShort from '../Initializers/ToolTipShort.vue';
import UpdateSoftware from './UpdateSoftware.vue';
import { useUnitStore } from '../../stores/unitStore';


const unitStore = useUnitStore();

// State to toggle unit dropdown
const showUnits = ref(false);

// Toggle dropdown visibility
const toggleUnits = () => {
    showUnits.value = !showUnits.value;
};

// Hide dropdown on outside click
const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.unit-converter')) {
        showUnits.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});

// Handle unit selection
const handleUnitClick = (unit: string) => {
    unitStore.setTargetUnit(unit);
    showUnits.value = false;
};

const refreshWindow = () => {
    window.location.reload();
}
</script>

<template>
    <section class="bottom-bar-container">
        <aside class="bottom-bar">
            <!-- REFRESH -->
            <div class="set-item add-left-pad" @click="refreshWindow">
                <ToolTipShort text="Refresh Window" placement="start-top">
                    <div class="svg-icon">
                        <img src="../../assets/SVGs/chevron-right-animate.svg" alt="Refresh" />
                    </div>
                </ToolTipShort>
            </div>
        </aside>

        <aside class="bottom-bar">
            <!-- UPDATE SOFTWARE -->
            <div class="set-item">
                <UpdateSoftware />
            </div>
            <!-- UNIT -->
            <div class="set-item unit-converter">
                <ToolTipShort text="Change Unit" placement="end-top">
                    <div class="unit-selection" @click="toggleUnits">
                        <div class="svg-icon">
                            <img src="../../assets/SVGs/ruler.svg" alt="Unit" />
                        </div>
                        <p class="current-unit">{{ unitStore.targetUnit }}</p>
                    </div>
                </ToolTipShort>

                <ul class="units" v-if="showUnits">
                    <li @click="handleUnitClick('m')">Meter</li>
                    <li @click="handleUnitClick('ft')">Feet</li>
                    <li @click="handleUnitClick('in')">Inch</li>
                    <li @click="handleUnitClick('cm')">Centimeter</li>
                    <li @click="handleUnitClick('mm')">Millimeter</li>
                    <li @click="handleUnitClick('yd')">Yard</li>
                </ul>
            </div>

            <!-- NOTIFICATION -->
            <div class="set-item add-right-pad">
                <ToolTipShort text="2 new Notifications" placement="end-top">
                    <div class="svg-icon">
                        <img src="../../assets/SVGs/notification-animate.svg" alt="Notifications" />
                    </div>
                </ToolTipShort>
            </div>
        </aside>
    </section>
</template>