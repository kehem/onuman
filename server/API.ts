// server/API.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Server } from 'http';

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

// Type definitions for request query parameters
interface MaterialsQuery {
    type?: string;
    item?: string;
}

interface AddMaterialBody {
    type: string;
    item: string;
    material: Omit<Material, 'category'>;
}

class MaterialsAPIServer {
    private app: express.Application;
    private server: Server | null = null;
    private port: number;

    // Sample materials data with proper TypeScript typing
    private materialsData: Record<string, Record<string, Material[]>> = {
        exterior: {
            cement: [
                {
                    name: 'Shah Cement',
                    price: 530,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'cement',
                    unit: 'Beg (50 KG)'
                },
                {
                    name: 'Fresh Cement',
                    price: 525,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'cement',
                    unit: 'Beg (50 KG)'
                },
                {
                    name: 'Crown Cement',
                    price: 540,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'cement',
                    unit: 'Beg (50 KG)'
                },
                {
                    name: 'Akij Cement',
                    price: 520,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'cement',
                    unit: 'Beg (50 KG)'
                }
            ],
            rod: [
                {
                    name: 'BSRM Steel Rod',
                    price: 85,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'rod',
                    unit: 'Per KG'
                },
                {
                    name: 'AKS Steel Rod',
                    price: 82,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'rod',
                    unit: 'Per KG'
                },
                {
                    name: 'GPH Steel Rod',
                    price: 84,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'rod',
                    unit: 'Per KG'
                }
            ],
            brick: [
                {
                    name: 'Red Brick (1st Class)',
                    price: 12,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'brick',
                    unit: 'Per Piece'
                },
                {
                    name: 'Red Brick (2nd Class)',
                    price: 10,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'brick',
                    unit: 'Per Piece'
                }
            ],
            sand: [
                {
                    name: 'Fine Sand (Sylhet)',
                    price: 2500,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'sand',
                    unit: 'Per CFT'
                },
                {
                    name: 'Coarse Sand',
                    price: 2200,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'sand',
                    unit: 'Per CFT'
                }
            ],
            stone: [
                {
                    name: 'Crushed Stone (1 inch)',
                    price: 3000,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'stone',
                    unit: 'Per CFT'
                },
                {
                    name: 'Crushed Stone (3/4 inch)',
                    price: 3200,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'stone',
                    unit: 'Per CFT'
                }
            ],
            readymix: [
                {
                    name: 'Ready Mix Concrete (Grade 20)',
                    price: 4500,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'readymix',
                    unit: 'Per Cubic Meter'
                }
            ]
        },
        finish: {
            tiles: [
                {
                    name: 'Ceramic Floor Tiles',
                    price: 45,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'tiles',
                    unit: 'Per Sq Ft'
                },
                {
                    name: 'Porcelain Tiles',
                    price: 85,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'tiles',
                    unit: 'Per Sq Ft'
                }
            ],
            paint: [
                {
                    name: 'Asian Paints Apex',
                    price: 850,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'paint',
                    unit: 'Per Liter'
                },
                {
                    name: 'Berger Paint',
                    price: 780,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'paint',
                    unit: 'Per Liter'
                }
            ],
            plaster: [
                {
                    name: 'Wall Plaster',
                    price: 25,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'plaster',
                    unit: 'Per Sq Ft'
                }
            ],
            waterproofing: [
                {
                    name: 'Waterproof Coating',
                    price: 450,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'waterproofing',
                    unit: 'Per Liter'
                }
            ]
        },
        interior: {
            flooring: [
                {
                    name: 'Laminate Flooring',
                    price: 120,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'flooring',
                    unit: 'Per Sq Ft'
                }
            ],
            electrical: [
                {
                    name: 'LED Light (20W)',
                    price: 250,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'electrical',
                    unit: 'Per Piece'
                },
                {
                    name: 'Switch Socket',
                    price: 150,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'electrical',
                    unit: 'Per Piece'
                }
            ],
            plumbing: [
                {
                    name: 'PVC Pipe (2 inch)',
                    price: 35,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'plumbing',
                    unit: 'Per Foot'
                }
            ],
            doors: [
                {
                    name: 'Wooden Door (Teak)',
                    price: 8500,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'doors',
                    unit: 'Per Piece'
                },
                {
                    name: 'Aluminum Window',
                    price: 3500,
                    currency: 'BDT',
                    image_url: 'https://www.shahcement.com/storage/backend.pages/nU60I08fY33KUR0k4XMqGsMOtaC10CK733vfiEWX.jpg',
                    category: 'doors',
                    unit: 'Per Sq Ft'
                }
            ]
        }
    };

