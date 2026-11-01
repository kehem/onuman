export interface MaterialCost {
  id: number
  name: string
  price: number
}

// PROJECT DETAILS
export interface Material {
  name: string
  price: string
}

export interface MixRatio {
  cement: number
  sand: number
  stone: number
  brick: number
  comment: string
}

// JSON FETCH
export interface WelcomeData {
  date: string
  time: string
}
export interface Project {
  company: number
  id: number
  projectName: string
  startDate: string // ISO format: YYYY-MM-DD
  endDate: string
  clientName: string
  clientAddress: string
  clientPhone: string
  buildingType: string
  totalFloor: number
  totalUnit: number
  projectImage: string
  onumanStart: string
  projectDescription: string
  projectStatus: string
  materials: Material[]
  mixRatio: MixRatio,
  isExterior: boolean,
  isFinish: boolean,
  isInterior: boolean,
}
