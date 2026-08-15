import React from "react";
import type { Field } from "@/src/other/types";
import { Plus, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FieldRow } from "./FieldRow";

interface FullFieldsTableProps {
  fields: Field[];
  activeGroupName?: string;
  onSaveFields?: () => void;
  onAddField: () => void;
  onUpdateField: (index: number, key: keyof Field, value: any) => void;
  onDeleteField: (index: number) => void;
  onMoveField: (fromIndex: number, toIndex: number) => void;
}

export const FullFieldsTable: React.FC<FullFieldsTableProps> = ({
  fields,
  activeGroupName,
  onSaveFields,
  onAddField,
  onUpdateField,
  onDeleteField,
  onMoveField,
}) => {
  const { t } = useTranslation();

  return (
    <div className="card border-secondary bg-dark text-white shadow-sm">
      <div className="card-header py-3 d-flex justify-content-between align-items-center bg-dark border-secondary">
        <h5 className="card-title fw-bold text-primary m-0">
          {`${t("configure_fields_for_group")}: (${activeGroupName || ""})`}
        </h5>
        <button
          className="btn btn-success btn-sm d-inline-flex align-items-center gap-1 fw-bold"
          onClick={onAddField}
        >
          <Plus size={16} /> <span>{t("add_new_field")}</span>
        </button>
      </div>

      <div className="card-body">
        <div className="table-responsive mb-2">
          <table className="table table-dark table-bordered table-hover align-middle mb-0">
            <thead className="table-dark border-secondary text-center">
              <tr>
                <th style={{ width: "50px", minWidth: "50px" }}>
                  {t("order")}
                </th>
                <th style={{ width: "70px", minWidth: "70px" }}>ID</th>
                <th style={{ width: "50px", minWidth: "50px" }}>
                  {t("enable")}
                </th>
                <th style={{ minWidth: "100px", width: "15%" }}>
                  {t("field_name")}
                </th>
                <th style={{ width: "150px", minWidth: "150px" }}>
                  {t("search_type")}
                </th>
                <th style={{ minWidth: "200px", width: "10%" }}>
                  {t("element_selector")}
                </th>
                <th style={{ minWidth: "170px", width: "15%" }}>
                  {t("injection_value")}
                </th>
                <th style={{ width: "130px", minWidth: "130px" }}>
                  {t("verification_mode")}
                </th>
                <th style={{ minWidth: "150px", width: "17%" }}>
                  {t("conditions_json")}
                </th>
                <th style={{ width: "50px", minWidth: "50px" }}>
                  {t("delete")}
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4">
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
                    compact={false}
                    onUpdateField={onUpdateField}
                    onDeleteField={onDeleteField}
                    onMoveField={onMoveField}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {onSaveFields && (
          <div className="d-flex justify-content-end mt-3">
            <button
              className="btn btn-primary px-4 d-inline-flex align-items-center gap-2"
              onClick={onSaveFields}
            >
              <Save size={18} /> {t("save_changes")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
