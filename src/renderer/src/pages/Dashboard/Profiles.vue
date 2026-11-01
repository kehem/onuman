<!-- src/pages/Dashboard/Profiles.vue -->
<template>
    <DefaultLayouts class="d-block relative">
        <section class="f-center h-100">
            <div class="main-screen w-95">
                <br>

                <h2 class="text-center">Profile Settings</h2>
                <br>
                <section class="profiles">
                    <!-- LEFT COLUMN -->
                    <aside class="left-columnz">
                        <div class="profile-tabs">
                            <div class="tab" :class="{ active: activeTab === 'profile' }"
                                @click="setActiveTab('profile')">
                                <i class="m-user11"></i>
                                <p>Profile</p>
                            </div>
                            <div class="tab" :class="{ active: activeTab === 'companyInfo' }"
                                @click="setActiveTab('companyInfo')">
                                <i class="m-business"></i>
                                <p>Company Info</p>
                            </div>
                            <div class="tab" :class="{ active: activeTab === 'license' }"
                                @click="setActiveTab('license')">
                                <i class="m-key8"></i>
                                <p>License</p>
                            </div>
                            <div class="tab" :class="{ active: activeTab === 'employees' }"
                                @click="setActiveTab('employees')">
                                <i class="m-users5"></i>
                                <p>Employees</p>
                            </div>
                        </div>
                    </aside>

                    <aside class="right-columnz onuman-insider-scrollbar">

                        <!-- PROFILE SETTINGS -->
                        <section id="profile" class="profile" v-if="activeTab === 'profile'">

                            <!-- Toggle button -->
                            <div class="edit" tabindex="0" @click="toggleEdit">
                                <i :class="isEdit ? 'm-edit1' : 'm-gallery'"></i>
                                {{ isEdit ? 'Edit' : 'Cancel' }}
                            </div>


                            <!-- VIEW MODE -->
                            <aside v-if="isEdit">
                                <div class="main-profile">
                                    <div class="img-cont">
                                        <img :src="Profile?.photo || '../../assets/images/placeholder.png'"
                                            :title="`Profile of ${Profile?.employeeName}`"
                                            :alt="`${Profile?.employeeName}`" />
                                    </div>
                                    <p class="name">{{ Profile?.employeeName }}</p>
                                    <p class="designation">{{ Profile?.employeeDesignation }}</p>
                                </div>

                                <div class="others">
                                    <table class="tablez">
                                        <tbody>
                                            <tr>
                                                <td><b>Employee ID</b></td>
                                                <td>:</td>
                                                <td><b>{{ Profile?.employeeId }}</b></td>
                                            </tr>
                                            <tr>
                                                <td><b>Phone number</b></td>
                                                <td>:</td>
                                                <td><b>{{ Profile?.employeePhone }}</b></td>
                                            </tr>
                                            <tr>
                                                <td><b>Email Address</b></td>
                                                <td>:</td>
                                                <td><b>{{ Profile?.EmployeeEmail }}</b></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>


                                <div class="update-notice">
                                    <span>Created at &nbsp;
                                        <b>{{ normalizeDate(Profile?.created_at) }}</b>
                                    </span>
                                    <p>|</p>
                                    <span>
                                        Last Update &nbsp;
                                        <b>{{ normalizeDate(Profile?.updated_at) }}</b>
                                    </span>
                                </div>
                            </aside>

                            <!-- EDIT MODE -->
                            <form class="profileSettings" v-else @submit.prevent="profileSettings">
                                <div class="form-fields">
                                    <label>Your Name</label>
                                    <input v-model="employeeName" type="text" class="onuman-input2"
                                        placeholder="Type Your Name">
                                </div>

                                <div class="form-fields">
                                    <label>Your Designation</label>
                                    <input v-model="employeeDesignation" type="text" class="onuman-input2"
                                        placeholder="Type Your Designation">
                                </div>

                                <div class="form-fields">
                                    <label>Your Employee ID</label>
                                    <input v-model="employeeId" type="text" class="onuman-input2"
                                        placeholder="Type Your Employee ID number">
                                </div>

                                <div class="form-fields">
                                    <label>Your Phone Number</label>
                                    <input v-model="employeePhone" type="text" class="onuman-input2"
                                        placeholder="Type Your Phone Number">
                                </div>

                                <div class="form-fields">
                                    <label>Your Email Address</label>
                                    <input v-model="EmployeeEmail" type="text" class="onuman-input2"
                                        placeholder="Type Your Email Address">
                                </div>

                                <!-- IMAGE -->
                                <div class="item-picture img-preview">
                                    <!-- INPUT FILE -->
                                    <div class="item">
                                        <label for="image">Upload Image <span class="small-btn">Square
                                                shape</span></label>
                                        <input type="file" name="image" id="image" @change="handleFileChange"
                                            :disabled="isUploading">
                                        <p class="max-file-size">Max file size: 2MB (WebP not supported)</p>
                                    </div>

                                    <!-- UPLOAD PROGRESS -->
                                    <div v-if="isUploading" class="upload-progress mat-prev"><br><br>
                                        <div class="uploading-indicator">
                                            <div class="uploading-spinner"></div>
                                            <p>Uploading ...</p>
                                        </div><br>
                                        <div class="progress-bar">
                                            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                                        </div>
                                        <span class="progress-text">{{ uploadProgress }}%</span>
                                    </div>

                                    <!-- PREVIEW -->
                                    <div class="preview" v-else>
                                        <button type="button" v-if="imageURL || Profile?.photo" class="remove-image"
                                            @click="removeImage">
                                            <i class="m-cross1"></i>
                                        </button>
                                        <img :src="imageURL || Profile?.photo || '/placeholder.png'" alt="Support Image"
                                            loading="lazy" />
                                    </div>
                                </div>

                                <!-- SUBMIT -->
                                <button class="profile-submit-btn" type="submit">
                                    <div class="loading-spinner-small" v-if="isUploading"></div>
                                    <p>Update</p>
                                </button>
                            </form>

                        </section>
                        <!-- COMPANY INFO SETTINGS -->
                        <section id="companyInfo" class="companyInfo" v-if="activeTab === 'companyInfo'">

                            <!-- Toggle button -->
                            <div class="edit" tabindex="0" @click="toggleCompanyEdit">
                                <i :class="isCompanyEdit ? 'm-edit1' : 'm-gallery'"></i>
                                {{ isCompanyEdit ? 'Edit' : 'Cancel' }}
                            </div>

                            <!-- VIEW MODE -->
                            <aside v-if="isCompanyEdit">
                                <div class="main-profile">
                                    <div class="img-cont">
                                        <img :src="`${CompanyInfo?.Logo}`"
                                            :title="`Profile of ${CompanyInfo?.companyName}`"
                                            :alt="`${CompanyInfo?.companyName}`">
                                    </div>
                                    <p class="name">{{ CompanyInfo?.companyName }}</p>
                                    <p class="designation">{{ CompanyInfo?.webOrSlogan }}</p>
                                </div>

                                <div class="others">
                                    <table class="tablez">
                                        <thead></thead>
                                        <tbody>
                                            <tr>
                                                <td><b>Address line</b></td>
                                                <td>:</td>
                                                <td><b>{{ CompanyInfo?.addressLine }}</b></td>
                                            </tr>
                                            <tr>
                                                <td><b>City</b></td>
                                                <td>:</td>
                                                <td><b>{{ CompanyInfo?.city }}</b></td>
                                            </tr>
                                            <tr>
                                                <td><b>Zip Code</b></td>
                                                <td>:</td>
                                                <td><b>{{ CompanyInfo?.zipCode }}</b></td>
                                            </tr>
                                            <tr>
                                                <td><b>State</b></td>
                                                <td>:</td>
                                                <td><b>{{ CompanyInfo?.state }}</b></td>
                                            </tr>
                                            <tr>
                                                <td><b>Country</b></td>
                                                <td>:</td>
                                                <td><b>{{ CompanyInfo?.country }}</b></td>
                                            </tr>
                                            <tr>
                                                <td><b>Trade License</b></td>
                                                <td>:</td>
                                                <td><b>{{ CompanyInfo?.tradeLicense }}</b></td>
                                            </tr>
                                            <tr>
                                                <td><b>Office Phone</b></td>
                                                <td>:</td>
                                                <td><b>{{ CompanyInfo?.phoneNumber }}</b></td>
                                            </tr>
                                            <tr>
                                                <td><b>Office Email</b></td>
                                                <td>:</td>
                                                <td><b>{{ CompanyInfo?.emailAddress }}</b></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <p class="update-notice">
                                    <span>Created at &nbsp;
                                        <b>{{ normalizeDate(CompanyInfo?.created_at) }}</b>
                                    </span>
                                </p>
                            </aside>

                            <!-- EDIT MODE -->
                            <form class="profileSettings" v-else @submit.prevent="companyInfoSettings">
                                <div class="form-fields">
                                    <label>Company Name</label>
                                    <input v-model="companyName" type="text" class="onuman-input2"
                                        placeholder="Type Company Name">
                                </div>

                                <div class="form-fields">
                                    <label>Website or Slogan</label>
                                    <input v-model="webOrSlogan" type="text" class="onuman-input2"
                                        placeholder="Type Website URL or Company Slogan">
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
                                            </div>
                                            <!-- STATE COMBOBOX -->
                                            <div class="combobox-wrapper">
                                                <Tooltip content="Select the state or division or province"
                                                    position="top">
                                                    <OnumanCombobox id="onuman-combobox-state" name="state"
                                                        :options="stateOptions" placeholder="Select State"
                                                        :disabled="!selectedCountry" v-model:selected="selectedState" />

                                                </Tooltip>
                                            </div>
                                            <!-- CITY COMBOBOX -->
                                            <div class="combobox-wrapper">
                                                <Tooltip content="Select the city or district" position="top">
                                                    <OnumanCombobox id="onuman-combobox-city" name="city"
                                                        :options="cityOptions" placeholder="Select City"
                                                        :disabled="!selectedState" v-model:selected="selectedCity" />
                                                </Tooltip>
                                            </div>
                                        </div><br>
                                        <div class="address-inputs g-res-3-col-container gap-10">
                                            <input type="text" id="address-line-input" name="addressLine"
                                                class="onuman-input2 span-2"
                                                placeholder="Ex: Region, Building, Floor, Shop no."
                                                v-model="addressLine" />
                                            <input type="text" id="zip-code-input" name="zipCode" class="onuman-input2"
                                                placeholder="ZIP Code" v-model="zipCode" />
                                        </div>
                                    </fieldset>
                                </div>

                                <div class="form-fields">
                                    <label>Trade License</label>
                                    <input v-model="tradeLicense" type="text" class="onuman-input2"
                                        placeholder="Type Trade License Number">
                                </div>

                                <div class="form-fields">
                                    <label>Office Phone</label>
                                    <input v-model="phoneNumber" type="text" class="onuman-input2"
                                        placeholder="Type Office Phone Number">
                                </div>

                                <div class="form-fields">
                                    <label>Office Email</label>
                                    <input v-model="emailAddress" type="text" class="onuman-input2"
                                        placeholder="Type Office Email Address">
                                </div>

                                <!-- COMPANY LOGO -->
                                <div class="item-picture img-preview">
                                    <!-- INPUT FILE -->
                                    <div class="item">
                                        <label for="companyLogo">Upload Company Logo <span class="small-btn">Square
                                                shape</span></label>
                                        <input type="file" name="companyLogo" id="companyLogo"
                                            @change="handleCompanyLogoChange" :disabled="isCompanyLogoUploading">
                                        <p class="max-file-size">Max file size: 2MB (WebP not supported)</p>
                                    </div>

                                    <!-- UPLOAD PROGRESS -->
                                    <div v-if="isCompanyLogoUploading" class="upload-progress mat-prev"><br><br>
                                        <div class="uploading-indicator">
                                            <div class="uploading-spinner"></div>
                                            <p>Uploading ...</p>
                                        </div><br>
                                        <div class="progress-bar">
                                            <div class="progress-fill"
                                                :style="{ width: companyLogoUploadProgress + '%' }"></div>
                                        </div>
                                        <span class="progress-text">{{ companyLogoUploadProgress }}%</span>
                                    </div>

                                    <!-- PREVIEW -->
                                    <div class="preview" v-else>
                                        <button type="button" v-if="companyLogoURL || CompanyInfo?.Logo"
                                            class="remove-image" @click="removeCompanyLogo">
                                            <i class="m-cross1"></i>
                                        </button>
                                        <img :src="companyLogoURL || CompanyInfo?.Logo || '/placeholder.png'"
                                            alt="Company Logo" loading="lazy" />
                                    </div>
                                </div>

                                <!-- SUBMIT -->
                                <button class="profile-submit-btn" type="submit" :disabled="isCompanySubmitting">
                                    <div class="loading-spinner-small" v-if="isCompanySubmitting"></div>
                                    <p>{{ isCompanySubmitting ? 'Updating...' : 'Update' }}</p>
                                </button>
                            </form>

                        </section>
                        <!-- LICENSE -->
                        <section id="license" class="license" v-if="activeTab === 'license'">

                            <div class="expire">
                                <span class="license-box created">
                                    <h4>Created</h4>
                                    <p class="licns-1">{{ normalizeDate(License?.created_at) }}</p>
                                </span>
                                <span class="license-box expired">
                                    <h4>Expired</h4>
                                    <p class="licns-2">{{ normalizeDate(License?.expire) }}</p>
                                </span>
                            </div>

                            <div class="license-history">
                                <h3>History</h3>
                                <div class="" v-for="item in License?.update_history">
                                    <div class="history">
                                        <i class="m-circle"></i>
                                        <p>Renewed</p>
                                        <p class="date">{{ normalizeDate(item.updated_at) }}</p>
                                    </div>
                                    <div class="history expired">
                                        <i class="m-circle"></i>
                                        <p>License Update</p>
                                        <p class="date">{{ normalizeDate(item.expire) }}</p>
                                    </div>
                                </div>
                            </div>

                        </section>








                        <!-- EMPLOYEES -->
                        <section id="employees" class="employees" v-if="activeTab === 'employees'">
                            <div class="employees-content">
                                <h3 class="text-center">All Employees</h3>
                                <ul class="users-profile-data">
                                    <li class="user-profile" v-for="(item, index) in AllEmployees" :key="index">
                                        <div class="image">
                                            <img :src="`${item.photo ?? '../../assets/images/placeholder.jpg'}`"
                                                :title="`Profile of ${item.employeeName}`"
                                                :alt="`Profile of ${item.employeeName}`">
                                        </div>
                                        <div class="info">
                                            <p class="name">{{ item.employeeName }}</p>
                                            <p class="user-ctns cstm">
                                                <i class="m-education"></i>
                                                <span>{{ item.employeeDesignation }}</span>
                                            </p>
                                            <p class="user-ctns cstm1">
                                                <i class="m-mail1"></i>
                                                <span>{{ item.EmployeeEmail }}</span>
                                            </p>
                                            <p class="user-ctns cstm2">
                                                <i class="m-phone"></i>
                                                <span>{{ item.employeePhone }}</span>
                                            </p>
                                            <button type="button" class="btn btn-primary sadfwe5ec"
                                                @click="openModal(item.id)">
                                                <ToolTip :content="`Details about ${item.employeeName}`"
                                                    position="left">
                                                    <i class="m-chevron-right"></i>
                                                </ToolTip>
                                            </button>
                                        </div>


                                    </li>
                                </ul>
                            </div>
                        </section>



                        <div class="modal-overlay-32cds" :class="{ active: isModalOpen }">
                            <div class="modal-container-sdf23 grty67pytj" @click.stop>
                                <div class="modal-header">
                                    <h3 class="modal-title">
                                        <i class="m-user1"></i>
                                        {{ selectedEmployee?.employeeName }}
                                    </h3>
                                    <button class="modal-close" @click="closeModal()">
                                        <i class="m-cross1"></i>
                                    </button>
                                </div>
                                <div class="modal-content-er34 onuman-scrollbar">
                                    <!-- CONTENTS -->

                                    <section class="profile" v-if="selectedEmployee">
                                        <!-- Toggle button -->
                                        <div class="edit" tabindex="0" @click="toggleEmployeeEdit">
                                            <i :class="isEmployeeEdit ? 'm-edit1' : 'm-gallery'"></i>
                                            {{ isEmployeeEdit ? 'Edit' : 'Cancel' }}
                                        </div>

                                        <!-- VIEW MODE -->
                                        <aside v-if="isEmployeeEdit">
                                            <div class="main-profile">
                                                <div class="img-cont">
                                                    <img :src="selectedEmployee?.photo || '../../assets/images/placeholder.png'"
                                                        :title="`Profile of ${selectedEmployee?.employeeName}`"
                                                        :alt="`${selectedEmployee?.employeeName}`" />
                                                </div>
                                                <p class="name">{{ selectedEmployee?.employeeName }}</p>
                                                <p class="designation">{{
                                                    selectedEmployee?.employeeDesignation
                                                }}</p>
                                            </div>

                                            <div class="others">
                                                <table class="tablez">
                                                    <tbody>
                                                        <tr>
                                                            <td><b>Employee ID</b></td>
                                                            <td>:</td>
                                                            <td><b>{{ selectedEmployee?.employeeId
                                                            }}</b></td>
                                                        </tr>
                                                        <tr>
                                                            <td><b>Phone number</b></td>
                                                            <td>:</td>
                                                            <td><b>{{ selectedEmployee?.employeePhone
                                                            }}</b>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><b>Email Address</b></td>
                                                            <td>:</td>
                                                            <td><b>{{ selectedEmployee?.EmployeeEmail
                                                            }}</b>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><b>Serial Number</b></td>
                                                            <td>:</td>
                                                            <td><b>{{ selectedEmployee?.serial_number
                                                            }}</b>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><b>Host Name</b></td>
                                                            <td>:</td>
                                                            <td><b>{{ selectedEmployee?.host_name }}</b>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><b>OS</b></td>
                                                            <td>:</td>
                                                            <td><b>{{ selectedEmployee?.os }}</b></td>
                                                        </tr>
                                                        <tr>
                                                            <td><b>RAM</b></td>
                                                            <td>:</td>
                                                            <td><b>{{ selectedEmployee?.ram }}</b></td>
                                                        </tr>
                                                        <tr>
                                                            <td><b>CPU</b></td>
                                                            <td>:</td>
                                                            <td><b>{{ selectedEmployee?.cpu }}</b></td>
                                                        </tr>
                                                        <tr>
                                                            <td><b>MAC</b></td>
                                                            <td>:</td>
                                                            <td><b>{{ selectedEmployee?.mac }}</b></td>
                                                        </tr>
                                                        <tr>
                                                            <td><b>Access</b></td>
                                                            <td>:</td>
                                                            <td><b>{{ selectedEmployee?.access ? 'Yes' :
                                                                'No'
                                                                    }}</b></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <p class="update-notice">
                                                <span>Created at &nbsp;
                                                    <b>{{ normalizeDate(selectedEmployee?.created_at)
                                                    }}</b>
                                                </span>
                                                |
                                                <span>
                                                    Last Update &nbsp;
                                                    <b>{{ normalizeDate(selectedEmployee?.updated_at) }}</b>
                                                </span>
                                            </p>
                                        </aside>

                                        <!-- EDIT MODE -->
                                        <form class="profileSettings" v-else @submit.prevent="updateEmployee">
                                            <div class="form-fields">
                                                <label>Employee Name</label>
                                                <input v-model="empName" type="text" class="onuman-input2"
                                                    placeholder="Type Employee Name">
                                            </div>

                                            <div class="form-fields">
                                                <label>Designation</label>
                                                <input v-model="empDesignation" type="text" class="onuman-input2"
                                                    placeholder="Type Employee Designation">
                                            </div>

                                            <div class="form-fields">
                                                <label>Employee ID</label>
                                                <input v-model="empId" type="text" class="onuman-input2"
                                                    placeholder="Type Employee ID number">
                                            </div>

                                            <div class="form-fields">
                                                <label>Phone Number</label>
                                                <input v-model="empPhone" type="text" class="onuman-input2"
                                                    placeholder="Type Phone Number">
                                            </div>

                                            <div class="form-fields">
                                                <label>Email Address</label>
                                                <input v-model="empEmail" type="email" class="onuman-input2"
                                                    placeholder="Type Email Address">
                                            </div>

                                            <div class="form-fields">
                                                <label>Serial Number</label>
                                                <input v-model="empSerialNumber" type="text" class="onuman-input2"
                                                    placeholder="Type Serial Number">
                                            </div>

                                            <div class="form-fields">
                                                <label>Host Name</label>
                                                <input v-model="empHostName" type="text" class="onuman-input2"
                                                    placeholder="Type Host Name">
                                            </div>

                                            <div class="form-fields">
                                                <label>Operating System</label>
                                                <input v-model="empOs" type="text" class="onuman-input2"
                                                    placeholder="Type Operating System">
                                            </div>

                                            <div class="form-fields">
                                                <label>RAM</label>
                                                <input v-model="empRam" type="text" class="onuman-input2"
                                                    placeholder="Type RAM specifications">
                                            </div>

                                            <div class="form-fields">
                                                <label>CPU</label>
                                                <input v-model="empCpu" type="text" class="onuman-input2"
                                                    placeholder="Type CPU specifications">
                                            </div>

                                            <div class="form-fields">
                                                <label>MAC Address</label>
                                                <input v-model="empMac" type="text" class="onuman-input2"
                                                    placeholder="Type MAC Address">
                                            </div>

                                            <div class="form-fields">
                                                <label>
                                                    <input v-model="empAccess" type="checkbox">
                                                    Grant Access
                                                </label>
                                            </div>

                                            <!-- IMAGE -->
                                            <div class="item-picture img-preview">
                                                <!-- INPUT FILE -->
                                                <div class="item">
                                                    <label for="employeeImage">Upload Image <span
                                                            class="small-btn">Square
                                                            shape</span></label>
                                                    <input type="file" name="employeeImage" id="employeeImage"
                                                        @change="handleEmployeeImageChange"
                                                        :disabled="isEmployeeImageUploading">
                                                    <p class="max-file-size">Max file size: 2MB (WebP
                                                        not
                                                        supported)</p>
                                                </div>

                                                <!-- UPLOAD PROGRESS -->
                                                <div v-if="isEmployeeImageUploading" class="upload-progress mat-prev">
                                                    <br><br>
                                                    <div class="uploading-indicator">
                                                        <div class="uploading-spinner"></div>
                                                        <p>Uploading ...</p>
                                                    </div><br>
                                                    <div class="progress-bar">
                                                        <div class="progress-fill"
                                                            :style="{ width: employeeImageUploadProgress + '%' }">
                                                        </div>
                                                    </div>
                                                    <span class="progress-text">{{
                                                        employeeImageUploadProgress
                                                    }}%</span>
                                                </div>

                                                <!-- PREVIEW -->
                                                <div class="preview" v-else>
                                                    <button type="button"
                                                        v-if="employeeImageURL || selectedEmployee?.photo"
                                                        class="remove-image" @click="removeEmployeeImage">
                                                        <i class="m-cross1"></i>
                                                    </button>
                                                    <img :src="employeeImageURL || selectedEmployee?.photo || '/placeholder.png'"
                                                        alt="Employee Image" loading="lazy" />
                                                </div>
                                            </div>

                                            <!-- SUBMIT -->
                                            <button class="profile-submit-btn" type="submit"
                                                :disabled="isEmployeeSubmitting">
                                                <div class="loading-spinner-small" v-if="isEmployeeSubmitting">
                                                </div>
                                                <p>{{ isEmployeeSubmitting ? 'Updating...' : 'Update' }}
                                                </p>
                                            </button>
                                        </form>
                                    </section>
                                </div>
                            </div>
                        </div>




                    </aside>
                </section>
            </div>
        </section>
    </DefaultLayouts>
    <BottomBar />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DefaultLayouts from '../../layouts/DefaultLayouts.vue'
