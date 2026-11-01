// stores/unitStore.ts
import { defineStore } from 'pinia'

export const useUnitStore = defineStore('unitStore', {
  state: () => ({
    targetUnit: 'mm'
  }),
  actions: {
    setTargetUnit(unit: string) {
      this.targetUnit = unit
    },
    convertUnit(fromUnit: string, value: number, dimension: number = 1): number {
      const conversionRates: Record<string, number> = {
        mm: 1,
        cm: 0.1,
        m: 0.001,
        in: 0.0393701,
        ft: 0.00328084,
        yd: 0.00109361
      }

      const fromRate = conversionRates[fromUnit]
      const toRate = conversionRates[this.targetUnit]
      if (!fromRate || !toRate) return value

      const fromRatePowered = Math.pow(fromRate, dimension)
      const toRatePowered = Math.pow(toRate, dimension)

      return (value / fromRatePowered) * toRatePowered
    }
  },
  persist: true
})
