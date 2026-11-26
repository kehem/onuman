import ExcelJS from 'exceljs'

export interface WorkbookCell {
  value: string
  colSpan: number
  rowSpan: number
  style: Record<string, string | number>
}

export interface WorkbookRow {
  cells: WorkbookCell[]
  height?: number
}

export interface WorkbookSheet {
  name: string
  columns: number[]
  rows: WorkbookRow[]
}

type FormulaCache = Map<string, number>

const colorValue = (color?: { argb?: string }): string | undefined =>
  color?.argb ? `#${color.argb.slice(-6)}` : undefined

const borderStyle = (style?: string): string | undefined => {
  if (!style) return undefined
  if (style === 'double') return '3px double'
  if (style === 'medium' || style === 'thick') return '2px solid'
  if (style === 'dashed' || style === 'dotted' || style === 'hair') {
    return `1px ${style === 'hair' ? 'dotted' : style}`
  }
  return '1px solid'
}

const styleForCell = (cell: ExcelJS.Cell): Record<string, string | number> => {
  const style: Record<string, string | number> = {}
  const fill = cell.fill
  if (fill?.type === 'pattern' && fill.pattern === 'solid') {
    const backgroundColor = colorValue(fill.fgColor)
    if (backgroundColor) style.backgroundColor = backgroundColor
  }

  const font = cell.font
  if (font?.bold) style.fontWeight = 'bold'
  if (font?.italic) style.fontStyle = 'italic'
  if (font?.size) style.fontSize = `${font.size * (4 / 3)}px`
  const fontColor = colorValue(font?.color)
  if (fontColor) style.color = fontColor

  const alignment = cell.alignment
  const horizontal = alignment?.horizontal
  if (horizontal === 'left' || horizontal === 'center' || horizontal === 'right') {
    style.textAlign = horizontal
  }
  const vertical = alignment?.vertical
  if (vertical === 'top' || vertical === 'middle' || vertical === 'bottom') {
    style.verticalAlign = vertical === 'middle' ? 'middle' : vertical
  }
  if (alignment?.wrapText) style.whiteSpace = 'pre-wrap'

  const sides: Array<[keyof ExcelJS.Borders, string]> = [
    ['top', 'borderTop'],
    ['right', 'borderRight'],
    ['bottom', 'borderBottom'],
    ['left', 'borderLeft']
  ]
  for (const [sideName, cssName] of sides) {
    const side = cell.border?.[sideName]
    if (!side) continue
    const cssBorder = borderStyle(side.style)
    if (!cssBorder) continue
    const color = colorValue(side.color)
    style[cssName] = `${cssBorder} ${color || '#9ba3af'}`
  }

  return style
}

const decodeAddress = (address: string): { row: number; column: number } => {
  const match = /^\$?([A-Z]+)\$?(\d+)$/i.exec(address)
  if (!match) throw new Error(`Unsupported workbook cell address: ${address}`)

  const column = match[1]
    .toUpperCase()
    .split('')
    .reduce((value, letter) => value * 26 + letter.charCodeAt(0) - 64, 0)
  return { row: Number(match[2]), column }
}

const encodeAddress = (row: number, column: number): string => {
  let remaining = column
  let letters = ''
  while (remaining > 0) {
    const digit = (remaining - 1) % 26
    letters = String.fromCharCode(65 + digit) + letters
    remaining = Math.floor((remaining - 1) / 26)
  }
  return `${letters}${row}`
}

const evaluateCell = (
  worksheet: ExcelJS.Worksheet,
  address: string,
  cache: FormulaCache,
  visiting: Set<string>
): number => {
  if (cache.has(address)) return cache.get(address)!
  if (visiting.has(address)) throw new Error(`Circular formula reference at ${address}`)

  const cell = worksheet.getCell(address)
  if (!cell.formula) {
    return typeof cell.value === 'number' && Number.isFinite(cell.value) ? cell.value : 0
  }

  visiting.add(address)
  const value = evaluateFormula(worksheet, cell.formula, cache, visiting)
  visiting.delete(address)
  cache.set(address, value)
  return value
}

