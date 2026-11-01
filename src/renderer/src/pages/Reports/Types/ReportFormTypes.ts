// /src/Reports/Types/ReportFormTypes.ts

// MATERIAL INTERFACE - DEFINES MATERIAL STRUCTURE
export interface Material {
    name: string;
    price: string;
}

// MIX RATIO INTERFACE - DEFINES CONCRETE MIX PROPORTIONS
export interface MixRatio {
    cement: number;
    sand: number;
    stone: number;
    brick: number;
    comment: string;
}

// PROJECT INTERFACE - DEFINES COMPLETE PROJECT STRUCTURE
export interface Project {
    id: number;
    company: number;
    projectName: string;
    startDate: string;
    endDate: string;
    clientName: string;
    clientAddress: string;
    clientPhone: string;
    buildingType: string;
    totalFloor: number;
    totalUnit: number;
    projectImage: string;
    onumanStart: string;
    projectDescription: string;
    projectStatus: string;
    materials: Material[];
    mixRatio: MixRatio;
}

// EXPORT HISTORY ITEM INTERFACE - DEFINES EXPORT RECORD STRUCTURE
export interface ExportHistoryItem {
    type: 'pdf' | 'excel' | 'word';
    filename: string;
    path: string;
    timestamp: number;
}

// EXPORT STATUS INTERFACE - DEFINES EXPORT OPERATION STATUS
export interface ExportStatus {
    message: string;
    type: 'success' | 'error' | '';
    path: string | null;
}

// FORM SUBMISSION PAYLOAD INTERFACE - DEFINES API REQUEST STRUCTURE
export interface FormSubmissionPayload {
    projectId: number | null;
    operations: string[];
    floors: number[];
    properties: string[];
    items: string[];
    baseItems: string[];
    reportSummeryItems: string[];
    wastage: number;
    material: string;
}

// FORM PROPS INTERFACE - DEFINES FORM COMPONENT PROPERTIES
export interface ReportFormProps {
    projectList: Project[];
    onSubmit: (payload: FormSubmissionPayload) => void;
    isLoading?: boolean;
    AvailableChecked?: AVAILABLE_DATA | null;
}

// FORM EMIT EVENTS INTERFACE - DEFINES FORM COMPONENT EVENTS
export interface ReportFormEmits {
    submit: [payload: FormSubmissionPayload];
}

// API RESPONSE INTERFACE - DEFINES THE STRUCTURE FROM YOUR API
export interface AVAILABLE_DATA {
    base_items: { [key: string]: boolean };
    floor: string[]; // Array of floor numbers as strings
    keys: { [key: string]: boolean };
    categories: {
        exterior: boolean;
        interior: boolean;
        finish: boolean;
    };
}

// CONSTANTS FOR FORM OPTIONS
export const BASE_ITEMS = [
    'exterior:Pile',
    'exterior:Share Wall',
    'exterior:Footing',
    'exterior:Sand Filling',
    'exterior:Short Column',
    'exterior:Grade Beam',
    'exterior:Ground Slab',
    'finish:Water Reservior',
    'interior:Cable',
    'interior:Fiver',
    'interior:Pin',
    'interior:SWG',
] as const;

export const REPORT_SUMMARY_ITEMS = [
    'Code/Item No.',
    'Material Cost'
] as const;

export const ITEMS = [
    'Materials',
    'Total Quantity',
    'Total Wastage',
    'Approx. Rate (tk)',
    'Cost',
    'Reinforcement',
    'Casting'
] as const;

export const OPERATIONS = [
    'Exterior',
    'Interior',
    'Finish'
] as const;

export const PROPERTIES = [
    'exterior:Long Column',
    'exterior:Floor Beam',
    'exterior:Lintel Beam',
    'exterior:Main Slab',
    'exterior:Sun Shade Slab',
    'exterior:False Slab',
    'exterior:Brick',
    'finish:Plaster Paint',
    'finish:WGG',
    'finish:Tiles',
    'finish:Electric',
    'finish:Plumbing',
    'interior:CBL',
    'interior:Sall Shade',
] as const;

export const MATERIALS = [
    'Brick',
    'Stone',
    'Ready Mix'
] as const;

// UTILITY FUNCTION FOR NORMALIZING STRINGS
export const normalize = (val: string) =>
    val.toLowerCase().replace(/\s+/g, '_');

// TYPE ALIASES FOR BETTER TYPE SAFETY
export type BaseItemType = typeof BASE_ITEMS[number];
export type ReportSummaryItemType = typeof REPORT_SUMMARY_ITEMS[number];
export type ItemType = typeof ITEMS[number];
export type OperationType = typeof OPERATIONS[number];
export type PropertyType = typeof PROPERTIES[number];
export type MaterialType = typeof MATERIALS[number];
export type SelectOptionType = 'all' | 'specific';