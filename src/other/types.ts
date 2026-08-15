import type { ChangeEvent } from "react";

// --- Enums & Unions ---
export type SearchType =
  | "elementId"
  | "regexId"
  | "elementPlaceholder"
  | "formControlName"
  | "defaultValue"
  | "cssSelector";

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

export interface Field {
  id: string;
  enabled?: boolean;
  verificationMode?: VerificationMode; // بدلاً من extract?: boolean
  fieldName: string;
  searchType: SearchType;
  searchValue: string;
  inputValue: string;
  conditions: any;
}

// بدلاً من إعادة تعريف TableField بنفس الخصائص:
export type TableField = Required<Field>;

export interface Group {
  id: string;
  name: string;
  fields: Field[];
}

export interface InspectedElementData {
  elementId: string;
  formControlName: string;
  elementPlaceholder: string;
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
