<!-- /src/pages/Reports/Components/ReportWorkbookView.vue -->
<!--
  Workbook-style view of the report document returned by
  POST /api/report/final_report/document.

  Renders the same layout the backend Excel writer produces
  (onuman-private: report/excel_report.py) - title block, the
  Sl No. -> Notes column grid, every row kind, and the closing
  summary block - so "what the user sees on screen is exactly
  what the workbook contains".
-->
<template>
  <div class="workbook-scroll onuman-insider-scrollbar">
    <div class="workbook-sheet">
      <!-- TITLE BLOCK -->
      <div class="wb-title">{{ doc.title || defaultTitle }}</div>
      <div class="wb-banner wb-company" v-if="doc.company">{{ doc.company }}</div>
      <div class="wb-banner wb-project" v-if="doc.project">{{ doc.project }}</div>
      <div class="wb-banner wb-description" v-if="doc.description">{{ doc.description }}</div>
      <div class="wb-banner wb-address" v-if="doc.address">{{ doc.address }}</div>
      <div class="wb-spacer"></div>

      <div class="wb-meta-line" v-if="doc.est_no || doc.date">
        <span class="wb-meta-left">Est No. - {{ doc.est_no }}</span>
        <span class="wb-meta-right">
          <span class="wb-meta-label">Date</span>
          <span class="wb-meta-value">{{ doc.date || '' }}</span>
        </span>
      </div>
      <div class="wb-meta-line" v-if="doc.client || doc.architect">
        <span class="wb-meta-left">
          <span class="wb-meta-label">Client</span>
          <span class="wb-meta-value">{{ doc.client }}</span>
        </span>
        <span class="wb-meta-right">
          <span class="wb-meta-label">Executive Architect</span>
          <span class="wb-meta-value">{{ doc.architect }}</span>
        </span>
      </div>
      <div class="wb-spacer"></div>

      <!-- GRID -->
      <table class="wb-table">
        <colgroup>
          <col v-for="(col, index) in COLUMNS" :key="index" :style="{ width: col + 'px' }" />
        </colgroup>
        <thead>
          <tr class="wb-head">
            <th>Sl No.</th>
            <th>Description</th>
            <th>No.</th>
            <th></th>
            <th>Length</th>
            <th></th>
            <th>Width</th>
            <th></th>
            <th>Depth/Height</th>
            <th></th>
            <th>Quantity</th>
            <th>Unit</th>
            <th></th>
            <th>Rate</th>
            <th></th>
            <th></th>
            <th>Amount</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(d, index) in display.rows" :key="index">
            <!-- part band -->
            <tr v-if="d.row.k === 'part'" class="wb-part">
              <td colspan="18">{{ d.row.label }}</td>
            </tr>

            <!-- item description -->
            <tr v-else-if="d.row.k === 'item'" class="wb-item">
              <td class="cell-center cell-bold">{{ d.row.sl }}</td>
              <td class="cell-wrap cell-bold">{{ d.row.desc }}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="cell-notes">{{ d.row.notes }}</td>
            </tr>

            <!-- sub heading -->
            <tr v-else-if="d.row.k === 'sub'" class="wb-sub">
              <td></td>
              <td class="cell-wrap cell-bold">{{ d.row.label }}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="cell-notes">{{ d.row.notes }}</td>
            </tr>

            <!-- measurement -->
            <tr v-else-if="d.row.k === 'm'" class="wb-measure">
              <td></td>
              <td class="cell-wrap" :style="{ paddingLeft: indentPx(d.row.indent) }">
                {{ d.row.label }}
              </td>
              <td class="cell-center">{{ formatInt(d.row.no) }}</td>
              <td class="cell-center">{{ d.showX1 ? 'x' : '' }}</td>
              <td class="cell-right">{{ formatQty(num(d.row.l)) }}</td>
              <td class="cell-center">{{ d.showX2 ? 'x' : '' }}</td>
              <td class="cell-right">{{ formatQty(num(d.row.w)) }}</td>
              <td class="cell-center">{{ d.showX3 ? 'x' : '' }}</td>
              <td class="cell-right">{{ formatQty(num(d.row.h)) }}</td>
              <td class="cell-center">=</td>
              <td class="cell-right" :class="{ 'cell-bold': d.row.bold }">
                {{ formatQty(d.qty) }}
              </td>
              <td class="cell-center">{{ d.row.unit }}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="cell-right">{{ formatMoney(d.amount, currency) }}</td>
              <td></td>
            </tr>

            <!-- total -->
            <tr v-else-if="d.row.k === 't'" class="wb-total">
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="cell-right cell-bold">Total</td>
              <td class="cell-center cell-bold">=</td>
              <td class="cell-right cell-bold">{{ formatQty(d.qty) }}</td>
              <td class="cell-center cell-bold">{{ d.row.unit }}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>

            <!-- material line -->
            <tr v-else-if="d.row.k === 'mat'" class="wb-measure">
              <td></td>
              <td>{{ d.row.label }}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="cell-right">{{ formatQty(d.qty) }}</td>
              <td class="cell-center">{{ d.row.unit }}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="cell-notes cell-italic">{{ d.row.notes || 'Materials' }}</td>
            </tr>

            <!-- total materials heading -->
            <tr v-else-if="d.row.k === 'mats'" class="wb-measure">
              <td></td>
              <td class="cell-bold">{{ d.row.label || 'Total Materials' }}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="cell-notes cell-bold">{{ d.row.notes }}</td>
            </tr>

            <!-- material total -->
            <tr v-else-if="d.row.k === 'mat_total'" class="wb-measure">
              <td></td>
              <td class="cell-bold" :style="{ paddingLeft: indentPx(1) }">{{ d.row.label }}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="cell-right cell-bold">{{ formatQty(d.qty) }}</td>
              <td class="cell-center cell-bold">{{ d.row.unit }}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>

            <!-- rate -->
            <tr v-else-if="d.row.k === 'rate'" class="wb-rate">
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="cell-right" :class="{ 'cell-bold': d.row.bold }">{{ d.row.label }}</td>
              <td class="cell-center">@</td>
              <td></td>
              <td></td>
              <td class="cell-right">{{ formatMoney(num(d.row.rate), currency) }}</td>
              <td class="cell-center">{{ d.row.per ? 'per' : '' }}</td>
              <td class="cell-center">{{ d.row.unit }}</td>
              <td></td>
              <td class="cell-right cell-bold">{{ formatMoney(d.amount, currency) }}</td>
              <td class="cell-notes">{{ d.row.notes }}</td>
            </tr>

            <!-- total cost -->
            <tr v-else-if="d.row.k === 'cost'" class="wb-cost">
              <td></td>
              <td class="cell-bold">{{ d.row.label || 'Total Cost' }}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="cell-right cell-bold cell-big">{{ formatMoney(d.amount, currency) }}</td>
              <td class="cell-notes">{{ d.row.notes }}</td>
            </tr>

            <!-- part total -->
            <tr v-else-if="d.row.k === 'part_total'" class="wb-part-total">
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="cell-right cell-bold">{{ d.row.label }}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td class="cell-right cell-bold cell-big">{{ formatMoney(d.amount, currency) }}</td>
              <td></td>
            </tr>

            <!-- note -->
            <tr v-else-if="d.row.k === 'note'" class="wb-note">
              <td></td>
              <td class="cell-italic">{{ d.row.label }}</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </template>

          <!-- CLOSING SUMMARY BLOCK -->
          <tr v-if="display.summary.length" class="wb-summary-separator">
            <td colspan="18"></td>
          </tr>
          <tr v-for="(line, index) in display.summary" :key="'summary-' + index" class="wb-summary">
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td class="cell-right cell-bold">{{ line.label }}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td class="cell-right cell-bold cell-big">{{ formatMoney(line.amount, currency) }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { ReportDocument } from '../Types/ReportFormTypes'
import { resolveDisplay, formatQty, formatInt, formatMoney } from '../Utils/workbookDisplay'

// COLUMN WIDTHS PX (EXCEL CHAR UNITS x ~7.5)
const COLUMNS = [45, 390, 53, 30, 75, 30, 75, 30, 90, 45, 98, 68, 45, 105, 45, 68, 135, 150]

const props = defineProps({
  document: {
    type: Object as PropType<ReportDocument>,
    required: true
  }
})

const doc = computed(() => props.document)
const display = computed(() => resolveDisplay(props.document))
const currency = computed(() => props.document.currency || 'Tk')

const defaultTitle = computed(() =>
  props.document.project
    ? `Approximate Cost Estimation Report for Project ${props.document.project}`
    : 'Approximate Cost Estimation Report'
)

// EXCEL 'N()' SEMANTICS FOR DIMENSION COLUMNS: BLANK/TEXT -> 0
const num = (value: number | string | null | undefined): number | null => {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

const indentPx = (indent?: number): string => `${(indent || 0) * 16}px`
</script>

<style scoped lang="scss">
/* WORKBOOK SHEET STYLES - MIRROR THE EXCEL PALETTE */
$ink: #1f2933;
$band: #1f3864;
$head-fill: #d9e1f2;
$item-fill: #f2f2f2;
$total-fill: #fdf3d9;
$cost-fill: #e2efda;
$summary-fill: #ddebf7;
$border: #9ba3af;

.workbook-scroll {
  width: 100%;
  height: 100%;
  overflow: auto;
  background: var(--sw-canvas, #e8eaed);
  padding: 12px;
}

.workbook-sheet {
  width: max-content;
  min-width: 100%;
  background: #fff;
  padding: 24px 28px;
  font-family: Calibri, 'Segoe UI', sans-serif;
  font-size: 13px;
  color: $ink;
  border-radius: var(--sw-radius, 12px);
  box-shadow: var(--sw-shadow, 0 1px 4px rgba(0, 0, 0, 0.18));
  overflow: hidden;
}

/* TITLE BLOCK */
.wb-title {
  font-size: 24px;
  font-weight: bold;
  color: $band;
  text-align: center;
  white-space: pre-wrap;
  margin-bottom: 6px;
}

.wb-banner {
  text-align: center;
  white-space: pre-wrap;
}

.wb-company {
  font-size: 17px;
  font-weight: bold;
}

.wb-project {
  font-size: 16px;
  font-weight: bold;
}

.wb-description {
  font-style: italic;
}

.wb-address {
  font-size: 14.5px;
}

.wb-spacer {
  height: 14px;
}

.wb-meta-line {
  display: flex;
  justify-content: space-between;
  font-size: 14.5px;
  gap: 40px;
  white-space: pre-wrap;
}

.wb-meta-left {
  flex: 1;
}

.wb-meta-right {
  flex: 1;
  text-align: right;
}

.wb-meta-label {
  margin-right: 12px;
}

/* GRID */
.wb-table {
  border-collapse: collapse;
  table-layout: fixed;
  width: max-content;

  th,
  td {
    border: 1px solid $border;
    padding: 2px 6px;
    vertical-align: middle;
    height: 22px;
    overflow-wrap: break-word;
  }
}

.wb-head th {
  background: $head-fill;
  font-weight: bold;
  text-align: center;
  height: 34px;
}

.cell-center {
  text-align: center;
}

.cell-right {
  text-align: right;
}

.cell-wrap {
  white-space: pre-wrap;
  vertical-align: top;
}

.cell-bold {
  font-weight: bold;
}

.cell-big {
  font-size: 14.5px;
}

.cell-italic {
  font-style: italic;
}

.cell-notes {
  font-size: 10.5px;
  white-space: pre-wrap;
  vertical-align: top;
}

/* ROW KINDS */
.wb-part td {
  background: $band;
  color: #fff;
  font-weight: bold;
  font-size: 14.5px;
  border-color: $band;
  padding-left: 16px;
}

.wb-item td {
  background: $item-fill;
  font-weight: bold;
}

.wb-total td {
  background: $total-fill;
  font-weight: bold;
  border-top: 3px double $ink;
}

.wb-cost td {
  background: $cost-fill;
}

.wb-part-total td {
  background: $summary-fill;
  font-weight: bold;
  border: 2px solid $band;
  height: 26px;
}

.wb-summary-separator td {
  border: none;
  height: 14px;
}

.wb-summary td {
  background: $summary-fill;
  font-weight: bold;
  border: 2px solid $band;
  height: 24px;
}

.wb-note td {
  border-left: none;
  border-right: none;
}
</style>
