/* eslint-disable @typescript-eslint/no-require-imports */

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'CommonJS', moduleResolution: 'node' }
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const ExcelJS = require('exceljs')
const { parseExcelWorkbook } = require('../src/renderer/src/pages/Reports/Utils/excelWorkbook.ts')

test('parses the generated worksheet, merged cells, and formula results', async () => {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Onuman')
  sheet.mergeCells('A1:C1')
  sheet.getCell('A1').value = 'Estimation Report'
  sheet.getCell('A2').value = 2
  sheet.getCell('B2').value = 3
  sheet.getCell('C2').value = { formula: 'ROUND(A2*B2,2)' }
  sheet.getCell('C2').numFmt = '#,##0.00'
  sheet.getCell('A3').value = 1
  sheet.getCell('A4').value = 2
  sheet.getCell('B4').value = { formula: 'ROUND(SUM(A3:A4),2)' }
  sheet.getCell('B4').numFmt = '#,##0.00'

  const bytes = Buffer.from(await workbook.xlsx.writeBuffer())
  const displayed = await parseExcelWorkbook(bytes)

  assert.equal(displayed.name, 'Onuman')
  assert.equal(displayed.rows[0].cells[0].value, 'Estimation Report')
  assert.equal(displayed.rows[0].cells[0].colSpan, 3)
  assert.equal(displayed.rows[1].cells[2].value, '6.00')
  assert.equal(displayed.rows[3].cells[1].value, '3.00')
})

test('rejects invalid workbook data instead of showing an empty report', async () => {
  await assert.rejects(parseExcelWorkbook(new Uint8Array()))
})
