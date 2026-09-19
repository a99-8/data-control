import type { ChangeEvent } from "react";

// --- Enums & Unions ---
export type SearchType =
  | "elementId"
  | "regexId"
  | "elementPlaceholder"
  | "formControlName"
  | "defaultValue"
  | "cssSelector"
  | "elementLabel";

export type ActionType =
  | "SCRAPE_DATA"
  | "INJECT_DATA"
  | "TRANSFER_DATA"
  | "SCAN_INPUT_FIELDS"
  | "COPY_DATA"
  | "HIGHLIGHT_INPUT_FIELD"
  | "START_INSPECT";

export type ModalType = "alert" | "confirm";
export type VariantType = "success" | "danger" | "warning" | "info";

// --- Models ---
export type VerificationMode = "none" | "extract_compare" | "compare_only";

export type TableField = Required<Field>;

export interface InspectedElementData {
  elementId: string;
  formControlName: string;
  elementPlaceholder: string;
  cssSelector?: string;
  elementLabel?: string;
}

// --- API & Actions ---
export interface ActionResponse {
  status: "success" | "error";
  data?: Record<string, any>[];
  count?: number;
  extractedCount?: number;
  columnsCount?: number;
  message?: string;
}

export interface ActionRequest {
  action: ActionType;
  group?: Group;
  sourceGroup?: Group;
  targetGroup?: Group;
  sectionId?: string; // إرسال قسم معين عند الحقن
}

export interface FieldSection {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
  isInjectionGroup?: boolean; // خيار الحقن للمجموعة
  fields: Field[];
  sections?: FieldSection[]; // أقسام المجموعة
}

export interface Field {
  id: string;
  enabled?: boolean;
  fieldName: string;
  searchType: SearchType;
  searchValue: string;
  inputValue?: string; // قيمة الحقن
  verificationMode?: VerificationMode;
  conditions?: string;
  sectionId?: string; // القسم التابع له الحقل
}

// --- Component Props ---
export interface FieldsTableProps {
  activeGroup: Group;
  onAddField: () => void;
  onUpdateField: (fieldIdx: number, key: keyof Field, value: any) => void;
  onDeleteField: (fieldIdx: number) => void;
  onSaveFields: () => void;
  onMoveField: (fromIndex: number, toIndex: number) => void;
}

export interface ScanFieldsTableProps {
  fields: Field[];
  sections?: FieldSection[];
  selectedIds: Set<string>;
  isAllSelected: boolean;
  toggleSelectAll: () => void;
  toggleSelectField: (id: string) => void;
  handleAddField: () => void;
  handleMoveField: (fromIndex: number, toIndex: number) => void;
  handleUpdateField: (index: number, key: keyof Field, value: any) => void;
  handleDeleteField: (index: number) => void;
}

export interface GroupsTableProps {
  groups: Group[];
  activeGroupIdx: number | null;
  onSelectGroup: (idx: number) => void;
  onAddGroup: () => void;
  onDeleteGroup: (idx: number) => void;
  onDeleteAll: () => void;
  onUpdateGroupName: (idx: number, name: string) => void;
  onToggleInjectionGroup?: (idx: number, isInjection: boolean) => void;
  onImportJSON: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface ExtendedGroupsTableProps extends GroupsTableProps {
  onExportGroupJSON?: (idx: number) => void;
  onExportGroupCSV?: (idx: number) => void;
  onImportGroupJSON?: (idx: number, e: ChangeEvent<HTMLInputElement>) => void;
  onImportGroupCSV?: (idx: number, e: ChangeEvent<HTMLInputElement>) => void;
}

export interface ModalProps {
  isOpen: boolean;
  type?: ModalType;
  variant?: VariantType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}