import BottomBar from '../../components/Dashboard/BottomBar.vue'
import { useToast } from '../../composables/Toast'
import { useApi } from '../../composables/useApi'
import { useImageUploader } from '../../composables/useImageUploader'
import { CompanyInfos, Licenses, Profiles, Country, Users } from '../../Interfaces/Profiles'
import OnumanCombobox from '../../components/Initializers/OnumanCombobox.vue'
import locationData from '../../assets/jsons/countryStateCity.json'
import ToolTip from '../../components/Initializers/ToolTip.vue'

/* ========================================
   COMPOSABLES INITIALIZATION
======================================== */
const { get, put } = useApi()
const router = useRouter()
const route = useRoute()
const { showToast } = useToast()
const Profile = ref<Profiles>();
const CompanyInfo = ref<CompanyInfos>();
const License = ref<Licenses>();
const AllEmployees = ref<Users[] | null>(null);
const {
    handleFileChange,
    isUploading,
    uploadProgress,
    imageURL,
} = useImageUploader()

// STATE - LOCATION DATA
const locations = ref<Country[]>(locationData as Country[])
const selectedCountry = ref('')
const selectedState = ref('')
const selectedCity = ref('')

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


// IMAGE UPLOADER
const {
    handleFileChange: handleCompanyLogoChange,
    isUploading: isCompanyLogoUploading,
    uploadProgress: companyLogoUploadProgress,
    imageURL: companyLogoURL,
} = useImageUploader()

