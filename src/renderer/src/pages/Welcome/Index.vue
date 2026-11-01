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
import { onMounted, ref } from 'vue';

const { showToast } = useToast()
const router = useRouter();
const isLoading = ref(true);


const fetchData = async () => {

    try {
        const res = await get('/api/license');

        // Check if response and data exist
        if (!res || !res) {
            throw new Error('Invalid response from server');
        }

        await setOrganization('organization', res);

        // Get both license key and serial ID
        const licenseKey = await window.electronAPI.getLicenseKey();
        const serialId = await window.electronAPI.getMotherboardID();

        // Your stated logic: both license key and serial ID are required
        if (!licenseKey || !serialId) {
            showToast('error', 'License key or Serial ID missing. Please enter license information.');
            router.push('/license');
            return;
        }

        // If both exist, check the API response for license validity
        if (res.license === false) {
            showToast('error', 'License expired or invalid. Please contact support.');
            router.push('/license');
        } else {
            showToast('success', 'License verified successfully!');
            router.push('/dashboard');
        }

    } catch (err: any) {
        console.error('API Error Details:', err);

        // Check if error response exists
        if (err.response) {
            console.log('Error Response Status:', err.response.status);
            console.log('Error Response Data:', err.response);

            const errorData = err.response;

            // Handle specific API error responses
            if (errorData) {
                if (errorData.license === false) {
                    showToast('error', 'License not found. Please contact support.');
                    router.push('/license');
                } else if (errorData.org === false) {
                    showToast('error', 'Organization not found. Please contact support.', 'infinite');
                    router.push('/CompanyInfo');
                } else if (errorData.employee === false) {
                    showToast('error', 'Employee does not exist', 'infinite');
                    router.push('/CompanyInfo');
                } else if (errorData.access === false) {
                    showToast('error', 'Access Denied. Contact your administration', 'infinite');
                }
            } else {
                showToast('error', `Server error: ${err.response.status}`);
            }
        } else if (err.request) {
            // Network error
            console.error('Network error - no response received');
            showToast('error', 'Network error. Please check your connection.');
        } else {
            // Other errors
            console.error('Request setup error:', err.message);
            showToast('error', 'Request failed. Please try again.');
        }

        // On any error, redirect to license page as fallback
        router.push('/license');
    } finally {
        isLoading.value = false;
    }
}

onMounted(async () => {
    setTimeout(() => {
        fetchData();
    }, 5000);
});
</script>
