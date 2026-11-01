<!-- src/pages/Materials/Index.vue -->
<template>
    <DefaultLayouts class="d-block relative">
        <section class="f-center h-100">
            <div class="main-screen w-95">
                <br>
                <h2 class="text-center">Estimate Material Cost</h2>
                <br>
                <nav>
                    <!-- ROOT TABS -->
                    <section class="tabs margin-wa43">
                        <div class="tab" :class="{ active: activeMainTab === 'exterior' }"
                            @click="setMainTab('exterior')">
                            Exterior
                        </div>
                        <div class="tab" :class="{ active: activeMainTab === 'finish' }" @click="setMainTab('finish')">
                            Finish
                        </div>
                        <div class="tab" :class="{ active: activeMainTab === 'interior' }"
                            @click="setMainTab('interior')">
                            Interior
                        </div>
                    </section>

                    <!-- DYNAMIC SUB TABS BASED ON API RESPONSE -->
                    <section class="tabs narrow-tabs" v-if="availableSubTabs">
                        <div v-for="subTab in availableSubTabs" :key="subTab" class="tab"
                            :class="{ active: activeSubTab === subTab }" @click="setSubTab(subTab)">
                            {{ subTab }}
                            <span class="subTabEdit">
                                <i class="m-pencil8" @click="editSubTab(subTab)"></i>
                                <i class="m-trash7" @click="deleteSubTab(subTab)"></i>
                            </span>
                        </div>
                        <!-- ADD NEW MATERIAL -->
                        <div class="new-tab">
                            <span @click="showAddPopup = true"><i class="m-plus3"></i> Add new</span>
                            <div class="add-new-item" v-show="showAddPopup" @click.stop>
                                <h4>{{ isEditingSubTab ? 'Edit Material Type' : 'Add New Material' }}</h4>
                                <input type="text" v-model="newMaterialName" @input="validateMaterialNameInput"
                                    :placeholder="isEditingSubTab ? 'Enter New Name' : 'Enter Name'"
                                    class="onuman-input2" maxlength="200">
                                <button type="submit" class="onuman-btn" @click="addNewMaterial">
                                    {{ isEditingSubTab ? 'Update' : 'Add' }}
                                </button>
                            </div>
                        </div>
                    </section>

                    <!-- LOADING STATE FOR TABS -->
                    <section class="tabs narrow-tabs" v-if="loading && availableSubTabs.length === 0">
                        <div class="loading-tabs">
                            <div class="loading-spinner-small"></div>
                            <span>Loading materials...</span>
                        </div>
                    </section>
                </nav>
                <br>

                <!-- MAIN CONTENT CONTAINER -->
                <main v-if="availableSubTabs.length > 0">
                    <div class="materials-header">
                        <div class="material-navigator">
                            <i class="m-hash1"></i>
                            <strong>{{ capitalizeFirst(activeMainTab) }}</strong>
                            <i class="m-chevron-right"></i>
                            <strong>{{ activeSubTab }}</strong>
                        </div>

                        <!-- SEARCH -->
                        <div class="search">
                            <i class="m-search6"></i>
                            <input type="search" v-model="searchQuery" class="onuman-input3"
                                placeholder="Search Material" name="search_material" id="search_material">
                            <button type="button" class="onuman-btn" @click="openAddMaterialModal">
                                <i class="m-plus2"></i> ADD
                            </button>
                        </div>
                    </div><br>

                    <div class="formatted-table responsive-table sticky-table onuman-insider-scrollbar"
                        style="max-height: calc(100vh - 20rem);">
                        <table class="onuman-table text-center row-border-all column-border-all hover-border actioned">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th class="sortable-header" @click="sortBy('company_name')">
                                        Company
                                        <i :class="getSortIcon('company_name')"></i>
                                    </th>
                                    <th>Unit</th>
                                    <th class="sortable-header" @click="sortBy('price')">
                                        Price
                                        <i :class="getSortIcon('price')"></i>
                                    </th>
                                    <th class="v54cqwer action">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- SHOW CURRENT TAB DATA -->
                                <tr v-for="(item) in filteredAndSortedData" :key="item.id">
                                    <td>
                                        <img class="img-map32scd" :src="item.imageUrl" :alt="item.company_name"
                                            @mouseenter="showPreview($event, 'right')" />
                                    </td>
                                    <td>{{ item.company_name }}</td>
                                    <td>{{ item.unit }} ({{ item.quantity }})</td>
                                    <td>{{ item.price }} BDT</td>
                                    <td>
                                        <div class="modalBox-Action">
                                            <i class="m-dots-three-vertical dasun-isama"
                                                @click="toggleDropdown($event, item.id)"></i>

                                            <ul class="modalBox" v-if="isDropdownActive(item.id)">
                                                <li class="upda" @click="editItem(item)">
                                                    <i class="m-edit1"></i> Update
                                                </li>
                                                <li class="del" @click="deleteItem($event, item.id)">
                                                    <i class="m-trash1"></i> Delete
                                                </li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                                <!-- NO DATA MESSAGE -->
                                <tr v-if="filteredAndSortedData.length === 0">
                                    <td colspan="5" class="no-items">
                                        {{ loading ? 'Loading...' : (searchQuery ? `No results found for
                                        "${searchQuery}"` : `No ${activeSubTab} data available`) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </main>

                <!-- LOADING STATE -->
                <div v-if="loading" class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Loading materials...</p>
                </div>
            </div>
        </section>

        <!-- ADD NEW MATERIAL MODAL (POPUP) -->
        <div v-if="showModalPopup" class="modal-overlay-32cds f23d-asd">
            <div class="modal-container-sdf23 dsf345sdf" @click.stop>
                <div class="modal-header">
                    <h3 class="modal-title">
                        <i class="m-add"></i>
                        {{ isEditing ? 'Update Material' : 'Add New Material' }}
                    </h3>
                    <p class="fs435sd0-wrsd">{{ capitalizeFirst(activeMainTab) }} <i class="m-chevron-right"></i> {{
                        activeSubTab }}</p>
                    <button class="modal-close" @click="closeModal">
                        <i class="m-cross1"></i>
                    </button>
                </div>
                <div class="modal-content-er34 sdfsdf345ef onuman-scrollbar">
                    <form class="materials-table ASF23" @submit.prevent="submitNewMaterial">
                        <!-- COMPANY -->
                        <div class="item">
                            <label for="name">Company Name</label>
                            <input type="text" placeholder="Enter Company Name" class="onuman-input3" name="name"
                                v-model="modalForm.companyName" required id="name">
                        </div>
                        <!-- UNITS -->
                        <div class="item">
                            <fieldset class="fieldset-basic-inputs">
                                <legend class="sdfw43zq1">Set Unit</legend>
                                <span class="f gap-10">
                                    <OnumanCombobox id="onuman-combobox-unit" class="w-100" :options="Options"
                                        placeholder="Select Unit" v-model:selected="modalForm.selectedUnit" />
                                    <input type="text" maxlength="15" v-model="modalForm.quantity"
                                        placeholder="Quantity | Ex: 50" class="onuman-input3" name="units" required
                                        id="units">
                                </span>
                            </fieldset>
                        </div>
                        <!-- PRICE -->
                        <div class="item">
                            <label for="price">Price</label>
                            <input type="text" maxlength="15" v-model="modalForm.price" @input="onlyAllowNumber($event)"
                                placeholder="Enter Price per unit" class="onuman-input3" name="price" required
                                id="price">
                        </div>
                        <!-- IMAGE -->
                        <div class="item img-preview">
                            <!-- INPUT FILE -->
                            <div class="item">
                                <label for="image">Upload Image <span class="small-btn">Square shape</span></label>
                                <input type="file" name="image" id="image" @change="handleFileChange"
                                    :disabled="isUploading">
                                <p class="max-file-size">Max file size: 2MB (WebP not supported)</p>
                            </div>

                            <!-- PREVIEW -->
                            <div class="preview" v-if="isUploading">
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
                            </div>
                            <div class="preview" v-if="imageURL && !isUploading">
                                <button type="button" v-if="imageURL" class="remove-image" @click="removeImage"><i
                                        class="m-cross1"></i></button>
                                <img :src="imageURL" alt="Support Image" loading="lazy" />
                            </div>
                        </div>
                        <br>
                        <input type="submit" :disabled="submitLoading" class="onuman-input3 alo32dfsdcvf234"
                            :value="submitLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update' : 'Submit')" />
                    </form>
                </div>
            </div>
        </div>
        <BottomBar />
    </DefaultLayouts>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useToast } from '../../composables/Toast'
import DefaultLayouts from '../../layouts/DefaultLayouts.vue'
import BottomBar from '../../components/Dashboard/BottomBar.vue'
import { useApi } from '../../composables/useApi'
const { get, post, delete: del, put } = useApi()
import { useImageUploader } from '../../composables/useImageUploader'
import allUnits from '../../assets/jsons/allUnits.json'
import { useImagePreviewHover } from '../../composables/useImagePreviewHover'
const { showPreview } = useImagePreviewHover()
import OnumanCombobox from '../../components/Initializers/OnumanCombobox.vue'
import { MaterialItem, ApiResponse, ModalFormData } from '../../Interfaces/Potential'

/* ------------------------------------------
 * COMPOSABLES
 * ------------------------------------------ */
const {
    handleFileChange,
    isUploading,
    uploadProgress,
    imageURL,
} = useImageUploader()
const removeImage = () => {
    imageURL.value = '';
};
const { showToast } = useToast()

/* ------------------------------------------
 * REACTIVE STATE
 * ------------------------------------------ */
const Options = ref<string[]>(allUnits)
const loading = ref(false)
const submitLoading = ref(false)

// Tab management
const activeMainTab = ref('exterior')
const activeSubTab = ref('')

// Modal state
const showModalPopup = ref(false)
const showAddPopup = ref(false)
const isEditing = ref(false)
const editingItem = ref<MaterialItem | null>(null)
const modalForm = ref<ModalFormData>({
    material: '',
    companyName: '',
    selectedUnit: '',
    quantity: '',
    price: '',
    imageFile: null,
    imagePreview: ''
})

// Search and sorting
const searchQuery = ref('')
const sortField = ref<string>('')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Dropdown and editing
const activeDropdownId = ref<number | null>(null)
const newMaterialName = ref('')
const editingSubTab = ref<string>('')
const isEditingSubTab = ref(false)

// Data
const materialsData = ref<ApiResponse>({
    exterior: {},
    finish: {},
    interior: {}
})

/* ------------------------------------------
 * COMPUTED PROPERTIES
 * ------------------------------------------ */
const availableSubTabs = computed(() => {
    const mainTabData = materialsData.value[activeMainTab.value as keyof ApiResponse]
    return mainTabData ? Object.keys(mainTabData) : []
})

const currentTabData = computed(() => {
    const mainTabData = materialsData.value[activeMainTab.value as keyof ApiResponse]
    if (!mainTabData || !activeSubTab.value) return []
    return mainTabData[activeSubTab.value] || []
})

const filteredAndSortedData = computed(() => {
    let data = [...currentTabData.value]

    // Apply search filter
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        data = data.filter(item =>
            item.company_name.toLowerCase().includes(query) ||
            item.unit.toLowerCase().includes(query) ||
            item.price.toString().includes(query)
        )
    }

    // Apply sorting
    if (sortField.value) {
        data.sort((a, b) => {
            const field = sortField.value as keyof MaterialItem
            let aValue = a[field]
            let bValue = b[field]

            if (aValue === undefined || bValue === undefined) return 0

            // Handle numeric (price)
            if (field === 'price') {
                const result = parseFloat(a.price) - parseFloat(b.price)
                return sortDirection.value === 'desc' ? -result : result
            }

            // Handle strings
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const result = aValue.toLowerCase().localeCompare(bValue.toLowerCase())
                return sortDirection.value === 'desc' ? -result : result
            }

            return 0
        })
    }

    return data
})

