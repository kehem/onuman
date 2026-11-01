<!-- src/pages/Welcome/CompanyInfo.vue -->
<template>
    <WelcomeLayout>
        <form class="main-screen h-100 w-100 f-start-center f-col gap-10" @submit.prevent="submitForm">
            <div class="onuman-logo w--100 m-t-50">
                <img src="../../assets/images/Onuman-logo-full-white.svg" alt="Onuman Logo">
            </div><br>
            <section class="f gap-10 two-column">
                <!-- COMPANY INFORMATION -->
                <aside class="company-info columned" v-if="!hasCompanyData">
                    <div class="company-info-warning">
                        <Tooltip class="info-tooltip"
                            content="Further you cannot change the company information. So carefully fill the inputs"
                            position="right" id="company-name-tooltip"><i class="m-info3"></i>
                        </Tooltip>
                    </div><br>

                    <div class="onuman-input-box">
                        <label for="company-name-input">Company Name</label>
                        <Tooltip content="Enter the legal name of your company" position="top">
                            <input type="text" id="company-name-input" name="companyName" class="onuman-input2"
                                placeholder="Enter your company name" v-model="companyName">
                        </Tooltip>
                        <span v-if="companyNameError" class="red">
                            {{ companyNameError }}
                        </span>
                    </div>
                    <div class="onuman-input-box">
                        <label for="company-name-input">Website/Slogan</label>
                        <Tooltip content="Enter the website or Slogan" position="top">
                            <input type="text" id="company-name-input" name="webOrSlogan" class="onuman-input2"
                                placeholder="Enter your website or Slogan" v-model="webOrSlogan">
                        </Tooltip>
                        <span v-if="webOrSloganError" class="red">
                            {{ webOrSloganError }}
                        </span>
                    </div>
                    <!-- ADDRESS -->
                    <div class="onuman-input-box">
                        <fieldset>
                            <legend>Office Address</legend>
                            <div class="auto-options-3-cols">
                                <!-- COUNTRY COMBOBOX -->
                                <div class="combobox-wrapper">
                                    <Tooltip content="Select the country of your office" position="top">
                                        <OnumanCombobox id="onuman-combobox-country" name="country"
                                            :options="countryOptions" placeholder="Select Country"
                                            v-model:selected="selectedCountry" />
                                    </Tooltip>
                                    <span v-if="countryError" class="red">
                                        {{ countryError }}
                                    </span>
                                </div>
                                <!-- STATE COMBOBOX -->
                                <div class="combobox-wrapper">
                                    <Tooltip content="Select the state or division or province" position="top">
                                        <OnumanCombobox id="onuman-combobox-state" name="state" :options="stateOptions"
                                            placeholder="Select State" :disabled="!selectedCountry"
                                            v-model:selected="selectedState" />
                                    </Tooltip>
                                    <span v-if="stateError" class="red">
                                        {{ stateError }}
                                    </span>
                                </div>
                                <!-- CITY COMBOBOX -->
                                <div class="combobox-wrapper">
                                    <Tooltip content="Select the city or district" position="top">
                                        <OnumanCombobox id="onuman-combobox-city" name="city" :options="cityOptions"
                                            placeholder="Select City" :disabled="!selectedState"
                                            v-model:selected="selectedCity" />
                                    </Tooltip>
                                    <span v-if="cityError" class="red">
                                        {{ cityError }}
                                    </span>
                                </div>
                            </div><br>
                            <div class="address-inputs g-res-3-col-container gap-10">
                                <input type="text" id="address-line-input" name="addressLine"
                                    class="onuman-input2 span-2" placeholder="Ex: Region, Building, Floor, Shop no."
                                    v-model="addressLine" />
                                <span v-if="addressLineError" class="red">
                                    {{ addressLineError }}
                                </span>
                                <input type="text" id="zip-code-input" name="zipCode" class="onuman-input2"
                                    placeholder="ZIP Code" v-model="zipCode" />
                                <span v-if="zipCodeError" class="red">
                                    {{ zipCodeError }}
                                </span>
                            </div>
                        </fieldset>
                    </div>
                    <!-- TRADE LICENSE -->
                    <div class="onuman-input-box">
                        <label for="company-trade-license-input">
                            Trade License No.
                        </label>
                        <Tooltip content="Enter the local authorization number. Ex: TIN/EIN/BIN" position="top">
                            <input v-model="tradeLicense" type="text" id="company-trade-license-input"
                                name="tradeLicense" class="onuman-input2" placeholder="Enter your trade license number"
                                maxlength="18" />
                        </Tooltip>
                        <p v-if="errorMessage" class="red">{{ errorMessage }}</p>
                    </div>
                    <!-- OFFICE PHONE NUMBER -->
                    <div class="onuman-input-box">
                        <label for="office-phone-number-input">Office Phone No.</label>
                        <input type="text" id="office-phone-number-input" name="phoneNumber" class="onuman-input2"
                            v-model="officePhoneNumber" placeholder="+1-123-456-7890" maxlength="17"
                            @input="formatPhoneNumber(officePhoneNumber)" />
                        <span v-if="!isValidPhone && officePhoneNumber" class="red">
                            Please enter a valid phone number (e.g., +1-123-456-7890)
                        </span>
                        <span v-if="officePhoneNumberError" class="red">
                            {{ officePhoneNumberError }}
                        </span>
                    </div>
                    <!-- OFFICE EMAIL ADDRESS -->
                    <div class="onuman-input-box">
                        <label for="office-email-address-input">Office Email Address</label>
                        <input type="text" id="office-email-address-input" name="emailAddress" class="onuman-input2"
                            v-model="officeEmailAddress" placeholder="yourname@domain.com" maxlength="100" />
                        <span v-if="!isValidEmail && officeEmailAddress" class="red">
                            Please enter a valid email address (e.g., yourname@domain.com)
                        </span>
                        <span v-if="officeEmailAddressError" class="red">
                            {{ officeEmailAddressError }}
                        </span>
                    </div>

                    <!-- COMPANY LOGO -->
                    <div class="support-image onuman-input-box">
                        <!-- UPLOAD PROGRESS -->
                        <div v-if="isCompanyUploading" class="upload-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: companyUploadProgress + '%' }"></div>
                            </div>
                            <span class="progress-text">{{ companyUploadProgress }}%</span>
                        </div>

                        <!-- UPLOADING ANIMATION -->
                        <div v-if="isCompanyUploading" class="uploading-indicator">
                            <div class="uploading-spinner"></div>
                            <span>Uploading...</span>
                        </div>

                        <!-- PREVIEW -->
                        <div class="support-image-preview" v-if="companyImageURL && !isCompanyUploading">
                            <img :src="companyImageURL" alt="Company Logo" loading="lazy" />
                            <button type="button" class="remove-image" @click="removeCompanyImage"><i
                                    class="m-cross1"></i></button>
                        </div>
                        <!-- INPUT FILE -->
                        <div class="upload-wrapper" v-if="!companyImageURL || isCompanyUploading">
                            <label for="company-logo" class="upload-label" :class="{ disabled: isCompanyUploading }">
                                <span v-if="!isCompanyUploading">Company Logo</span>
                            </label>
                            <input type="file" id="company-logo" name="company-logo" @change="handleCompanyFileChange"
                                :disabled="isCompanyUploading" />
                        </div>

                        <span v-if="companyLogoError" class="red">
                            {{ companyLogoError }}
                        </span>
                    </div>
                </aside>
                <aside class="company-info columned" v-if="hasCompanyData">
                    <div class="existing-company-info">
                        <h3><i class="m-office"></i><br> Company Name: <br>{{ companyName }}</h3>
                        <h4><i class="m-location3"></i><br> Office Address: <br>{{ addressLine }}-{{ zipCode }},{{
                            selectedCountry }}</h4>
                        <h4><i class="m-document"></i><br> Trade License: <br>{{ tradeLicense }}</h4>
                        <h4><i class="m-phone"></i><br> Office Phone: <br>{{ officePhoneNumber }}</h4>
                        <h4><i class="m-email"></i><br> Office Email: <br>{{ officeEmailAddress }}</h4>
                    </div>
                </aside>

                <!-- EMPLOYEE INFORMATION -->
                <aside class="employee-info columned">
                    <h3>Employee Information</h3>
                    <hr>

                    <!-- YOUR NAME -->
                    <div class="onuman-input-box">
                        <label for="employee-name-input">Your Name</label>
                        <input type="text" id="employee-name-input" name="employeeName" class="onuman-input2"
                            placeholder="Enter your name" v-model="employeeName" maxlength="200">
                        <span v-if="employeeNameError" class="red">{{ employeeNameError }}</span>
                    </div>

                    <!-- YOUR DESIGNATION -->
                    <div class="onuman-input-box">
                        <label for="employee-designation-input">Your Designation</label>
                        <input type="text" id="employee-designation-input" name="employeeDesignation"
                            class="onuman-input2" placeholder="Enter your designation" v-model="employeeDesignation"
                            maxlength="200">
                        <span v-if="employeeDesignationError" class="red">{{ employeeDesignationError }}</span>
                    </div>

                    <!-- EMPLOYEE ID -->
                    <div class="onuman-input-box">
                        <label for="employee-id-input">Employee ID</label>
                        <input type="text" id="employee-id-input" name="employeeId" class="onuman-input2"
                            placeholder="Enter your employee ID" v-model="employeeId" maxlength="200">
                        <span v-if="employeeIdError" class="red">{{ employeeIdError }}</span>
                    </div>

                    <!-- YOUR PHONE NO. -->
                    <div class="onuman-input-box">
                        <label for="employee-phone-input">Your Phone No.</label>
                        <input type="tel" id="employee-phone-input" name="employeePhone" class="onuman-input2"
                            placeholder="+1-123-456-7890" v-model="employeePhone" maxlength="17"
                            @input="formatEmployeePhoneNumber(employeePhone)">
                        <span v-if="!isEmployeePhoneValid && employeePhone" class="red">
                            Please enter a valid phone number (e.g., +1-123-456-7890)
                        </span>
                        <span v-if="employeePhoneError" class="red">{{ employeePhoneError }}</span>
                    </div>

                    <!-- YOUR EMAIL ADDRESS -->
                    <div class="onuman-input-box">
                        <label for="employee-email-input">Your Email Address</label>
                        <input type="email" id="employee-email-input" name="employeeEmail" class="onuman-input2"
                            placeholder="yourname@domain.com" v-model="employeeEmail" maxlength="200">
                        <span v-if="!isEmployeeEmailValid && employeeEmail" class="red">
                            Please enter a valid email address (e.g., yourname@domain.com)
                        </span>
                        <span v-if="employeeEmailError" class="red">{{ employeeEmailError }}</span>
                    </div>

                    <!-- EMPLOYEE PROFILE PICTURE -->
                    <div class="support-image onuman-input-box alingned-centere">

                        <!-- INPUT FILE -->
                        <div class="upload-wrapper">
                            <label for="employee-photo" class="upload-label" :class="{ disabled: isEmployeeUploading }">
                                <span v-if="!isEmployeeUploading">Profile Picture</span>
                            </label>
                            <input type="file" id="employee-photo" name="employee-photo"
                                @change="handleEmployeeFileChange" :disabled="isEmployeeUploading" />
                        </div>
                        <div>
                            <!-- UPLOAD PROGRESS -->
                            <div v-if="isEmployeeUploading" class="upload-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" :style="{ width: employeeUploadProgress + '%' }"></div>
                                </div>
                                <span class="progress-text">{{ employeeUploadProgress }}%</span>
                            </div>

                            <!-- UPLOADING ANIMATION -->
                            <div v-if="isEmployeeUploading" class="uploading-indicator">
                                <div class="uploading-spinner"></div>
                                <span>Uploading...</span>
                            </div>

                            <!-- PREVIEW -->
                            <div class="support-image-preview xdgg3546t"
                                v-if="employeeImageURL && !isEmployeeUploading">
                                <img :src="employeeImageURL" alt="Profile Picture" loading="lazy" />
                                <button type="button" class="remove-image" @click="removeEmployeeImage"><i
                                        class="m-cross1"></i></button>
                            </div>
                        </div>
                        <span v-if="employeeLogoError" class="red">
                            {{ employeeLogoError }}
                        </span>
                    </div>
                </aside>
            </section>
            <div class="w-95 f-end-center">
                <button type="submit" class="btn btn-primary m-b-30 w--100 float-right">
                    {{ loading ? 'Submitting...' : 'Submit' }}
                </button>
            </div>
        </form>
    </WelcomeLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import WelcomeLayout from '../../layouts/WelcomeLayout.vue'