/* ========================================
   PROJECT DATA LOADING (EDIT MODE)
======================================== */
const getProfile = async (): Promise<void> => {
    try {
        const response = await get(`/api/user_profile`)
        Profile.value = response
    } catch (error: unknown) {
        showToast('error', String(error))
        router.push('/dashboard')
    }
}

const getCompanyInfo = async (): Promise<void> => {
    try {
        const response = await get(`/api/company_profile`)
        CompanyInfo.value = response
    } catch (error: unknown) {
        showToast('error', String(error))
        router.push('/dashboard')
    }
}

const getLicense = async (): Promise<void> => {
    try {
        const response = await get(`/api/license_profile`)
        License.value = response
    } catch (error: unknown) {
        showToast('error', String(error))
        router.push('/dashboard')
    }
}










// Modal state
const isModalOpen = ref<boolean>(false)
const selectedEmployeeId = ref<number | null>(null)
const selectedEmployee = ref<Users | null>(null)
const isEmployeeEdit = ref<boolean>(true)
const isEmployeeSubmitting = ref<boolean>(false)

// Employee form fields
const empName = ref<string>('')
const empDesignation = ref<string>('')
const empId = ref<string>('')
const empPhone = ref<string>('')
const empEmail = ref<string>('')
const empSerialNumber = ref<string>('')
const empHostName = ref<string>('')
const empOs = ref<string>('')
const empRam = ref<string>('')
const empCpu = ref<string>('')
const empMac = ref<string>('')
const empAccess = ref<boolean>(false)

