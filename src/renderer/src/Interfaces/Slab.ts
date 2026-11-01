// interfaces/Slab.ts

export interface Pile {
  id: number
  name: string
  cards: number[]
}

export interface ActionProps {
  type: string
  pileID: number
}

// Updated Reinforcement interface to match the component
export interface Reinforcement {
  id?: string
  support?: boolean
  length: string
  length_original: string
  horizontal_diameter: number
  horizontal_distance: string
  horizontal_distance_original: string
  width: string
  width_original: string
  vertical_diameter: number
  vertical_distance: string
  vertical_distance_original: string

  // Legacy properties (keep for backward compatibility)
  qty?: string
  diameter?: number
  weight?: number
  horizontal?: string
  horizontal_original?: string
  vertical?: string
  vertical_original?: string
}

// TOPBAR
export interface TopBar {
  support?: boolean
  length: string
  length_original: string
  diameter: number
  distance: string
  distance_original: string
}

// CRANKBAR
export interface CrankBar {
  support?: boolean
  length: string
  length_original: string
  diameter: number
  distance: string
  distance_original: string
}

export interface Stirrup {
  deduction: string
  diameter: string
  length?: string
  weight?: number
  height?: string
  deduction_original: string
  diameter_original: string
  length_original?: string
  weight_original?: string
  height_original: string
}

// PILE
export interface SlabItem {
  id: number
  projectId: number
  type: string
  name: string
  diameter_original: string
  diameter?: number
  width_original: string
  width: number
  length_original: string
  length: number
  height_original: string
  height: number
  slab_base_original: string
  slab_base: number
  quantity: number
  thickness?: number
  thickness_original?: string
  area: number
  area_original: string
  volume: number
  imageUrl?: string | null
  preset?: boolean
  created_at: string
  updated_at: string
  floor: string
  top_bar: TopBar[]
  crank_bar: CrankBar[]

  reinforcements?: Reinforcement[]
}

// REINFORCEMENT COMPONENT
export interface OnlyReinforcement {
  rod_qty: number
  rod_diameter: number
  support?: boolean
  weight: number
}

export interface OnlyStirrups {
  pileName: string
  stirrups: {
    diameter: number
    deduction: number
    weight: number
    total_ring: number
    height?: number
  }[]
}

// RCC
export interface MaterialCost {
  id: number
  name: string
  price: number
}

export interface RCC {
  mix_ratio: {
    brick: number
    sand: number
    cement: number
    stone: number
    comment?: string
  }

  dry_mixture: number
  brick_volume: number
  sand_volume: number
  cement_volume: number
  stone_volume: number
  cement_bag: number
  brick_pcs: number
  cement_price: number
  sand_price: number
  stone_price: number
  brick_price: number
  total_price_brick: number
  total_price_stone: number
  ready_mixture_5: number
  ready_mixture_total: number
  materials_cost: MaterialCost[]
}
