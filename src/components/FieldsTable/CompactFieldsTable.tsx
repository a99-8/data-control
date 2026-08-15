import React from "react";
import type { Field } from "@/src/other/types";
import { Plus, CheckSquare, Square } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FieldRow } from "./FieldRow";

interface CompactFieldsTableProps {
  fields: Field[];
  selectedIds?: Set<string>;
  isAllSelected?: boolean;
  toggleSelectAll?: () => void;
  toggleSelectField?: (id: string) => void;
  onAddField: () => void;
  onUpdateField: (index: number, key: keyof Field, value: any) => void;
  onDeleteField: (index: number) => void;
}

export const CompactFieldsTable: React.FC<CompactFieldsTableProps> = ({
  fields,
  selectedIds = new Set(),
  isAllSelected = false,
  toggleSelectAll,
  toggleSelectField,
  onAddField,
  onUpdateField,
  onDeleteField,
}) => {
  const { t } = useTranslation();

  return (
    <div className="card border-secondary shadow-sm bg-dark text-white mb-3">
      <div className="card-header py-2 bg-dark border-secondary d-flex justify-content-between align-items-center text-white">
        <h5 className="card-title fw-bold text-primary m-0 h6">
          {`${t("extracted_fields_list")} (${fields.length})`}
        </h5>
        <button
          className="btn btn-success btn-sm d-inline-flex align-items-center gap-1 fw-bold"
          onClick={onAddField}
        >
          <Plus size={16} /> <span>{t("empty_field")}</span>
        </button>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive mb-2">
          <table className="table table-dark table-bordered table-hover align-middle mb-0">
            <thead className="table-dark border-secondary text-center small">
              <tr>
                <th className="col-checkbox">
                  <button
                    type="button"
                    className="btn btn-link text-light p-0"
                    onClick={toggleSelectAll}
                    title={t("select_deselect_all")}
                  >
                    {isAllSelected ? (
                      <CheckSquare size={16} className="text-primary" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="col-field-name">{t("field_name")}</th>
                <th className="col-search-type">{t("selector_type")}</th>
                <th className="col-selector">{t("element_selector")}</th>
                <th className="col-action-sm">{t("delete")}</th>
              </tr>
            </thead>
            <tbody className="small">
              {fields.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    {t("no_fields_in_table")}
                  </td>
                </tr>
              ) : (
                fields.map((field, index) => (
                  <FieldRow
                    key={field.id}
                    field={field}
                    index={index}
                    totalLength={fields.length}
                    compact={true}
                    isSelected={selectedIds.has(field.id)}
                    onToggleSelect={() =>
                      toggleSelectField && toggleSelectField(field.id)
                    }
                    onUpdateField={onUpdateField}
                    onDeleteField={onDeleteField}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
