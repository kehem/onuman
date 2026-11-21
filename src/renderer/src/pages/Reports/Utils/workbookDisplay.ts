// /src/pages/Reports/Utils/workbookDisplay.ts
//
// Display-value resolution for the workbook-style report view.
//
// Ports the rendering semantics of the backend Excel writer
// (onuman-private: report/excel_report.py) so "what the user sees on
// screen is exactly what the workbook contains":
//   * empty sections are pruned (_prune / _prune_body),
//   * quantities the workbook computes with Excel formulas
//     (ROUND(N(no)*N(l)*N(w)*N(h),2), SUM groups, rate * qty ...)
//     are computed here for on-screen display.

import type {
    ReportDocument,
    ReportRow,
    ReportSummaryEntry
} from '../Types/ReportFormTypes';

// ROW KINDS THAT COUNT AS "THERE IS DATA HERE"
const DATA_KINDS = new Set(['m', 't', 'mat', 'mats', 'mat_total', 'rate', 'cost', 'note']);
// ROW KINDS THAT ARE HEADINGS AND MAY BE PRUNED
const HEADER_KINDS = new Set(['item', 'sub']);

// RESOLVED ROW READY FOR DISPLAY (computed values mirror workbook formulas)
export interface DisplayRow {
    row: ReportRow;
    qty: number | null;
    amount: number | null;
    showX1: boolean;
    showX2: boolean;
    showX3: boolean;
}

// RESOLVED SUMMARY LINE
export interface DisplaySummaryLine {
    label: string;
    amount: number | null;
}

// RESULT OF RESOLVING A FULL DOCUMENT
export interface WorkbookDisplay {
    rows: DisplayRow[];
    summary: DisplaySummaryLine[];
}

// 'Total Cement' / 'Cement' -> 'cement' so rates find their quantity
// (mirrors _material_key in excel_report.py)
export const materialKey = (label?: string): string =>
    (label || '').toLowerCase().replace(/total/g, '').trim();