// Employee image uploader
const {
    handleFileChange: handleEmployeeImageChange,
    isUploading: isEmployeeImageUploading,
    uploadProgress: employeeImageUploadProgress,
    imageURL: employeeImageURL,
} = useImageUploader()

// Modal functions
const openModal = (employeeId: number) => {
    selectedEmployeeId.value = employeeId
    selectedEmployee.value = AllEmployees.value?.find(emp => emp.id === employeeId) || null
    isModalOpen.value = true
    isEmployeeEdit.value = true
}

const closeModal = () => {
    isModalOpen.value = false
    selectedEmployeeId.value = null
    selectedEmployee.value = null
    isEmployeeEdit.value = true
    // Reset form fields
    empName.value = ''
    empDesignation.value = ''
    empId.value = ''
    empPhone.value = ''
    empEmail.value = ''
    empSerialNumber.value = ''
    empHostName.value = ''
    empOs.value = ''
    empRam.value = ''
    empCpu.value = ''
    empMac.value = ''
    empAccess.value = false
    employeeImageURL.value = ''
}

const toggleEmployeeEdit = () => {
    isEmployeeEdit.value = !isEmployeeEdit.value
}

// Load employee data into form
watch(selectedEmployee, (val) => {
    if (val) {
        empName.value = val.employeeName || ''
        empDesignation.value = val.employeeDesignation || ''
        empId.value = val.employeeId || ''
        empPhone.value = val.employeePhone || ''
        empEmail.value = val.EmployeeEmail || ''
        empSerialNumber.value = val.serial_number || ''
        empHostName.value = val.host_name || ''
        empOs.value = val.os || ''
        empRam.value = val.ram || ''
        empCpu.value = val.cpu || ''
        empMac.value = val.mac || ''
        empAccess.value = val.access || false
    }
}, { immediate: true })