/* ------------------------------------------
 * HELPER FUNCTIONS
 * ------------------------------------------ */
const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const onlyAllowNumber = (event: Event) => {
    const target = event.target as HTMLInputElement
    target.value = target.value.replace(/[^0-9.]/g, '')
}

// Dynamic material ID retrieval
const getDynamicMaterialId = (subTabName: string): number => {
    const mainTabData = materialsData.value[activeMainTab.value as keyof ApiResponse]
    if (!mainTabData || !mainTabData[subTabName]) return 0

    const items = mainTabData[subTabName]
    if (items && items.length > 0) {
        return items[0].main_item // Use the main_item from any item in this category
    }

    // Fallback to creating a new ID based on existing pattern
    const allMainItems = new Set<number>()
    Object.values(materialsData.value).forEach(mainTab => {
        Object.values(mainTab).forEach(items => {
            items.forEach(item => allMainItems.add(item.main_item))
        })
    })

    return Math.max(...Array.from(allMainItems), 0) + 1
}

const getMaterialTypeId = (materialType: string): number => {
    const materialTypeIds: { [key: string]: number } = {
        'exterior': 1,
        'finish': 2,
        'interior': 3
    }
    return materialTypeIds[materialType] || 1
}

/* ------------------------------------------
 * MODAL FUNCTIONS
 * ------------------------------------------ */