import locationData from '../../assets/jsons/countryStateCity.json'
import OnumanCombobox from '../../components/Initializers/OnumanCombobox.vue'
import Tooltip from '../../components/Initializers/ToolTip.vue'
import { useValidators } from '../../composables/useValidators'
import type { SystemInfo } from '../../composables/SystemInfo'
import { useApi } from '../../composables/useApi'
import { useToast } from '../../composables/Toast'
import { useRouter } from 'vue-router'
import { useImageUploader } from '../../composables/useImageUploader'

// INTERFACES
interface City {
    name: string
}

interface State {
    name: string
    cities: City[]
}

interface Country {
    name: string
    states: State[]
}

interface Company {
    id: number
    companyName: string
    webOrSlogan: string
    Logo: string
    country: string
    state: string
    city: string
    addressLine: string
    zipCode: string
    tradeLicense: string
    phoneNumber: string
    emailAddress: string
    created_at: string
    license_key: number
}

interface OrgData {
    companies: Company[]
}

// COMPOSABLES
const { get, post } = useApi()
const { showToast } = useToast()
const router = useRouter()
const { usePhoneValidator, useEmailValidator, useTradeLicenseValidator } = useValidators()

// SEPARATE IMAGE UPLOADERS FOR COMPANY AND EMPLOYEE
const {
    handleFileChange: handleCompanyFileChange,
    isUploading: isCompanyUploading,
    uploadProgress: companyUploadProgress,
    imageURL: companyImageURL,
} = useImageUploader()