const evaluateFormula = (
  worksheet: ExcelJS.Worksheet,
  expression: string,
  cache: FormulaCache,
  visiting: Set<string>
): number => {
  const formula = expression.trim().replace(/^=/, '')
  const rounded = /^ROUND\((.*),\s*2\)$/i.exec(formula)
  if (rounded) {
    const value = evaluateFormula(worksheet, rounded[1], cache, visiting)
    return (Math.sign(value) * Math.round((Math.abs(value) + Number.EPSILON) * 100)) / 100
  }

  const sum = /^SUM\((.*)\)$/i.exec(formula)
  if (sum) {
    return sum[1].split(',').reduce((total, rawArgument) => {
      const argument = rawArgument.trim()
      if (argument.includes(':')) {
        const [startAddress, endAddress] = argument.split(':')
        const start = decodeAddress(startAddress)
        const end = decodeAddress(endAddress)
        for (let row = start.row; row <= end.row; row += 1) {
          for (let column = start.column; column <= end.column; column += 1) {
            total += evaluateCell(worksheet, encodeAddress(row, column), cache, visiting)
          }
        }
        return total
      }
      return total + evaluateCell(worksheet, argument.replace(/\$/g, ''), cache, visiting)
    }, 0)
  }

  if (/^\$?[A-Z]+\$?\d+$/i.test(formula)) {
    return evaluateCell(worksheet, formula.replace(/\$/g, '').toUpperCase(), cache, visiting)
  }

  if (formula.includes('*')) {
    return formula.split('*').reduce((product, rawFactor) => {
      const factor = rawFactor.trim()
      const numericReference = /^N\((\$?[A-Z]+\$?\d+)\)$/i.exec(factor)
      const reference = /^(\$?[A-Z]+\$?\d+)$/i.exec(factor)
      const number = Number(factor)
      if (numericReference) {
        return (
          product *
          evaluateCell(
            worksheet,
            numericReference[1].replace(/\$/g, '').toUpperCase(),
            cache,
            visiting
          )
        )
      }
      if (reference) {
        return (
          product *
          evaluateCell(worksheet, reference[1].replace(/\$/g, '').toUpperCase(), cache, visiting)
        )
      }
      if (Number.isFinite(number)) return product * number
      throw new Error(`Unsupported workbook formula: =${formula}`)
    }, 1)
  }

  throw new Error(`Unsupported workbook formula: =${formula}`)
}

const formatNumber = (value: number, numberFormat: string): string => {
  if (!numberFormat || numberFormat === 'General') return String(value)
  const prefix = /^"([^"]*)"/.exec(numberFormat)?.[1] || ''
  const decimalPlaces = /\.(0+)/.exec(numberFormat)?.[1].length || 0
  const useGrouping = numberFormat.includes(',')
  const formatted = value.toLocaleString('en-US', {
    useGrouping,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  })
  return `${prefix}${formatted}`
}

const displayValue = (
  cell: ExcelJS.Cell,
  worksheet: ExcelJS.Worksheet,
  cache: FormulaCache
): string => {
  if (cell.formula) {
    return formatNumber(evaluateCell(worksheet, cell.address, cache, new Set()), cell.numFmt)
  }

  const value = cell.value
  if (value == null) return ''
  if (typeof value === 'number') return formatNumber(value, cell.numFmt)
  if (typeof value === 'string' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return value.toLocaleDateString()
  if ('richText' in value) return value.richText.map((item) => item.text).join('')
  if ('text' in value) return value.text
  if ('error' in value) return value.error
  return ''
}

const decodeRange = (
  range: string
): {
  start: { row: number; column: number }
  end: { row: number; column: number }
} => {
  const [startAddress, endAddress = startAddress] = range.split(':')
  return {
    start: decodeAddress(startAddress),
    end: decodeAddress(endAddress)
  }
}

export const parseExcelWorkbook = async (
  bytes: Uint8Array | ArrayBuffer
): Promise<WorkbookSheet> => {
  const workbook = new ExcelJS.Workbook()
  const arrayBuffer = new Uint8Array(bytes).buffer
  await workbook.xlsx.load(arrayBuffer)

  const worksheet = workbook.worksheets[0]
  if (!worksheet) throw new Error('The Excel report contains no worksheets')

  const mergedRanges = new Map<string, { colSpan: number; rowSpan: number }>()
  const mergedCells = new Set<string>()
  for (const range of worksheet.model.merges) {
    const { start, end } = decodeRange(range)
    mergedRanges.set(`${start.row}:${start.column}`, {
      colSpan: end.column - start.column + 1,
      rowSpan: end.row - start.row + 1
    })
    for (let row = start.row; row <= end.row; row += 1) {
      for (let column = start.column; column <= end.column; column += 1) {
        if (row !== start.row || column !== start.column) {
          mergedCells.add(`${row}:${column}`)
        }
      }
    }
  }

  const formulaCache: FormulaCache = new Map()
  const rows: WorkbookRow[] = []
  for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const cells: WorkbookCell[] = []
    for (let columnNumber = 1; columnNumber <= worksheet.columnCount; columnNumber += 1) {
      const key = `${rowNumber}:${columnNumber}`
      if (mergedCells.has(key)) continue

      const cell = worksheet.getCell(rowNumber, columnNumber)
      const merge = mergedRanges.get(key)
      cells.push({
        value: displayValue(cell, worksheet, formulaCache),
        colSpan: merge?.colSpan || 1,
        rowSpan: merge?.rowSpan || 1,
        style: styleForCell(cell)
      })
    }

    const height = worksheet.getRow(rowNumber).height
    rows.push({ cells, height: height ? height * (4 / 3) : undefined })
  }

  const columns = Array.from({ length: worksheet.columnCount }, (_, index) => {
    const width = worksheet.getColumn(index + 1).width
    return width ? width * 7 : 100
  })

  return { name: worksheet.name, columns, rows }
}

export const filenameFromDisposition = (
  disposition: string | undefined,
  fallback: string
): string => {
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition || '')
  if (!match?.[1]) return fallback
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}
