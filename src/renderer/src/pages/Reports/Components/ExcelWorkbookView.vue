<template>
  <div class="excel-workbook-scroll onuman-insider-scrollbar">
    <div class="excel-workbook">
      <div class="excel-sheet-name">{{ workbook.name }}</div>
      <table class="excel-sheet">
        <colgroup>
          <col
            v-for="(width, index) in workbook.columns"
            :key="index"
            :style="{ width: `${width}px` }"
          />
        </colgroup>
        <tbody>
          <tr
            v-for="(row, rowIndex) in workbook.rows"
            :key="rowIndex"
            :style="row.height ? { height: `${row.height}px` } : undefined"
          >
            <td
              v-for="(cell, cellIndex) in row.cells"
              :key="cellIndex"
              :colspan="cell.colSpan > 1 ? cell.colSpan : undefined"
              :rowspan="cell.rowSpan > 1 ? cell.rowSpan : undefined"
              :style="cell.style"
            >
              {{ cell.value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WorkbookSheet } from '../Utils/excelWorkbook'

defineProps<{
  workbook: WorkbookSheet
}>()
</script>

<style scoped lang="scss">
.excel-workbook-scroll {
  flex: 1 1 auto;
  width: 100%;
  height: auto;
  min-height: 0;
  overflow: auto;
  padding: 6px;
  background: var(--sw-canvas, #e8eaed);
}

.excel-workbook {
  width: max-content;
  min-width: 100%;
  padding: 10px;
  background: #fff;
  color: #1f2933;
  font-family: Calibri, 'Segoe UI', sans-serif;
  font-size: 13px;
  box-shadow: var(--sw-shadow, 0 1px 4px rgba(0, 0, 0, 0.18));
}

.excel-sheet-name {
  margin-bottom: 4px;
  color: #64748b;
  font-size: 12px;
}

.excel-sheet {
  border-collapse: collapse;
  table-layout: fixed;
  width: max-content;

  td {
    min-width: 24px;
    height: 22px;
    padding: 2px 6px;
    border: 1px solid #c5cbd3;
    vertical-align: middle;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
}
</style>