const {
    handleFileChange: handleEmployeeFileChange,
    isUploading: isEmployeeUploading,
    uploadProgress: employeeUploadProgress,
    imageURL: employeeImageURL,
} = useImageUploader()


// STATE - FORM STATUS
const loading = ref(false)
const hasErrors = ref(false)
const hasCompanyData = ref(false)

// STATE - LOCATION DATA
const locations = ref<Country[]>(locationData as Country[])
const error = ref<string | null>(null)
const selectedCountry = ref('')
const selectedState = ref('')
const selectedCity = ref('')

// STATE - COMPANY FIELDS
const companyName = ref('')
const companyNameError = ref('')
const webOrSlogan = ref('')
const webOrSloganError = ref('')
const countryError = ref('')
const stateError = ref('')
const cityError = ref('')
const addressLine = ref('')
const addressLineError = ref('')
const zipCode = ref('')
const zipCodeError = ref('')
const companyLogoError = ref('')
const officePhoneNumber = ref('')
const officePhoneNumberError = ref('')
const officeEmailAddress = ref('')
const officeEmailAddressError = ref('')
const tradeLicense = ref('')

// STATE - EMPLOYEE FIELDS
const employeeName = ref('')
const employeeNameError = ref('')
const employeeDesignation = ref('')
const employeeDesignationError = ref('')
const employeeId = ref('')
const employeeIdError = ref('')
const employeePhone = ref('')
const employeePhoneError = ref('')
const employeeEmail = ref('')
const employeeEmailError = ref('')
const employeeLogoError = ref('')

