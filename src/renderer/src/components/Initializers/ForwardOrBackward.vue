<template>
    <select v-model="selectedPath" @change="navigateToRoute" class="selectedPath">
        <option disabled value="">Select a route</option>
        <option v-for="route in routes" :key="route.name" :value="route.path">
            {{ route.name }}
        </option>
    </select>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const routes = router.getRoutes().filter(route => route.name) // Filter out unnamed routes
const selectedPath = ref('')

const navigateToRoute = () => {
    if (selectedPath.value) {
        router.push(selectedPath.value)
    }
}
</script>

<style scoped>
.selectedPath {
    position: fixed;
    right: 13rem;
    width: 8rem;
    height: 2rem;
    padding: 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid #3a3a3a;
    background-color: #303030;
    font-size: 1rem;
    cursor: pointer;
    -webkit-app-region: no-drag;

}
</style>