// Submit employee update
const updateEmployee = async () => {
    if (!selectedEmployeeId.value) return

    try {
        isEmployeeSubmitting.value = true

        const payload = {
            employeeName: empName.value,
            employeeDesignation: empDesignation.value,
            employeeId: empId.value,
            employeePhone: empPhone.value,
            EmployeeEmail: empEmail.value,
            serial_number: empSerialNumber.value,
            host_name: empHostName.value,
            os: empOs.value,
            ram: empRam.value,
            cpu: empCpu.value,
            mac: empMac.value,
            access: empAccess.value,
            photo: employeeImageURL.value || selectedEmployee.value?.photo || ''
        }

        await put(`/api/employee_list_profile/${selectedEmployeeId.value}`, payload)

        showToast('success', 'Employee updated successfully!')

        // Refresh employees list and close modal
        await getEmployees()
        closeModal()
    } catch (error: any) {
        showToast('error', error.message || 'Employee update failed')
    } finally {
        isEmployeeSubmitting.value = false
    }
}

const removeEmployeeImage = () => {
    employeeImageURL.value = ''
    if (selectedEmployee.value) {
        selectedEmployee.value.photo = ''
    }
}
const getEmployees = async () => {
    try {
        const response = await get(`/api/employee_list_profile`)
        AllEmployees.value = response

    } catch (error: any) {
        showToast('error', error)
    }
}

