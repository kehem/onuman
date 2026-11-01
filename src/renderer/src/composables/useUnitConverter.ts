// composables/useUnitConverter.ts
import { ref } from 'vue'

export function useUnitConverter() {
  const originalInputs = ref<Record<string, string>>({})

  // Linear units to mm
  const unitToMm: Record<string, number> = {
    mm: 1,
    cm: 10,
    m: 1000,
    in: 25.4,
    inch: 25.4,
    inches: 25.4,
    ft: 304.8,
    feet: 304.8,
    feets: 304.8,
    yd: 914.4,
    yard: 914.4,
    yards: 914.4
  }

  // Square units to mm²
  const unitToMm2: Record<string, number> = {
    smm: 1,
    scm: 100,
    sm: 1000000,
    sin: 645.16,
    sinch: 645.16,
    sinches: 645.16,
    sft: 92903.04,
    sfeet: 92903.04,
    sfeets: 92903.04,
    syd: 836127.36,
    syard: 836127.36,
    syards: 836127.36
  }

  // Cubic units to mm³
  const unitToMm3: Record<string, number> = {
    cmm: 1,
    ccm: 1000,
    cm: 1000000000,
    cin: 16387.064,
    cinch: 16387.064,
    cinches: 16387.064,
    cft: 28316846.592,
    cfeet: 28316846.592,
    cfeets: 28316846.592,
    cyd: 764554857.984,
    cyard: 764554857.984,
    cyards: 764554857.984
  }

  const convertToMm = (
    input: string,
    name: string,
    defaultUnit?: string
  ): { result: string | null; originalInputs: string } => {
    if (!input.trim()) {
      originalInputs.value[name] = 'Input is required e.g. 5ft 2in or 10sft or 5cyd'
      return { result: null, originalInputs: originalInputs.value[name] }
    }

    // Handle feet and inches like 4' 5" (only for linear measurements)
    const feetInchMatch = input.trim().match(/^(\d+(?:\.\d+)?)[′']\s*(\d*(?:\.\d+)?)?["″]?$/)
    if (feetInchMatch) {
      const feet = parseFloat(feetInchMatch[1])
      const inches = feetInchMatch[2] ? parseFloat(feetInchMatch[2]) : 0
      const mm = feet * unitToMm.ft + inches * unitToMm.in
      const originalInput = `${feet} ft${inches > 0 ? ` ${inches} in` : ''}`
      originalInputs.value[name] = originalInput
      return { result: `${mm.toFixed(2)} mm`, originalInputs: originalInputs.value[name] }
    }

    // Check if input is just a number (no units specified)
    const numberOnlyMatch = input.trim().match(/^(\d+(?:\.\d+)?)$/)
    if (numberOnlyMatch && defaultUnit) {
      const val = parseFloat(numberOnlyMatch[1])
      const unit = defaultUnit.toLowerCase()

      // Convert using the default unit
      if (unitToMm3[unit]) {
        const totalCubic = val * unitToMm3[unit]
        const displayUnit = defaultUnit.startsWith('c') ? defaultUnit.substring(1) + '³' : defaultUnit
        originalInputs.value[name] = `${val} ${displayUnit}`
        return { result: `${totalCubic.toFixed(2)} mm³`, originalInputs: originalInputs.value[name] }
      } else if (unitToMm2[unit]) {
        const totalSquare = val * unitToMm2[unit]
        const displayUnit = defaultUnit.startsWith('s') ? defaultUnit.substring(1) + '²' : defaultUnit
        originalInputs.value[name] = `${val} ${displayUnit}`
        return { result: `${totalSquare.toFixed(2)} mm²`, originalInputs: originalInputs.value[name] }
      } else if (unitToMm[unit]) {
        const totalLinear = val * unitToMm[unit]
        originalInputs.value[name] = `${val} ${defaultUnit}`
        return { result: `${totalLinear.toFixed(2)} mm`, originalInputs: originalInputs.value[name] }
      } else {
        originalInputs.value[name] = `Unrecognized default unit: "${defaultUnit}".`
        return { result: null, originalInputs: originalInputs.value[name] }
      }
    }

    const parts = input
      .trim()
      .replace(/(\d)([a-zA-Z])/g, '$1 $2')
      .split(/\s+/)

    let totalLinear = 0
    let totalSquare = 0
    let totalCubic = 0
    let hasLinear = false
    let hasSquare = false
    let hasCubic = false

    for (let i = 0; i < parts.length; i += 2) {
      const val = parseFloat(parts[i])
      const unit = parts[i + 1]?.toLowerCase() || 'mm'

      if (isNaN(val)) {
        originalInputs.value[name] = `Invalid number: "${parts[i]}".`
        return { result: null, originalInputs: originalInputs.value[name] }
      }

      // Check unit type and convert accordingly
      if (unitToMm3[unit]) {
        totalCubic += val * unitToMm3[unit]
        hasCubic = true
      } else if (unitToMm2[unit]) {
        totalSquare += val * unitToMm2[unit]
        hasSquare = true
      } else if (unitToMm[unit]) {
        totalLinear += val * unitToMm[unit]
        hasLinear = true
      } else {
        originalInputs.value[name] = `Unrecognized unit: "${unit}". Allowed units: Linear: mm, cm, m, in, ft, yd; Square: smm, scm, sm, sin, sft, syd; Cubic: cmm, ccm, cm, cin, cft, cyd.`
        return { result: null, originalInputs: originalInputs.value[name] }
      }
    }

    // Check if mixing different unit types
    const typeCount = [hasLinear, hasSquare, hasCubic].filter(Boolean).length
    if (typeCount > 1) {
      originalInputs.value[name] = 'Cannot mix linear, square, and cubic units in the same input.'
      return { result: null, originalInputs: originalInputs.value[name] }
    }

    // Store the original input for display with proper formatting
    const formattedParts: string[] = []
    for (let i = 0; i < parts.length; i += 2) {
      const val = parts[i]
      let unit = parts[i + 1] || 'mm'

      // Convert square and cubic unit notation
      if (unit.startsWith('s') && unitToMm2[unit]) {
        // Square units: sft -> ft²
        unit = unit.substring(1) + '²'
      } else if (unit.startsWith('c') && unitToMm3[unit]) {
        // Cubic units: cft -> ft³
        unit = unit.substring(1) + '³'
      }

      formattedParts.push(`${val} ${unit}`)
    }

    originalInputs.value[name] = formattedParts.join(' ')

    // Return appropriate result based on unit type
    if (hasCubic) {
      return { result: `${totalCubic.toFixed(2)} mm³`, originalInputs: originalInputs.value[name] }
    } else if (hasSquare) {
      return { result: `${totalSquare.toFixed(2)} mm²`, originalInputs: originalInputs.value[name] }
    } else {
      return { result: `${totalLinear.toFixed(2)} mm`, originalInputs: originalInputs.value[name] }
    }
  }

  return { convertToMm, originalInputs }
}