const resetModalForm = () => {
    modalForm.value = {
        material: activeSubTab.value,
        companyName: '',
        selectedUnit: '',
        quantity: '',
        price: '',
        imageFile: null,
        imagePreview: ''
    }
}

const openAddMaterialModal = () => {
    showModalPopup.value = true
    modalForm.value.material = activeSubTab.value
}

const closeModal = () => {
    showModalPopup.value = false
    isEditing.value = false
    editingItem.value = null
    resetModalForm()
    imageURL.value = null
}

const editItem = (item: MaterialItem) => {
    activeDropdownId.value = null
    editingItem.value = item
    isEditing.value = true
    showModalPopup.value = true

    modalForm.value = {
        material: activeSubTab.value,
        companyName: item.company_name,
        selectedUnit: item.unit,
        quantity: item.quantity.toString(),
        price: item.price.toString(),
        imageFile: null,
        imagePreview: ''
    }

    if (item.imageUrl) {
        imageURL.value = item.imageUrl
    }
}

/* ------------------------------------------
 * VALIDATION
 * ------------------------------------------ */
const validateForm = (): string | null => {
    if (!modalForm.value.companyName.trim()) {
        return 'Please enter company name'
    }
    if (!modalForm.value.selectedUnit) {
        return 'Please select a unit'
    }
    if (!modalForm.value.quantity || parseFloat(modalForm.value.quantity) <= 0) {
        return 'Please enter a valid quantity'
    }
    if (!modalForm.value.price || parseFloat(modalForm.value.price) <= 0) {
        return 'Please enter a valid price'
    }
    return null
}