const normalizeDate = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);

    // Format: YYYY-MM-DD HH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// Reactive state for active tab
const activeTab = ref<string>('companyInfo')

// Define available tabs - you can easily add more tabs here
const availableTabs = ['profile', 'companyInfo', 'license', 'employees']

// Function to get tab from query parameters with flexible approach
const getTabFromQuery = (): string => {
    const query = route.query
    const queryKeys = Object.keys(query)

    // Look for any query key that matches our available tabs (case-insensitive)
    for (const key of queryKeys) {
        const normalizedKey = key.toLowerCase()
        if (availableTabs.includes(normalizedKey)) {
            return normalizedKey
        }
    }

    // Legacy support for capitalized query parameters
    if (query.Profile !== undefined) return 'profile'
    if (query.CompanyInfo !== undefined) return 'companyInfo'
    if (query.License !== undefined) return 'license'
    if (query.Employees !== undefined) return 'employees'

    return 'companyInfo' // default tab
}

// Flexible function to change active tab - automatically handles URL updates
const setActiveTab = (tab: string) => {
    if (!availableTabs.includes(tab)) {
        console.warn(`Tab '${tab}' is not in available tabs list`)
        return
    }

    activeTab.value = tab

    // Create query parameter (capitalize first letter for consistency)
    const queryKey = tab.charAt(0).toUpperCase() + tab.slice(1)
    router.replace({
        path: '/profiles',
        query: { [queryKey]: '' }
    })
}

