<!-- layouts/WelcomeLayout.vue -->
<template>
    <div :class="$attrs.class">
        <header class="ios-header layout-bg border-bottom">
            <div class="text-nowrap text-s f-center gap-05">
                <div class="onuman-icon">
                    <img src="../assets/images/Onuman-logo.svg" alt="Onuman Logo">
                </div>
                <b>Onuman</b>
            </div>

            <!-- <ForwardOrBackward /> -->
            <Controls />
        </header>
        <main class="main">
            <slot />
        </main>
    </div>
</template>

<script setup lang="ts">
import Controls from '../components/Initializers/Controls.vue';
// import ForwardOrBackward from '../components/Initializers/ForwardOrBackward.vue';

// Prevent automatic attribute inheritance since we're manually handling it
defineOptions({
    inheritAttrs: false
})
</script>

<style scoped lang="scss">
@use "../assets/styles/variables/_index.scss" as *;

.ios-header {
    height: 2rem;
    width: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 5;
    margin-bottom: 2rem;
    -webkit-app-region: drag;
}
</style>