const validateMaterialName = (
    materialName: string,
    existingSubTabs: string[],
    isEditingSubTab: boolean,
    editingSubTab: string
): string | null => {
    materialName = materialName.trim()

    if (!materialName) return 'Please enter a material name'
    if (materialName.length > 200) return 'Material name cannot be longer than 200 characters'

    const allowedPattern = /^[a-zA-Z0-9_-\s]+$/
    if (!allowedPattern.test(materialName)) {
        return 'Material name can only contain letters, numbers, spaces, underscores (_), and hyphens (-)'
    }

    const existingNames = existingSubTabs.map(tab => tab.toLowerCase())

    if (!isEditingSubTab && existingNames.includes(materialName.toLowerCase())) {
        return `Material "${materialName}" already exists`
    }

    if (isEditingSubTab) {
        const otherNames = existingSubTabs
            .filter(tab => tab !== editingSubTab)
            .map(tab => tab.toLowerCase())

        if (otherNames.includes(materialName.toLowerCase())) {
            return `Material "${materialName}" already exists`
        }
    }

    return null
}

/* ------------------------------------------
 * API OPERATIONS
 * ------------------------------------------ */
const submitNewMaterial = async () => {
    try {
        const validationError = validateForm()
        if (validationError) {
            showToast('error', validationError)
            return
        }

        submitLoading.value = true

        const submissionData = {
            typeid: isEditing.value && editingItem.value
                ? editingItem.value.id
                : getDynamicMaterialId(activeSubTab.value),
            type: activeMainTab.value,
            main_itemid: getMaterialTypeId(activeMainTab.value),
            main_item: activeSubTab.value,
            company_name: modalForm.value.companyName.trim(),
            unit: modalForm.value.selectedUnit,
            quantity: modalForm.value.quantity || '',
            price: parseFloat(modalForm.value.price),
            imageUrl: imageURL.value
        }

        let response
        const isUpdate = isEditing.value && editingItem.value

        if (isUpdate) {
            const itemId = editingItem.value!.id
            submissionData.typeid = itemId
            response = await put(`/api/create_material?id=${itemId}`, submissionData)
        } else {
            response = await post('/api/create_material', submissionData)
        }

        if (response) {
            const successMessage = isUpdate
                ? `${modalForm.value.companyName} updated successfully`
                : `${modalForm.value.companyName} added to ${activeSubTab.value} successfully`

            showToast('success', successMessage)
            closeModal()
            await fetchData()
        }

    } catch (error: any) {
        const errorMessage = isEditing.value ? 'Failed to update material' : 'Failed to add material'
        showToast('error', error.message || `${errorMessage}. Please try again.`)
    } finally {
        submitLoading.value = false
    }
}