/* ========================================
   PROFILE FORM STATE
======================================== */
// editable refs
const employeeName = ref<string>('')
const employeeDesignation = ref<string>('')
const employeeId = ref<string>('')
const employeePhone = ref<string>('')
const EmployeeEmail = ref<string>('')

/* ========================================
   COMPANY INFO FORM STATE
======================================== */
// Company info editable refs
const companyName = ref<string>('')
const webOrSlogan = ref<string>('')
const addressLine = ref<string>('')
const zipCode = ref<string>('')
const tradeLicense = ref<string>('')
const phoneNumber = ref<string>('')
const emailAddress = ref<string>('')

/* ========================================
   LOAD PROFILE INTO FORM
======================================== */
watch(Profile, (val) => {
    if (val) {
        employeeName.value = val.employeeName || ''
        employeeDesignation.value = val.employeeDesignation || ''
        employeeId.value = val.employeeId || ''
        employeePhone.value = val.employeePhone || ''
        EmployeeEmail.value = val.EmployeeEmail || ''
    }
}, { immediate: true })

/* ========================================
   LOAD COMPANY INFO INTO FORM
======================================== */
watch(CompanyInfo, (val) => {
    if (val) {
        companyName.value = val.companyName || ''
        webOrSlogan.value = val.webOrSlogan || ''
        addressLine.value = val.addressLine || ''
        zipCode.value = val.zipCode || ''
        tradeLicense.value = val.tradeLicense || ''
        phoneNumber.value = val.phoneNumber || ''
        emailAddress.value = val.emailAddress || ''

        // Set location combobox values with nextTick to ensure options are loaded
        if (val.country) {
            selectedCountry.value = val.country
            // Wait for state options to be computed before setting state
            setTimeout(() => {
                if (val.state) {
                    selectedState.value = val.state
                    // Wait for city options to be computed before setting city
                    setTimeout(() => {
                        if (val.city) {
                            selectedCity.value = val.city
                        }
                    }, 100)
                }
            }, 100)
        }
    }
}, { immediate: true })

