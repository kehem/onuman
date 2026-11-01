<template>
    <WelcomeLayout>
        <div class="main-screen h-vh-100 w-100 f-center f-col gap-10" role="main" aria-labelledby="tos-heading">
            <div class="onuman-logo w--150 m-t-50">
                <img src="../../assets/images/Onuman-logo-full-white.svg" alt="Onuman Logo"
                    aria-label="Onuman Software Logo">
                <p class="text-sm text-right m-t--05">DEVELOPED BY <RouterLink to="https://kehem.com"
                        aria-label="Visit Kehem IT website">KEHEM IT</RouterLink>
                </p>
            </div><br>
            <section class="onuman-tos onuman-scrollbar" ref="tosSection" @scroll="handleScroll" role="region"
                aria-label="Terms of Service Content" tabindex="0">
                <div class="tos-content">
                    <header class="f-center f-col gap-05 m-b-20">
                        <h1 class="text-xl" id="tos-heading">Onuman Software - Terms of Service</h1>
                        <p class="text-sm" aria-label="Last updated date">Last Updated: April 20, 2025</p>
                    </header>

                    <article class="f f-col gap-15">
                        <div class="tos-section">
                            <h2 class="text-lg bold" id="introduction-heading">1. Introduction</h2>
                            <p>Welcome to Onuman, a software application developed by Kehem IT, designed to facilitate
                                architectural and civil Esse sunt aliqua minim culpa sint elit dolore mollit ipsum
                                commodo cupidatat aute ad laborum. engineering estimations, including calculations for
                                pilling, beams, grills, glass, plaster, lintels, footings, floors, columns, and other
                                related components, as well as report generation. By accessing or using Onuman (the
                                "Software"), you agree to be bound by these Terms of Service ("Terms"). If you do not
                                agree to these Terms, you may not use the Software.</p>
                            <p class="m-t-05">These Terms constitute a legally binding agreement between you ("User,"
                                "you," or "your") and Kehem IT ("we," "us," or "our"). If you are using the Software on
                                behalf of a company or organization, you represent that you have the authority to bind
                                such entity to these Terms.</p>
                        </div>

                        <div class="tos-section">
                            <h2 class="text-lg bold" id="acceptance-heading">2. Acceptance of Terms</h2>
                            <p>To use the Software, you must verify a valid license key provided by Kehem IT. Upon
                                successful verification, you will be prompted to review and accept these Terms. By
                                clicking "Accept" or otherwise using the Software, you confirm that you have read,
                                understood, and agree to be bound by these Terms.</p>
                        </div>

                        <div class="tos-section">
                            <h2 class="text-lg bold" id="license-heading">3. License Grant</h2>
                            <p>Subject to your compliance with these Terms, Kehem IT grants you a limited,
                                non-exclusive, non-transferable, revocable license to use the Software solely for your
                                internal business or personal purposes related to architectural and civil engineering
                                estimations and report generation. This license does not permit you to:</p>
                            <ul class="list-disc m-l-20 m-t-05" aria-label="License restrictions">
                                <li>Modify, reverse-engineer, decompile, or disassemble the Software.</li>
                                <li>Distribute, sublicense, rent, lease, or otherwise transfer the Software to any third
                                    party.</li>
                                <li>Use the Software for any purpose not expressly permitted by these Terms.</li>
                                <li>Remove or alter any proprietary notices or labels in the Software.</li>
                            </ul>
                        </div>

                        <div class="tos-section">
                            <h2 class="text-lg bold" id="license-key-heading">4. License Key and Account</h2>
                            <ul class="list-disc m-l-20" aria-label="License key and account responsibilities">
                                <li><strong>Activation:</strong> The Software requires a valid license key for
                                    activation. You are responsible for maintaining the confidentiality of your license
                                    key and any associated account credentials.</li>
                                <li><strong>Non-Transferability:</strong> You agree not to share, transfer, or disclose
                                    your license key to any third party without our prior written consent.</li>
                                <li><strong>Responsibility:</strong> You are responsible for all activities conducted
                                    under your license key or account. Notify us immediately of any unauthorized use of
                                    your license key or account.</li>
                            </ul>
                        </div>

                        <div class="tos-section">
                            <h2 class="text-lg bold" id="ownership-heading">5. Ownership and Intellectual Property</h2>
                            <p>The Software, including all associated intellectual property rights, is owned by Kehem IT
                                or its licensors. The Software is protected by copyright, trademark, and other
                                applicable laws. These Terms do not grant you any ownership rights in the Software. You
                                may not use Kehem IT’s trademarks, logos, or other brand features without prior written
                                permission.</p>
                        </div>

                        <div class="tos-section">
                            <h2 class="text-lg bold" id="responsibilities-heading">6. User Responsibilities</h2>
                            <p>You agree to:</p>
                            <ul class="list-disc m-l-20 m-t-05" aria-label="User responsibilities">
                                <li>Use the Software in compliance with all applicable laws and regulations.</li>
                                <li>Provide accurate information during registration or license activation.</li>
                                <li>Not use the Software to perform calculations or generate reports for unlawful
                                    purposes.</li>
                                <li>Ensure the accuracy of input data, as the Software’s outputs depend on the data
                                    provided.</li>
                            </ul>
                        </div>

                        <div class="tos-section">
                            <h2 class="text-lg bold" id="warranties-heading">7. Disclaimer of Warranties</h2>
                            <p>The Software is provided "as is" and "as available" without warranties of any kind,
                                whether express or implied, including but not limited to warranties of merchantability,
                                fitness for a particular purpose, or non-infringement. Kehem IT does not warrant that
                                the Software will meet your requirements, operate without interruption, or be
                                error-free. You assume all risks associated with the use of the Software, including the
                                accuracy of calculations and reports generated.</p>
                        </div>

                        <div class="tos-section">
                            <h2 class="text-lg bold" id="liability-heading">8. Limitation of Liability</h2>
                            <p>To the maximum extent permitted by law, Kehem IT and its affiliates, officers, directors,
                                employees, or agents shall not be liable for any indirect, incidental, special,
                                consequential, or punitive damages, including but not limited to loss of profits, data,
                                or use, arising out of or in connection with your use of the Software. In no event shall
                                Kehem IT’s total liability exceed the amount paid by you for the Software license.</p>
                        </div>

                        <div class="tos-section">
                            <h2 class="text-lg bold" id="termination-heading">9. Termination</h2>
                            <p>We may terminate or suspend your license to use the Software at any time, with or without
                                notice, if you breach these Terms. Upon termination, you must cease all use of the
                                Software and destroy any copies in your possession. Sections 5, 7, 8, 10, and 11 shall
                                survive termination.</p>
                        </div>

                        <div class="tos-section">
                            <h2 class="text-lg bold" id="governing-law-heading">10. Governing Law and Dispute Resolution
                            </h2>
                            <p>These Terms shall be governed by and construed in accordance with the laws of Delaware,
                                USA, without regard to its conflict of law principles. Any disputes arising under these
                                Terms shall be resolved exclusively in the state or federal courts located in
                                Wilmington, Delaware. You agree to submit to the personal jurisdiction of such courts.
                            </p>
                        </div>

                        <div class="tos-section">
                            <h2 class="text-lg bold" id="changes-heading">11. Changes to Terms</h2>
                            <p>We may update these Terms from time to time. If we make material changes, we will notify
                                you via email or through the Software prior to the effective date of the changes. Your
                                continued use of the Software after the effective date constitutes your acceptance of
                                the updated Terms.</p>
                        </div>

                        <div class="tos-section">
                            <h2 class="text-lg bold" id="contact-heading">12. Contact Information</h2>
                            <div class="contact-box m-t-10">
                                <p>If you have questions about these Terms or the Software, please contact us at:</p>
                                <p class="m-t-05"><strong>Kehem IT</strong></p>
                                <p>Email: <a href="mailto:support@kehem.com" class="text-link"
                                        aria-label="Email Kehem IT support">support@kehem.com</a></p>
                                <p>Website: <a href="https://kehem.com" target="_blank" class="text-link"
                                        aria-label="Visit Kehem IT website">https://kehem.com</a></p>
                            </div>
                        </div>

                        <div class="tos-section">
                            <p>By using Onuman, you acknowledge that you have read, understood, and agree to be bound by
                                these Terms of Service.</p>
                        </div>
                    </article>
                </div>
            </section>
            <div class="w-90 text-right">
                <button type="button" class="btn" :class="{ 'btn-primary': isTosRead, 'btn-secondary': !isTosRead }"
                    :disabled="!isTosRead" @click="handleNext" aria-label="Proceed to next step"
                    :aria-disabled="!isTosRead" tabindex="0">
                    Next
                </button>
            </div>
        </div>
    </WelcomeLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import WelcomeLayout from '../../layouts/WelcomeLayout.vue';
import { RouterLink, useRouter } from 'vue-router';

const tosSection = ref<HTMLElement | null>(null);
const isTosRead = ref(false);

const handleScroll = () => {
    if (!tosSection.value) return;

    const { scrollTop, scrollHeight, clientHeight } = tosSection.value;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
        isTosRead.value = true;
    }
};

const router = useRouter();
const handleNext = () => {
    router.push("/CompanyInfo");
};
</script>