// STATE - SYSTEM INFO
const systemInfo = ref<SystemInfo | null>(null)
const serialNumber = ref('Not fetched')
const retrievedKey = ref('')

// STATE - API DATA
const getOrgData = ref<OrgData>({ companies: [] })

// VALIDATION COMPOSABLES
const { isValidPhone, formatPhoneNumber } = usePhoneValidator(officePhoneNumber)
const { isValidEmail } = useEmailValidator(officeEmailAddress)
const { errorMessage } = useTradeLicenseValidator(tradeLicense)
const { isValidPhone: isEmployeePhoneValid, formatPhoneNumber: formatEmployeePhoneNumber } = usePhoneValidator(employeePhone)
const { isValidEmail: isEmployeeEmailValid } = useEmailValidator(employeeEmail)

// COMPUTED - LOCATION OPTIONS
const countryOptions = computed(() => locations.value.map((country) => country.name).sort())

const stateOptions = computed(() => {
    const country = locations.value.find((c) => c.name === selectedCountry.value)
    return country ? country.states.map((state) => state.name).sort() : []
})

const cityOptions = computed(() => {
    const country = locations.value.find((c) => c.name === selectedCountry.value)
    const state = country?.states.find((s) => s.name === selectedState.value)
    return state ? state.cities.map((city) => city.name).sort() : []
})