const deleteItem = async (event: Event, itemId: number) => {
    event.stopPropagation()
    activeDropdownId.value = null

    const confirm = window.electronAPI.showConfirmDialog
    const isConfirmed = await confirm(
        'Are you sure you want to delete the item? This action cannot be undone.',
        'Delete Project'
    )

    if (!isConfirmed) return

    try {
        await del(`/api/create_material?id=${itemId}`)
        submitLoading.value = true
        await fetchData()
        showToast('success', `"${itemId}" Deleted successfully`)

    } catch (error: any) {
        showToast('error', error.message || 'Failed to delete material. Please try again.')
    }
}

const addNewMaterial = async (): Promise<void> => {
    const materialName = newMaterialName.value
    const validationError = validateMaterialName(
        materialName,
        availableSubTabs.value,
        isEditingSubTab.value,
        editingSubTab.value
    )

    if (validationError) {
        showToast('error', validationError)
        return
    }

    try {
        if (isEditingSubTab.value) {
            const materialId = editingSubTab.value
            await put(`/api/create_new_material?id=${materialId}`, {
                type: activeMainTab.value,
                name: materialName
            })
            showToast('success', `"${editingSubTab.value}" updated to "${materialName}" successfully`)
        } else {
            await post('/api/create_new_material', {
                type: activeMainTab.value,
                name: materialName
            })
            showToast('success', `${materialName} added successfully`)
        }

        // Reset form and close popup
        showAddPopup.value = false
        newMaterialName.value = ''
        isEditingSubTab.value = false
        editingSubTab.value = ''

        await fetchData()

    } catch (error: any) {
        const action = isEditingSubTab.value ? 'update' : 'add'
        showToast('error', error.message || `Failed to ${action} material type`)
    }
}

const deleteSubTab = async (subTab: string) => {
    const confirm = window.electronAPI.showConfirmDialog
    const isConfirmed = await confirm(
        `Are you sure you want to delete "${subTab}"? This action cannot be undone.`,
        'Delete Confirmation'
    )

    if (!isConfirmed) return

    try {
        await del(`/api/create_new_material?id=${subTab}`)

        if (activeSubTab.value === subTab) {
            const remainingTabs = availableSubTabs.value.filter(tab => tab !== subTab)
            activeSubTab.value = remainingTabs.length > 0 ? remainingTabs[0] : ''
        }
        await fetchData()
        showToast('success', `"${subTab}" deleted successfully`)
    } catch (error: any) {
        showToast('error', error.data?.message || 'Failed to delete material')
    }
}

const fetchData = async () => {
    try {
        loading.value = true
        const responseData = await get<ApiResponse>('/api/get_all_materials')

        if (responseData) {
            materialsData.value = responseData

            // Set active sub tab if needed
            if (!activeSubTab.value || !availableSubTabs.value.includes(activeSubTab.value)) {
                const subTabs = availableSubTabs.value
                if (subTabs.length > 0) {
                    activeSubTab.value = subTabs[0]
                }
            }
        }

    } catch (error: any) {
        console.error('Failed to fetch materials data:', error)
        showToast('error', error.message || 'Failed to load materials data')

        // Initialize empty structure on error
        materialsData.value = { exterior: {}, finish: {}, interior: {} }
    } finally {
        loading.value = false
    }
}

/* ------------------------------------------
 * SORTING FUNCTIONS
 * ------------------------------------------ */
const sortBy = (field: string) => {
    if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortField.value = field
        sortDirection.value = 'asc'
    }
}

const getSortIcon = (field: string) => {
    if (sortField.value !== field) return 'm-chevron-down'
    return sortDirection.value === 'asc' ? 'm-chevron-up' : 'm-chevron-down'
}

