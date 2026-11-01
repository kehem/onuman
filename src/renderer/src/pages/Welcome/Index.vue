<!-- src/pages/Welcome/Index.vue -->
<template>
    <WelcomeLayout class="d-block relative">
        <section class="f-center h-vh-100">
            <div class="abs-center" ref="welcomeLoading">
                <h1 class="text-center animate-top-bottom">Welcome to</h1><br>
                <div class="onuman-logo w--150">
                    <img src="../../assets/images/Onuman-logo-full-white.svg" alt="Onuman Logo">
                </div>
                <div class="welcome-loader"></div>
            </div>
        </section>
    </WelcomeLayout>
</template>

<script setup lang="ts">
import WelcomeLayout from '../../layouts/WelcomeLayout.vue';
import { useApi } from '../../composables/useApi';
const { get } = useApi()
import { useElectronStore } from '../../composables/electronStore';
const { set: setOrganization } = useElectronStore()
import { useToast } from '../../composables/Toast'
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { checkStartupLicense } from '../../composables/checkStartupLicense';

const { showToast } = useToast()
const router = useRouter();
const fetchData = async () => {
    try {
        const result = await checkStartupLicense(
            () => window.electronAPI.getLicenseKey(),
            () => window.electronAPI.getMotherboardID(),
            () => get('/api/license')
        );
        if (result.status === 'missing-license') {
            await router.replace('/license');
        } else if (result.status === 'missing-serial') {
            showToast('error', 'Could not retrieve this device’s serial ID. Please contact support.');
            await router.replace('/license');
        } else {
            await setOrganization('organization', result.data);
            if (result.data.license === false) {
                showToast('error', 'License expired or invalid. Please contact support.');
                await router.replace('/license');
            } else {
                await router.replace('/dashboard');
            }
        }
    } catch (err: any) {
        console.error('License check failed:', err);
        const errorData = err.response?.data;
        if (errorData?.license === false) {
            showToast('error', 'License expired or invalid. Please contact support.');
            await router.replace('/license');
        } else if (errorData?.org === false || errorData?.employee === false) {
            showToast('error', 'Please complete your organization information.');
            await router.replace('/CompanyInfo');
        } else {
            showToast('error', errorData?.access === false
                ? 'Access denied. Please contact your administrator.'
                : err.response
                ? 'Unable to verify your license. Please try again or contact support.'
                : 'Unable to reach the license server. Please check your connection.');
            await router.replace('/license');
        }
    }
}

onMounted(fetchData);
</script>