// WATCHERS
watch(selectedCountry, () => {
    selectedState.value = ''
    selectedCity.value = ''
})

watch(selectedState, () => {
    selectedCity.value = ''
})

// INITIALIZATION FUNCTIONS
const validateLocationData = () => {
    if (!locationData || !Array.isArray(locationData)) {
        error.value = 'FAILED TO LOAD OR PARSE COUNTRY-STATE-CITY.JSON'
    }
}

const loadSavedFormData = () => {
    const savedData = localStorage.getItem('companyFormData')
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData)
            if (!hasCompanyData.value) {
                companyName.value = parsedData.company?.companyName || ''
                webOrSlogan.value = parsedData.company?.webOrSlogan || ''
                selectedCountry.value = parsedData.company?.country || ''
                selectedState.value = parsedData.company?.state || ''
                selectedCity.value = parsedData.company?.city || ''
                addressLine.value = parsedData.company?.addressLine || ''
                zipCode.value = parsedData.company?.zipCode || ''
                tradeLicense.value = parsedData.company?.tradeLicense || ''
                officePhoneNumber.value = parsedData.company?.phoneNumber || ''
                officeEmailAddress.value = parsedData.company?.emailAddress || ''
            }
            employeeName.value = parsedData.employee?.employeeName || ''
            employeeDesignation.value = parsedData.employee?.employeeDesignation || ''
            employeeId.value = parsedData.employee?.employeeId || ''
            employeePhone.value = parsedData.employee?.employeePhone || ''
            employeeEmail.value = parsedData.employee?.employeeEmail || ''
        } catch (e) {
            showToast('error', 'ERROR PARSING SAVED FORM DATA:')
        }
    }
}

// SYSTEM INFO FUNCTIONS
const fetchSystemInfo = async () => {
    try {
        systemInfo.value = await window.electronAPI.getSystemInfo()
    } catch (error) {
        console.error('FAILED TO FETCH SYSTEM INFO:', error)
    }
}

const fetchSerialNumber = async () => {
    try {
        serialNumber.value = await window.electronAPI.getMotherboardID()
    } catch (error) {
        console.error('ERROR FETCHING MOTHERBOARD SERIAL:', error)
        serialNumber.value = 'FAILED TO FETCH'
    }
}

const retrieveLicenseKey = async () => {
    try {
        retrievedKey.value = await window.electronAPI.getLicenseKey()
    } catch (error) {
        console.error('FAILED TO RETRIEVE LICENSE KEY:', error)
        retrievedKey.value = 'FAILED TO RETRIEVE LICENSE KEY'
        showToast('error', "YOU HAVEN'T ANY LICENSE KEY")
    }
}

// API FUNCTIONS
const getDefaultData = async () => {
    try {
        const response = await get(`/api/get_org/${retrievedKey.value}`)
        getOrgData.value = { companies: response }
        hasErrors.value = false

        if (getOrgData.value.companies.length > 0) {
            hasCompanyData.value = true
            const company = getOrgData.value.companies[0]
            companyName.value = company.companyName || ''
            webOrSlogan.value = company.webOrSlogan || ''
            selectedCountry.value = company.country || ''
            selectedState.value = company.state || ''
            selectedCity.value = company.city || ''
            addressLine.value = company.addressLine || ''
            zipCode.value = company.zipCode || ''
            tradeLicense.value = company.tradeLicense || ''
            officePhoneNumber.value = company.phoneNumber || ''
            officeEmailAddress.value = company.emailAddress || ''
        }
    } catch (error) {
        console.error('FAILED TO FETCH DEFAULT DATA:', error)
        showToast('error', 'FAILED TO LOAD DEFAULT ORGANIZATION DATA', 5000, 'right-bottom')
    }
}

// VALIDATION FUNCTIONS
const resetErrors = () => {
    hasErrors.value = false
    companyNameError.value = ''
    webOrSloganError.value = ''
    countryError.value = ''
    stateError.value = ''
    cityError.value = ''
    addressLineError.value = ''
    zipCodeError.value = ''
    officePhoneNumberError.value = ''
    officeEmailAddressError.value = ''
    companyLogoError.value = ''
    employeeNameError.value = ''
    employeeDesignationError.value = ''
    employeeIdError.value = ''
    employeePhoneError.value = ''
    employeeEmailError.value = ''
    employeeLogoError.value = ''
}