// EXCEL FORMATS: '#,##0.00', '#,##0', '"Tk, "#,##0.00'
export const formatQty = (value: number | null | undefined): string =>
    value == null || Number.isNaN(value)
        ? ''
        : value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatInt = (value: number | string | null | undefined): string => {
    if (value == null || value === '') return '';
    const n = Number(value);
    return Number.isNaN(n) ? String(value) : n.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

export const formatMoney = (
    value: number | null | undefined,
    currency: string = 'Tk'
): string => (value == null || Number.isNaN(value) ? '' : `${currency}, ${formatQty(value)}`);

// ROUND HALF UP TO 2 DECIMALS (mirrors ROUND(x, 2))
const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

// NUMERIC COERCION FOR DIMENSIONS - the workbook formula uses N(),
// which treats blank cells as 0 and text as 0
const asNum = (value: number | string | null | undefined): number => {
    if (value == null || value === '') return 0;
    const n = Number(value);
    return Number.isNaN(n) ? 0 : n;
};

const hasValue = (value: number | string | null | undefined): boolean =>
    value != null && value !== '';

// ---------------------------------------------------------------------
// pruning - ports _prune_body / _prune from excel_report.py
// ---------------------------------------------------------------------

// DROP HEADINGS THAT HAVE NO MEASUREMENTS / MATERIALS UNDER THEM
const pruneBody = (rows: ReportRow[]): ReportRow[] => {
    const kept: ReportRow[] = [];
    const filtered = rows.filter((row) => row.k !== 'blank');
    filtered.forEach((row, index) => {
        if (!HEADER_KINDS.has(row.k)) {
            kept.push(row);
            return;
        }
        const stop = row.k === 'item' ? ['item'] : ['item', 'sub'];
        let hasData = false;
        for (const follower of filtered.slice(index + 1)) {
            if (stop.includes(follower.k)) break;
            if (DATA_KINDS.has(follower.k)) {
                hasData = true;
                break;
            }
        }
        if (hasData) kept.push(row);
    });
    return kept;
};

// DROP PARTS THAT CARRY NO DATA, KEEPING THE SUMMARY PART MAPPING
export const pruneRows = (
    rows: ReportRow[]
): { rows: ReportRow[]; partMap: Map<number, number | null> } => {
    const blocks: Array<{ band: ReportRow | null; rows: ReportRow[] }> = [];
    let current: { band: ReportRow | null; rows: ReportRow[] } | null = null;

    for (const row of rows) {
        if (row.k === 'part') {
            current = { band: row, rows: [] };
            blocks.push(current);
        } else {
            if (!current) {
                current = { band: null, rows: [] };
                blocks.push(current);
            }
            current.rows.push(row);
        }
    }

    const out: ReportRow[] = [];
    const partMap = new Map<number, number | null>();
    let originalIndex = 0;
    let newIndex = 0;

    for (const block of blocks) {
        const body = pruneBody(block.rows);
        if (block.band === null) {
            out.push(...body);
            continue;
        }
        const hasData = body.some((row) => DATA_KINDS.has(row.k));
        if (!hasData) {
            partMap.set(originalIndex, null);
            originalIndex += 1;
            continue;
        }
        partMap.set(originalIndex, newIndex);
        originalIndex += 1;
        newIndex += 1;
        out.push(block.band);
        out.push(...body);
    }

    return { rows: out, partMap };
};

// ---------------------------------------------------------------------
// display resolution - computes every value the workbook shows,
// including the ones it stores as Excel formulas
// ---------------------------------------------------------------------

export const resolveDisplay = (document: ReportDocument): WorkbookDisplay => {
    const { rows, partMap } = pruneRows(document.rows || []);

    // summary lines follow their part: a pruned part hides its line
    const summaryEntries: Array<{ index: number; entry: ReportSummaryEntry }> = [];
    (document.summary || []).forEach((original, index) => {
        let entry = original;
        if (entry.part != null) {
            const target = partMap.get(Number(entry.part));
            if (target == null) return;
            entry = { ...entry, part: target };
        }
        summaryEntries.push({ index, entry });
    });

    const displayRows: DisplayRow[] = [];

    // running state mirrors build_workbook()
    let groupHasMeasure = false;
    let groupQtySum = 0;
    let lastQty: number | null = null;
    let itemCosts: number[] = []; // "Total Cost" rows of the running part
    let partAmounts: number[] = []; // every @-rate amount of the running part
    let materialAmounts: number[] = []; // rate amounts inside the current item
    let materialQtys = new Map<string, number | null>();
    const partCosts: number[] = [];

    for (const row of rows) {
        let qty: number | null = null;
        let amount: number | null = null;

        switch (row.k) {
            case 'part': {
                itemCosts = [];
                partAmounts = [];
                groupHasMeasure = false;
                groupQtySum = 0;
                break;
            }
            case 'item': {
                materialAmounts = [];
                materialQtys = new Map();
                groupHasMeasure = false;
                groupQtySum = 0;
                lastQty = null;
                break;
            }
            case 'sub': {
                groupHasMeasure = false;
                groupQtySum = 0;
                break;
            }
            case 'm': {
                if (row.qty != null && row.qty !== '') {
                    qty = asNum(row.qty);
                } else if (hasValue(row.no) || hasValue(row.l) || hasValue(row.w) || hasValue(row.h)) {
                    // workbook formula: =ROUND(N(no)*N(l)*N(w)*N(h),2)
                    // (N() collapses blank cells to 0 - for on-screen display
                    // the provided dimensions multiply instead, so a two
                    // dimensional area still shows its real quantity)
                    qty = round2(
                        (['no', 'l', 'w', 'h'] as const).reduce((acc, key) => {
                            const value = row[key];
                            return value != null && value !== '' ? acc * asNum(value) : acc;
                        }, 1)
                    );
                }
                if (row.amount != null && row.amount !== '') amount = asNum(row.amount);
                lastQty = qty;
                groupHasMeasure = true;
                if (qty != null) groupQtySum += qty;
                break;
            }
            case 't': {
                // workbook formula: =ROUND(SUM(first_qty:prev_qty),2)
                qty =
                    row.qty != null && row.qty !== ''
                        ? asNum(row.qty)
                        : groupHasMeasure
                          ? round2(groupQtySum)
                          : null;
                lastQty = qty;
                groupHasMeasure = false;
                groupQtySum = 0;
                break;
            }
            case 'mat': {
                qty = row.qty != null && row.qty !== '' ? asNum(row.qty) : null;
                lastQty = qty;
                break;
            }
            case 'mats': {
                break;
            }
            case 'mat_total': {
                qty = row.qty != null && row.qty !== '' ? asNum(row.qty) : null;
                lastQty = qty;
                materialQtys.set(materialKey(row.label), qty);
                break;
            }
            case 'rate': {
                // workbook formula: =ROUND(qty_cell * rate,2)
                const refQty = materialQtys.has(materialKey(row.label))
                    ? materialQtys.get(materialKey(row.label))
                    : lastQty;
                const rate = asNum(row.rate);
                if (row.amount != null && row.amount !== '') {
                    amount = asNum(row.amount);
                } else if (row.qty != null && row.qty !== '') {
                    amount = round2(asNum(row.qty) * rate);
                } else if (refQty != null) {
                    amount = round2(refQty * rate);
                }
                if (amount != null) {
                    materialAmounts.push(amount);
                    partAmounts.push(amount);
                }
                break;
            }
            case 'cost': {
                // workbook formula: =ROUND(SUM(rate amounts of the item),2)
                amount =
                    row.amount != null && row.amount !== ''
                        ? asNum(row.amount)
                        : round2(materialAmounts.reduce((a, b) => a + b, 0));
                itemCosts.push(amount);
                materialAmounts = [];
                break;
            }
            case 'part_total': {
                // rate amounts of the part, or the "Total Cost" rows when the
                // document carries no rate rows; sum_parts rolls in earlier parts
                let cells = (partAmounts.length ? partAmounts : itemCosts).reduce(
                    (a, b) => a + b,
                    0
                );
                for (const idx of row.sum_parts || []) {
                    if (idx < partCosts.length) cells += partCosts[idx];
                }
                amount = row.amount != null && row.amount !== '' ? asNum(row.amount) : round2(cells);
                partCosts.push(amount);
                itemCosts = [];
                partAmounts = [];
                break;
            }
            default:
                break;
        }

        displayRows.push({
            row,
            qty,
            amount,
            showX1: hasValue(row.no) && (row.l != null || row.w != null),
            showX2: row.l != null && row.w != null,
            showX3: row.w != null && row.h != null
        });
    }

    // closing summary block: explicit amount, part reference or sum of lines
    const ownAmounts = new Map<number, number | null>();
    const summary: DisplaySummaryLine[] = summaryEntries.map(({ index, entry }) => {
        let amount: number | null = null;
        if (entry.amount != null && entry.amount !== '') {
            amount = asNum(entry.amount);
        } else if (entry.part != null && entry.part < partCosts.length) {
            amount = partCosts[entry.part];
        } else if (entry.sum_of && entry.sum_of.length) {
            const refs = entry.sum_of
                .filter((i) => ownAmounts.has(i))
                .map((i) => ownAmounts.get(i) as number | null);
            const valid = refs.filter((v): v is number => v != null);
            if (valid.length) amount = round2(valid.reduce((a, b) => a + b, 0));
        }
        ownAmounts.set(index, amount);
        return { label: entry.label || '', amount };
    });

    return { rows: displayRows, summary };
};
