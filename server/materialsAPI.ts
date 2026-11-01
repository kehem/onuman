// src/services/materialsAPI.ts (or wherever you keep your Vue services)

// Copy the interfaces from your API.ts
export interface Material {
    name: string;
    price: number | null;
    currency: string;
    image_url: string;
    category: string;
    unit?: string;
}

export interface MaterialsResponse {
    success: boolean;
    message: string;
    data: Material[];
}

export interface MaterialItem {
    company: string;
    unit: string;
    price: number;
    image: string;
    selected?: boolean;
}

export interface ApiError {
    success: false;
    message: string;
    data?: any;
}

class MaterialsAPIClient {
    private baseUrl = 'http://localhost:3001';

    // Health check
    async checkHealth(): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }

    // Get materials by type and item
    async getMaterials(type: string, item: string): Promise<MaterialsResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/materials?type=${type}&item=${item}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching materials:', error);
            throw error;
        }
    }

    // Get all materials for a specific type
    async getMaterialsByType(type: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/materials/${type}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching materials by type:', error);
            throw error;
        }
    }

    // Get all materials
    async getAllMaterials(): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/materials/all/data`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching all materials:', error);
            throw error;
        }
    }

    // Add new material
    async addMaterial(type: string, item: string, material: Omit<Material, 'category'>): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/materials`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type, item, material }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding material:', error);
            throw error;
        }
    }

    // Update material
    async updateMaterial(type: string, item: string, name: string, material: Partial<Material>): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/materials/${type}/${item}/${encodeURIComponent(name)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(material),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating material:', error);
            throw error;
        }
    }

    // Delete material
    async deleteMaterial(type: string, item: string, name: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/api/materials/${type}/${item}/${encodeURIComponent(name)}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting material:', error);
            throw error;
        }
    }

    // Helper method to get available material types
    getAvailableTypes(): string[] {
        return ['exterior', 'finish', 'interior'];
    }

    // Helper method to get available items for each type
    getAvailableItems(type: string): string[] {
        const itemsMap: Record<string, string[]> = {
            exterior: ['cement', 'rod', 'brick', 'sand', 'stone', 'readymix'],
            finish: ['tiles', 'paint', 'plaster', 'waterproofing'],
            interior: ['flooring', 'electrical', 'plumbing', 'doors']
        };

        return itemsMap[type] || [];
    }
}

// Export singleton instance
export const materialsAPI = new MaterialsAPIClient();

// Export class for custom instances
export default MaterialsAPIClient;