const validateCompanyFields = () => {
    if (hasCompanyData.value) return

    if (!companyName.value.trim()) {
        companyNameError.value = 'COMPANY NAME IS REQUIRED'
        hasErrors.value = true
    }
    if (!webOrSlogan.value.trim()) {
        webOrSloganError.value = 'COMPANY WEBSITE/SLOGAN IS REQUIRED'
        hasErrors.value = true
    }
    if (!selectedCountry.value) {
        countryError.value = 'COUNTRY IS REQUIRED'
        hasErrors.value = true
    }
    if (!selectedState.value) {
        stateError.value = 'STATE IS REQUIRED'
        hasErrors.value = true
    }
    if (!selectedCity.value) {
        cityError.value = 'CITY IS REQUIRED'
        hasErrors.value = true
    }
    if (!addressLine.value.trim()) {
        addressLineError.value = 'ADDRESS LINE IS REQUIRED'
        hasErrors.value = true
    }
    if (!zipCode.value.trim()) {
        zipCodeError.value = 'ZIP CODE IS REQUIRED'
        hasErrors.value = true
    }
    if (!officePhoneNumber.value) {
        officePhoneNumberError.value = 'OFFICE PHONE NUMBER IS REQUIRED'
        hasErrors.value = true
    } else if (!isValidPhone.value) {
        officePhoneNumberError.value = 'ENTER A VALID PHONE NUMBER (E.G., +1-123-456-7890)'
        hasErrors.value = true
    }
    if (!officeEmailAddress.value.trim()) {
        officeEmailAddressError.value = 'OFFICE EMAIL ADDRESS IS REQUIRED'
        hasErrors.value = true
    } else if (!isValidEmail.value) {
        officeEmailAddressError.value = 'ENTER A VALID EMAIL ADDRESS'
        hasErrors.value = true
    }
    if (!tradeLicense.value.trim()) {
        errorMessage.value = 'TRADE LICENSE IS REQUIRED'
        hasErrors.value = true
    } else if (errorMessage.value) {
        hasErrors.value = true
    }
    if (!companyImageURL.value) {
        companyLogoError.value = 'COMPANY LOGO IS REQUIRED'
        hasErrors.value = true
    }
}

const validateEmployeeFields = () => {
    if (!employeeName.value.trim()) {
        employeeNameError.value = 'EMPLOYEE NAME IS REQUIRED'
        hasErrors.value = true
    }
    if (!employeeDesignation.value.trim()) {
        employeeDesignationError.value = 'DESIGNATION IS REQUIRED'
        hasErrors.value = true
    }
    if (!employeeId.value.trim()) {
        employeeIdError.value = 'EMPLOYEE ID IS REQUIRED'
        hasErrors.value = true
    }
    if (!employeePhone.value) {
        employeePhoneError.value = 'PHONE NUMBER IS REQUIRED'
        hasErrors.value = true
    } else if (!isEmployeePhoneValid.value) {
        employeePhoneError.value = 'ENTER A VALID PHONE NUMBER (E.G., +1-123-456-7890)'
        hasErrors.value = true
    }
    if (!employeeEmail.value.trim()) {
        employeeEmailError.value = 'EMAIL ADDRESS IS REQUIRED'
        hasErrors.value = true
    } else if (!isEmployeeEmailValid.value) {
        employeeEmailError.value = 'ENTER A VALID EMAIL ADDRESS'
        hasErrors.value = true
    }
    if (!employeeImageURL.value) {
        employeeLogoError.value = 'PROFILE PICTURE IS REQUIRED'
        hasErrors.value = true
    }
}

const validateLicenseKey = () => {
    if (!retrievedKey.value || retrievedKey.value === 'NO VALID LICENSE KEY FOUND' || retrievedKey.value === 'FAILED TO RETRIEVE LICENSE KEY') {
        showToast('error', 'A VALID LICENSE KEY IS REQUIRED', 5000, 'right-bottom')
        hasErrors.value = true
    }
}

// IMAGE HANDLING FUNCTIONS
const removeCompanyImage = () => {
    companyImageURL.value = ''
}

const removeEmployeeImage = () => {
    employeeImageURL.value = ''
}

