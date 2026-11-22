require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'CommonJS', moduleResolution: 'node' }
})
const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  pruneRows,
  resolveDisplay,
  materialKey,
  formatQty,
  formatMoney
} = require('../src/renderer/src/pages/Reports/Utils/workbookDisplay.ts')

// DOCUMENT WITH TWO PARTS, AN EMPTY PART TO PRUNE AND A SUMMARY BLOCK
const doc = {
  currency: 'Tk',
  rows: [
    // EMPTY PART - MUST BE PRUNED TOGETHER WITH ITS ITEM
    { k: 'part', label: 'Part Empty' },
    { k: 'item', sl: '09', desc: 'Empty item' },

    // PART A: MEASUREMENTS COMPUTED LIKE THE WORKBOOK FORMULAS
    { k: 'part', label: 'Part A' },
    { k: 'item', sl: '01', desc: 'Earth work' },
    { k: 'm', label: 'Building Area', no: 1, l: 18, w: 11 }, // -> 198.00
    { k: 'm', label: 'Extra', no: 2, l: 1, w: 1, h: 1 }, // -> 2.00
    { k: 't', unit: 'SQM' }, // -> 200.00
    { k: 'rate', rate: 19, unit: 'SQM', per: true }, // -> Tk 3,800.00
    { k: 'cost' }, // -> Tk 3,800.00
    { k: 'part_total', label: 'Total A', sum_parts: [] }, // -> Tk 3,800.00

    // PART B: MATERIAL TOTALS DRIVE THE @-RATE
    // (part references in the summary use the ORIGINAL part indexes -
    // the pruned "Part Empty" band above is part 0)
    { k: 'part', label: 'Part B' },
    { k: 'item', sl: '02', desc: 'Cement work' },
    { k: 'mat', label: 'Cement', qty: 10, unit: 'Bags' },
    { k: 'mats' },
    { k: 'mat_total', label: 'Total Cement', qty: 10, unit: 'Bags' },
    { k: 'rate', label: 'Cement', rate: 570, unit: 'Bag', per: true }, // -> Tk 5,700.00
    { k: 'cost' }, // -> Tk 5,700.00
    { k: 'part_total', label: 'Total B', sum_parts: [0] } // -> Tk 9,500.00
  ],
  summary: [
    { label: 'Total A', part: 1 }, // -> Tk 3,800.00
    { label: 'Total B', part: 2 }, // -> Tk 9,500.00
    { label: 'Grand Total', sum_of: [0, 1] } // -> Tk 13,300.00
  ]
}

test('prune drops empty items and empty parts like the workbook writer', () => {
  const { rows, partMap } = pruneRows(doc.rows)
  const labels = rows.map((row) => row.label || row.desc)
  assert.ok(!labels.includes('Part Empty'), 'empty part band must be dropped')
  assert.ok(!labels.includes('Empty item'), 'empty item must be dropped')
  assert.ok(labels.includes('Part A') && labels.includes('Part B'), 'data parts survive')
  assert.equal(partMap.get(0), null, 'first (empty) part maps to null')
  assert.equal(partMap.get(1), 0, 'Part A becomes the first rendered part')
  assert.equal(partMap.get(2), 1, 'Part B becomes the second rendered part')
})

test('measurements compute quantities from the provided dimensions', () => {
  const { rows } = resolveDisplay(doc)
  const measures = rows.filter((d) => d.row.k === 'm')
  assert.equal(measures[0].qty, 198, '1 x 18 x 11 -> 198 (no depth provided)')
  assert.equal(measures[1].qty, 2, '2 x 1 x 1 x 1 -> 2')
  assert.equal(measures[0].showX1, true, 'x shows when No. and a dimension exist')
  assert.equal(measures[0].showX2, true, 'x shows between length and width')
  assert.equal(measures[0].showX3, false, 'no x after width when depth is missing')
})

test('totals sum the measurement group', () => {
  const { rows } = resolveDisplay(doc)
  const total = rows.find((d) => d.row.k === 't')
  assert.equal(total.qty, 200, 'total = 198 + 2')
})

test('rate amounts multiply quantity by rate and cost sums them', () => {
  const { rows } = resolveDisplay(doc)
  const rates = rows.filter((d) => d.row.k === 'rate')
  assert.equal(rates[0].amount, 3800, '200 SQM @ 19 -> 3800')
  assert.equal(rates[1].amount, 5700, '10 Bags cement @ 570 -> 5700')
  const costs = rows.filter((d) => d.row.k === 'cost')
  assert.equal(costs[0].amount, 3800)
  assert.equal(costs[1].amount, 5700)
})

test('part totals roll up the part rates and sum_parts references', () => {
  const { rows } = resolveDisplay(doc)
  const totals = rows.filter((d) => d.row.k === 'part_total')
  assert.equal(totals[0].amount, 3800, 'Part A total = its rate amounts')
  assert.equal(totals[1].amount, 9500, 'Part B total = 5700 + Part A (sum_parts [0])')
})

test('summary lines resolve part references and sum_of chains', () => {
  const { summary } = resolveDisplay(doc)
  assert.deepEqual(
    summary.map((line) => line.amount),
    [3800, 9500, 13300]
  )
  assert.equal(summary[2].label, 'Grand Total')
})

test('summary lines of pruned parts disappear with their part', () => {
  const withEmptySummary = {
    rows: [
      { k: 'part', label: 'Part Empty' },
      { k: 'item', sl: '09', desc: 'Empty item' }
    ],
    summary: [{ label: 'Hidden', part: 0 }]
  }
  const { summary } = resolveDisplay(withEmptySummary)
  assert.equal(summary.length, 0, 'summary entry of a pruned part is dropped')
})

test('explicit amounts win over computed ones', () => {
  const custom = {
    rows: [
      { k: 'part', label: 'Part A' },
      { k: 'item', sl: '01', desc: 'Fixed price item' },
      { k: 'rate', rate: 100, qty: 2, amount: 250, unit: 'SFT', per: true }
    ]
  }
  const { rows } = resolveDisplay(custom)
  assert.equal(rows.find((d) => d.row.k === 'rate').amount, 250)
})

test('materialKey matches the backend normalisation', () => {
  assert.equal(materialKey('Total Cement'), 'cement')
  assert.equal(materialKey('Cement'), 'cement')
  assert.equal(materialKey('Total Sand'), 'sand')
})

test('formatters mirror the workbook number formats', () => {
  assert.equal(formatQty(198), '198.00')
  assert.equal(formatQty(1234.5), '1,234.50')
  assert.equal(formatQty(null), '')
  assert.equal(formatMoney(570, 'Tk'), 'Tk, 570.00')
})
