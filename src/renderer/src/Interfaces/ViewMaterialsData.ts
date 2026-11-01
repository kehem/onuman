// interfaces/ViewMaterialsData.ts
/* ------------------------------------------
 * INTERFACES
 * ------------------------------------------ */
export interface Material {
  id: number;
  company_name: string;
  unit: string;
  quantity: string;
  price: string;
  imageUrl: string;
  created_at: string;
  updated_at: string;
  main_item: number;
}

export interface SubMaterial {
  id: number;
  materials: Material[];
  type: 'exterior' | 'interior' | 'finish';
  name: string;
  created_at: string;
  updated_at: string;
  org: number;
}

export interface RootObject {
  sub_materials: SubMaterial[];
  selected: number[];
}


// Interface for Mix Ratio
export interface MixRatioItem {
  type: 'exterior' | 'finish' | 'interior';
  brick: number;
  sand: number;
  cement: number;
  stone: number;
  comment: string;
}