// FORM SUBMISSION FUNCTIONS
const saveToLocalStorage = () => {
    try {
        const storageData = {
            company: hasCompanyData.value ? {} : {
                companyName: companyName.value,
                webOrSlogan: webOrSlogan.value,
                country: selectedCountry.value,
                state: selectedState.value,
                city: selectedCity.value,
                addressLine: addressLine.value,
                zipCode: zipCode.value,
                tradeLicense: tradeLicense.value,
                phoneNumber: officePhoneNumber.value,
                emailAddress: officeEmailAddress.value,
            },
            employee: {
                employeeName: employeeName.value,
                employeeDesignation: employeeDesignation.value,
                employeeId: employeeId.value,
                employeePhone: employeePhone.value,
                employeeEmail: employeeEmail.value,
            },
        }
        localStorage.setItem('companyFormData', JSON.stringify(storageData))
    } catch (e) {
        console.error('ERROR SAVING TO LOCALSTORAGE:', e)
    }
}
const prepareFormData = () => {
    const formData = new FormData()

    if (!hasCompanyData.value) {
        formData.append('companyName', companyName.value)
        formData.append('webOrSlogan', webOrSlogan.value)
        formData.append('addressLine', addressLine.value)
        formData.append('zipCode', zipCode.value)
        formData.append('phoneNumber', officePhoneNumber.value)
        formData.append('tradeLicense', tradeLicense.value)
        formData.append('emailAddress', officeEmailAddress.value)
        formData.append('country', selectedCountry.value)
        formData.append('state', selectedState.value)
        formData.append('city', selectedCity.value)
        // FIXED: Use specific key name for company logo
        if (companyImageURL.value) {
            formData.append('Logo', companyImageURL.value)
        }
    }

    formData.append('license_key', retrievedKey.value)
    formData.append('employeeName', employeeName.value)
    formData.append('employeeDesignation', employeeDesignation.value)
    formData.append('employeeId', employeeId.value)
    formData.append('employeePhone', employeePhone.value)
    formData.append('employeeEmail', employeeEmail.value)
    formData.append('serial_number', serialNumber.value)
    formData.append('host_name', systemInfo.value?.hostname || 'UNKNOWN')
    formData.append('os', systemInfo.value?.platform || 'UNKNOWN')
    formData.append('ram', systemInfo.value?.totalMemory
        ? `${Math.round(systemInfo.value.totalMemory / (1024 * 1024 * 1024))}GB`
        : 'UNKNOWN')
    formData.append('cpu', systemInfo.value?.cpus?.[0]?.model || 'UNKNOWN')
    formData.append('mac', systemInfo.value?.networkInterfaces?.[Object.keys(systemInfo.value.networkInterfaces)[0]]?.[0]?.mac || 'UNKNOWN')
    formData.append('access', 'true')
    if (employeeImageURL.value) {
        formData.append('photo', employeeImageURL.value)
    }

    return formData
}

const submitForm = async () => {
    resetErrors()
    validateCompanyFields()
    validateEmployeeFields()
    validateLicenseKey()

    if (hasErrors.value) {
        showToast('error', hasCompanyData.value ? 'PLEASE FILL ALL REQUIRED EMPLOYEE FIELDS' : 'PLEASE FILL ALL REQUIRED FIELDS', 5000, 'right-bottom')
        return
    }

    await fetchSystemInfo()
    saveToLocalStorage()

    try {
        loading.value = true
        const formData = prepareFormData()
        await post('/api/create_org', formData)
        localStorage.removeItem('companyFormData')
        router.push('/welcome')
        showToast('success', 'SUCCESSFULLY COMPLETED ALL SETUP', 80000, 'right-bottom')
    } catch (error) {
        showToast('error', String(error), 5000, 'right-bottom')
    } finally {
        loading.value = false
    }
}

// LIFECYCLE
onMounted(async () => {
    validateLocationData()
    loadSavedFormData()
    await retrieveLicenseKey()
    await fetchSerialNumber()
    if (retrievedKey.value && retrievedKey.value !== 'FAILED TO RETRIEVE LICENSE KEY') {
        await getDefaultData()
    } else {
        console.error('NO VALID LICENSE KEY AVAILABLE TO FETCH DEFAULT DATA')
        showToast('error', 'FAILED TO LOAD DEFAULT DATA: INVALID LICENSE KEY', 5000, 'right-bottom')
    }
})
</script>

<style scoped>
.full-width {
    width: 100%;
}
</style>