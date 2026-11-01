/* ------------------------------------------
 * INTERFACES
 * ------------------------------------------ */
export interface MaterialItem {
    id: number
    company_name: string
    unit: string
    quantity: string
    price: string
    imageUrl: string
    created_at: string
    updated_at: string
    main_item: number
}

export interface ApiResponse {
    exterior: { [key: string]: MaterialItem[] }
    finish: { [key: string]: MaterialItem[] }
    interior: { [key: string]: MaterialItem[] }
}

export interface ModalFormData {
    material: string
    companyName: string
    selectedUnit: string
    quantity: string
    price: string
    imageFile: File | null
    imagePreview: string
}