/* ------------------------------------------
 * TAB MANAGEMENT
 * ------------------------------------------ */
const setMainTab = (tab: string) => {
    activeMainTab.value = tab
    activeSubTab.value = ''

    const subTabs = availableSubTabs.value
    if (subTabs.length > 0) {
        activeSubTab.value = subTabs[0]
    }
}

const setSubTab = (tab: string) => {
    activeSubTab.value = tab
    sortField.value = ''
    sortDirection.value = 'asc'
    searchQuery.value = ''
}

/* ------------------------------------------
 * DROPDOWN FUNCTIONS
 * ------------------------------------------ */
const toggleDropdown = (event: Event, itemId: number) => {
    event.stopPropagation()
    activeDropdownId.value = activeDropdownId.value === itemId ? null : itemId
}

const isDropdownActive = (itemId: number): boolean => {
    return activeDropdownId.value === itemId
}

/* ------------------------------------------
 * INPUT VALIDATION
 * ------------------------------------------ */
const validateMaterialNameInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const value = target.value
    const cleanValue = value.replace(/[^a-zA-Z0-9_\-\s]/g, '')

    if (cleanValue.length > 200) {
        target.value = cleanValue.substring(0, 200)
        newMaterialName.value = target.value
    } else if (cleanValue !== value) {
        target.value = cleanValue
        newMaterialName.value = cleanValue
    } else {
        newMaterialName.value = value
    }

    checkForDuplicateAndAddBorder(target)
}

const checkForDuplicateAndAddBorder = (inputElement: HTMLInputElement) => {
    const trimmedValue = inputElement.value.trim()

    if (!trimmedValue) {
        inputElement.classList.remove('red-border')
        return
    }

    const existingSubTabs = availableSubTabs.value.map(tab => tab.toLowerCase())
    let isDuplicate = false

    if (!isEditingSubTab.value) {
        isDuplicate = existingSubTabs.includes(trimmedValue.toLowerCase())
    } else {
        const otherSubTabs = availableSubTabs.value
            .filter(tab => tab !== editingSubTab.value)
            .map(tab => tab.toLowerCase())
        isDuplicate = otherSubTabs.includes(trimmedValue.toLowerCase())
    }

    inputElement.classList.toggle('red-border', isDuplicate)
}

const editSubTab = (subTab: string) => {
    editingSubTab.value = subTab
    isEditingSubTab.value = true
    newMaterialName.value = subTab
    showAddPopup.value = true
}

/* ------------------------------------------
 * EVENT HANDLERS
 * ------------------------------------------ */
const handleDropdownClickOutside = (event: MouseEvent) => {
    if (activeDropdownId.value !== null) {
        const dropdownElement = document.querySelector('.modalBox')
        const triggerElement = document.querySelector('.dasun-isama')

        if (dropdownElement && !dropdownElement.contains(event.target as Node) &&
            triggerElement && !triggerElement.contains(event.target as Node)) {
            activeDropdownId.value = null
        }
    }
}

const handleClickOutside = (event: MouseEvent) => {
    if (showAddPopup.value) {
        const popup = document.querySelector('.add-new-item')
        const trigger = document.querySelector('.new-tab span')
        const editIcons = document.querySelectorAll('.m-pencil8')

        const clickedOnEditIcon = Array.from(editIcons).some(icon =>
            icon.contains(event.target as Node)
        )

        if (popup && !popup.contains(event.target as Node) &&
            trigger && !trigger.contains(event.target as Node) &&
            !clickedOnEditIcon) {
            showAddPopup.value = false
            newMaterialName.value = ''
            isEditingSubTab.value = false
            editingSubTab.value = ''
        }
    }

    handleDropdownClickOutside(event)
}

/* ------------------------------------------
 * LIFECYCLE HOOKS
 * ------------------------------------------ */
onMounted(async () => {
    await fetchData()
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>



<style scoped lang="scss">
.sortable-header {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;
}

.sortable-header:hover {
    background-color: rgba(0, 0, 0, 0.05);
}

.remove-btn {
    background-color: #ef4444;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s ease;
}

.remove-btn:hover {
    background-color: #dc2626;
}

.no-items {
    font-size: 1.2rem;
    color: #6b7280;
    font-style: italic;
    padding: 20px;
}
</style>