    constructor(port: number = 3001) {
        this.port = port;
        this.app = express();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddleware(): void {
        // CORS for Electron renderer process
        this.app.use(cors({
            origin: ['http://localhost:3000', 'http://localhost:5173', 'app://'],
            credentials: true
        }));

        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging middleware
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    private initializeRoutes(): void {
        // Health check endpoint
        this.app.get('/health', (req: Request, res: Response) => {
            res.json({
                success: true,
                message: 'Materials API is running',
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            });
        });

        // Get materials by type and item
        this.app.get('/api/materials', this.getMaterials.bind(this));

        // Get all materials for a specific type
        this.app.get('/api/materials/:type', this.getMaterialsByType.bind(this));

        // Get all materials
        this.app.get('/api/materials/all/data', this.getAllMaterials.bind(this));

        // Add new material
        this.app.post('/api/materials', this.addMaterial.bind(this));

        // Update material
        this.app.put('/api/materials/:type/:item/:name', this.updateMaterial.bind(this));

        // Delete material
        this.app.delete('/api/materials/:type/:item/:name', this.deleteMaterial.bind(this));
    }

    private getMaterials(req: Request<{}, MaterialsResponse | ApiError, {}, MaterialsQuery>, res: Response): void {
        try {
            const { type, item } = req.query;

            if (!type || !item) {
                res.status(400).json({
                    success: false,
                    message: 'Type and item parameters are required',
                    data: []
                });
                return;
            }

            const materials = this.materialsData[type]?.[item] || [];

            res.json({
                success: true,
                message: `Found ${materials.length} materials for ${type} - ${item}`,
                data: materials
            });
        } catch (error) {
            console.error('Error fetching materials:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: []
            });
        }
    }

    private getMaterialsByType(req: Request, res: Response): void {
        try {
            const { type } = req.params;

            if (!this.materialsData[type]) {
                res.status(404).json({
                    success: false,
                    message: `Material type '${type}' not found`,
                    data: {}
                });
                return;
            }

            res.json({
                success: true,
                message: `Materials for ${type}`,
                data: this.materialsData[type]
            });
        } catch (error) {
            console.error('Error fetching materials by type:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: {}
            });
        }
    }

    private getAllMaterials(req: Request, res: Response): void {
        try {
            res.json({
                success: true,
                message: 'All materials retrieved successfully',
                data: this.materialsData
            });
        } catch (error) {
            console.error('Error fetching all materials:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: {}
            });
        }
    }

    private addMaterial(req: Request<{}, any, AddMaterialBody>, res: Response): void {
        try {
            const { type, item, material } = req.body;

            if (!type || !item || !material) {
                res.status(400).json({
                    success: false,
                    message: 'Type, item, and material data are required'
                });
                return;
            }

            // Initialize nested structure if it doesn't exist
            if (!this.materialsData[type]) {
                this.materialsData[type] = {};
            }
            if (!this.materialsData[type][item]) {
                this.materialsData[type][item] = [];
            }

            // Add the new material with category
            const newMaterial: Material = {
                ...material,
                category: item
            };

            this.materialsData[type][item].push(newMaterial);

            res.status(201).json({
                success: true,
                message: 'Material added successfully',
                data: newMaterial
            });
        } catch (error) {
            console.error('Error adding material:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    private updateMaterial(req: Request, res: Response): void {
        try {
            const { type, item, name } = req.params;
            const updatedMaterial = req.body;

            const materials = this.materialsData[type]?.[item];
            if (!materials) {
                res.status(404).json({
                    success: false,
                    message: 'Material category not found'
                });
                return;
            }

            const materialIndex = materials.findIndex(m => m.name === name);
            if (materialIndex === -1) {
                res.status(404).json({
                    success: false,
                    message: 'Material not found'
                });
                return;
            }

            // Update material
            materials[materialIndex] = {
                ...materials[materialIndex],
                ...updatedMaterial,
                category: item // Ensure category remains correct
            };

            res.json({
                success: true,
                message: 'Material updated successfully',
                data: materials[materialIndex]
            });
        } catch (error) {
            console.error('Error updating material:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    private deleteMaterial(req: Request, res: Response): void {
        try {
            const { type, item, name } = req.params;

            const materials = this.materialsData[type]?.[item];
            if (!materials) {
                res.status(404).json({
                    success: false,
                    message: 'Material category not found'
                });
                return;
            }

            const materialIndex = materials.findIndex(m => m.name === name);
            if (materialIndex === -1) {
                res.status(404).json({
                    success: false,
                    message: 'Material not found'
                });
                return;
            }

            // Remove material
            const deletedMaterial = materials.splice(materialIndex, 1)[0];

            res.json({
                success: true,
                message: 'Material deleted successfully',
                data: deletedMaterial
            });
        } catch (error) {
            console.error('Error deleting material:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    private initializeErrorHandling(): void {
        // 404 handler
        this.app.use('*', (req: Request, res: Response) => {
            res.status(404).json({
                success: false,
                message: `Endpoint ${req.method} ${req.baseUrl} not found`
            });
        });

        // Global error handler
        this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.error('Unhandled error:', err);
            res.status(500).json({
                success: false,
                message: 'Something went wrong!',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        });
    }

    public async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.port, () => {
                    console.log(`🚀 Materials API Server started on http://localhost:${this.port}`);
                    console.log(`📋 Available endpoints:`);
                    console.log(`   GET  /health`);
                    console.log(`   GET  /api/materials?type=exterior&item=cement`);
                    console.log(`   GET  /api/materials/:type`);
                    console.log(`   GET  /api/materials/all/data`);
                    console.log(`   POST /api/materials`);
                    console.log(`   PUT  /api/materials/:type/:item/:name`);
                    console.log(`   DELETE /api/materials/:type/:item/:name`);
                    resolve();
                });

                this.server.on('error', (error: Error) => {
                    console.error('Server error:', error);
                    reject(error);
                });
            } catch (error) {
                console.error('Failed to start server:', error);
                reject(error);
            }
        });
    }

    public async stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.server) {
                this.server.close((error) => {
                    if (error) {
                        console.error('Error stopping server:', error);
                        reject(error);
                    } else {
                        console.log('🛑 Materials API Server stopped');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    public getApp(): express.Application {
        return this.app;
    }

    public isRunning(): boolean {
        return this.server !== null && this.server.listening;
    }
}

// Export singleton instance
export const materialsAPIServer = new MaterialsAPIServer();

// Export class for custom instances
export default MaterialsAPIServer;
