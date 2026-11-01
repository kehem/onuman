// interfaces/Tiles.ts

export interface ActionProps {
  type: string
  pileID: number
}

export interface TilesItem {
  id: number
  projectId: number
  selectedFloors: [number]
  floor: number
  column_type: string
  beam_type: string
  type: string
  tiles_type?: string
  name: string
  amount: number
  diameter_original: string
  diameter?: number
  width_original: string
  width?: number
  length_original: string
  length?: number
  height_original: string
  height: number
  stair_height_original: string
  stair_height: number
  labour_bill: number
  quantity: number
  area: number
  area_original: string
  volume: number
  imageUrl?: string | null
  preset: boolean
  created_at: string
  updated_at: string
  selectedPile?: string
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