/* ========================================
   TOGGLE EDIT MODE
======================================== */
const isEdit = ref<boolean>(true)

const toggleEdit = () => {
    isEdit.value = !isEdit.value
}

const isCompanyEdit = ref<boolean>(true)
const isCompanySubmitting = ref<boolean>(false)

const toggleCompanyEdit = () => {
    isCompanyEdit.value = !isCompanyEdit.value
}

/* ========================================
   SUBMIT EDITED PROFILE
======================================== */
const profileSettings = async () => {
    try {
        const payload = {
            employeeName: employeeName.value,
            employeeDesignation: employeeDesignation.value,
            employeeId: employeeId.value,
            employeePhone: employeePhone.value,
            EmployeeEmail: EmployeeEmail.value,
            photo: imageURL.value || Profile.value?.photo || ''
        }

        await put(`/api/user_profile`, payload)

        showToast('success', 'Profile updated successfully!')

        // refresh profile
        await getProfile()
        isEdit.value = true
    } catch (error: any) {
        showToast('error', error.message || 'Profile update failed')
    }
}

/* ========================================
   SUBMIT EDITED COMPANY INFO
======================================== */
const companyInfoSettings = async () => {
    try {
        const payload = {
            companyName: companyName.value,
            webOrSlogan: webOrSlogan.value,
            addressLine: addressLine.value,
            city: selectedCity.value,
            zipCode: zipCode.value,
            state: selectedState.value,
            country: selectedCountry.value,
            tradeLicense: tradeLicense.value,
            phoneNumber: phoneNumber.value,
            emailAddress: emailAddress.value,
            Logo: companyLogoURL.value || CompanyInfo.value?.Logo || ''
        }

        await put(`/api/company_profile`, payload)

        showToast('success', 'Company information updated successfully!')

        // refresh company info
        await getCompanyInfo()
        isCompanyEdit.value = true
    } catch (error: any) {
        showToast('error', error.message || 'Company info update failed')
    }
}

// Initialize active tab from URL query on mount
onMounted(async () => {
    activeTab.value = getTabFromQuery()
    await getProfile();
    await getCompanyInfo();
    await getLicense();
    await getEmployees();
})

/* ========================================
   REMOVE IMAGE PREVIEW
======================================== */
const removeImage = () => {
    imageURL.value = ''
    if (Profile.value) {
        Profile.value.photo = ''
    }
}

const removeCompanyLogo = () => {
    companyLogoURL.value = ''
    if (CompanyInfo.value) {
        CompanyInfo.value.Logo = ''
    }
}

// Watch for route query changes
watch(() => route.query, () => {
    activeTab.value = getTabFromQuery()
})
</script>
