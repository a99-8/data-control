import React from "react";
import type { Field } from "@/src/other/types";
import { FullFieldsTable } from "@/src/components/FieldsTable/FullFieldsTable";
import { CompactFieldsTable } from "@/src/components/FieldsTable/CompactFieldsTable";

interface UnifiedFieldsTableProps {
  fields: Field[];
  compact?: boolean;
  activeGroupName?: string;
  onSaveFields?: () => void;
  selectedIds?: Set<string>;
  isAllSelected?: boolean;
  toggleSelectAll?: () => void;
  toggleSelectField?: (id: string) => void;
  onAddField: () => void;
  onUpdateField: (index: number, key: keyof Field, value: any) => void;
  onDeleteField: (index: number) => void;
  onMoveField: (fromIndex: number, toIndex: number) => void;
}

export const FieldsTable: React.FC<UnifiedFieldsTableProps> = (props) => {
  if (props.compact) {
    return <CompactFieldsTable {...props} />;
  }

  return <FullFieldsTable {...props} />;
};
