<template>
    <DefaultLayouts>
        <div class="notfound__primary-container">
            <div class="notfound__content-wrapper">
                <!-- <h1 class="notfound__page-heded">404</h1> -->
                <h1 class="notfound__page-title">Not Found</h1>
                <p>
                    This page currently not available. Contact KEHEM IT
                </p>
                <div class="notfound__button-group">
                    <button type="button" class="dashboard-button1" @click="goBack">
                        <span class="button-text"><i class="m-chevron-left"></i> Go Back</span>
                        <span class="button-hover-effect"></span>
                    </button>
                    <button type="button" class="dashboard-button" @click="goToDashboard">
                        <span class="button-text"><i class="m-chevron-right"></i> Go to Dashboard</span>
                        <span class="button-hover-effect"></span>
                    </button>
                </div>
            </div>
        </div>
        <BottomBar />
    </DefaultLayouts>
</template>

<script setup lang="ts">
import DefaultLayouts from '../../layouts/DefaultLayouts.vue';
import BottomBar from '../../components/Dashboard/BottomBar.vue';
import { useRouter } from 'vue-router'

const router = useRouter()

const goToDashboard = () => {
    router.push({ name: 'Dashboard' })
}

const goBack = () => {
    if (window.history.length > 1) {
        router.go(-1)
    } else {
        router.push({ name: 'Dashboard' })
    }
}
console.log(router.currentRoute.value.fullPath);

</script>
