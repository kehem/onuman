<!-- src/layouts/DefaultLayouts.vue -->
<template>
    <header class="ios-header layout-bg border-bottom">
        <NavBars />
        <Search />
        <Controls />
        <!-- <ForwardOrBackward /> -->
        <TABS />
    </header>
    <main class="main dashboard-main">

        <!-- TAB CONTENT AREA -->
        <slot />
    </main>
</template>

<script setup lang="ts">
import Controls from '../components/Initializers/Controls.vue'
// import ForwardOrBackward from '../components/Initializers/ForwardOrBackward.vue'
import NavBars from '../components/Initializers/Navbars.vue'
import Search from '../components/Initializers/Search.vue'
import TABS from '../components/Dashboard/TABS.vue'
</script>

<style scoped lang="scss">
.ios-header {
    height: 2.2rem;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    gap: 1rem;
    -webkit-app-region: drag;
}
</style>