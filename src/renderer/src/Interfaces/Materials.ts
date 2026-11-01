export interface MaterialWithPrice {
    type?: string;
    quantity?: string;
    price_amount: number;
    price_unit: string;
    purpose: string;
}

export interface Additive {
    price_amount: number;
    price_unit: string;
    purpose: string;
}

export interface AuxiliaryMaterial extends Additive {
    quantity?: string;
}

export interface Plastering {
    basic_materials: {
        cement: MaterialWithPrice;
        sand: MaterialWithPrice;
        lime: MaterialWithPrice;
        water: MaterialWithPrice;
    };
    additives: {
        plasticizers: Additive;
        bonding_agents: Additive;
        waterproofing_agents: Additive;
    };
}

export interface Painting {
    basic_materials: {
        primer: MaterialWithPrice;
        wall_paint: MaterialWithPrice & {
            types: string[];
            brands: string[];
        };
        textured_paint: Additive;
    };
    additives: {
        anti_mold_additive: Additive;
        anti_fungal_additive: Additive;
        thinner: Additive;
    };
    auxiliary_materials: {
        wall_fillers_or_putty: Additive;
        masking_tape: Additive;
        painters_rags: Additive;
        sandpaper: Additive;
        painting_rollers_and_brushes: AuxiliaryMaterial;
        paint_trays: Additive;
    };
}

export interface EstimatedQuantities {
    plastering: {
        cement: string;
        sand: string;
        lime: string;
        water: string;
        purpose: string;
    };
    painting: {
        primer: string;
        paint: string;
        putty: string;
        sandpaper: string;
        brushes_or_rollers: string;
        purpose: string;
    };
}

export interface ConstructionData {
    plastering: Plastering;
    painting: Painting;
    estimated_quantities: EstimatedQuantities;
}
