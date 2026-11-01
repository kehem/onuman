// interfaces/Pile.ts

export interface Beam {
  id: number
  name: string
  cards: number[]
}

export interface ActionProps {
  type: string
  pileID: number
}

export interface Reinforcement {
  id?: string
  qty: string
  diameter: number
  support?: boolean
  weight?: number
  height: string
  height_original: string
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
export interface BeamItem {
  id: number
  projectId: number
  selectedFloors: [number]
  floor: number
  column_type: string
  beam_type: string
  type: string
  name: string
  diameter_original: string
  diameter?: number
  width_original: string
  width?: number
  length_original: string
  length?: number
  height_original: string
  height: number
  clear_cover_original: string
  clear_cover: number
  quantity: number
  area: number
  volume: number
  imageUrl?: string | null
  preset: boolean
  created_at: string
  updated_at: string
  reinforcements?: {
    rod_qty: number
    rod_diameter: number
    support: boolean
    weight?: number
    height: number
    height_original: string
  }[]
  stirrups?: {
    deduction: string
    deduction_original: string
    diameter: string
    diameter_original: string
    height: string
    height_original: string
    length?: string
    length_original?: string
    weight?: string
    weight_original?: string
    total_ring?: string
  }[]
  selectedPile?: string
}

// REINFORCEMENT COMPONENT
export interface OnlyReinforcement {
  columnName: string
  rod_qty: number
  rod_diameter: number
  support?: boolean
  weight: number
}

export interface GroupedReinforcement {
  columnName?: string
  beamName?: string
  reinforcements: OnlyReinforcement[]
}

export interface OnlyStirrups {
  columnName: string
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
