// interfaces/BPP.ts

export interface ActionProps {
  type: string
  pileID: number
}
// BRICK, PLUSTER, PAINT
export interface BPP {
  id: number
  projectId: number
  selectedFloors: [number]
  floor: number
  type: string
  name: string
  wall_side?: string
  diameter_original: string
  diameter?: number
  thickness_original: string
  thickness?: number
  length_original: string
  length?: number
  height_original: string
  height: number
  quantity: number
  area: number
  total_area?: number
  volume: number
  imageUrl?: string | null
  preset: boolean
  created_at: string
  updated_at: string
  selectedPile?: string
  brick_pcs?: number
  pp_volume?: number
  width?: number
  width_original?: string
  total_frame_length?: number
}
export interface Options {
  name: string
  projectId: number
  id: number
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
