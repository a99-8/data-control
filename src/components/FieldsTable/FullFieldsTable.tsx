import React, { useState } from "react";
import type { Group, Field } from "@/src/other/types";
import { Plus, Save, Edit, Layers, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FieldRow } from "./FieldRow";

interface FullFieldsTableProps {
  fields: Field[];
  activeGroup?: Group;
  activeGroupName?: string;
  onSaveFields?: () => void;
  onAddField: () => void;
  onUpdateField: (index: number, key: keyof Field, value: any) => void;
  onDeleteField: (index: number) => void;
  onMoveField: (fromIndex: number, toIndex: number) => void;
  onAddSection?: (sectionName: string) => void;
  onDeleteSection?: (sectionId: string) => void;
}

export const FullFieldsTable: React.FC<FullFieldsTableProps> = ({
  fields,
  activeGroup,
  activeGroupName,
  onSaveFields,
  onAddField,
  onUpdateField,
  onDeleteField,
  onMoveField,
  onAddSection,
  onDeleteSection,
}) => {
  const { t } = useTranslation();
  const [activeEditIndex, setActiveEditIndex] = useState<number | null>(null);
  const [newSectionName, setNewSectionName] = useState("");

  const isInjectionGroup = activeGroup?.isInjectionGroup ?? false;
  const sections = activeGroup?.sections || [];

  const currentEditingIndex =
    activeEditIndex !== null && activeEditIndex < fields.length
      ? activeEditIndex
      : null;

  const currentField =
    currentEditingIndex !== null ? fields[currentEditingIndex] : null;

  const handleCreateSection = () => {
    if (newSectionName.trim() && onAddSection) {
      onAddSection(newSectionName.trim());
      setNewSectionName("");
    }
  };

  return (
    <div className="card border-secondary bg-dark text-white shadow-sm">
      <div className="card-header py-3 d-flex justify-content-between align-items-center bg-dark border-secondary">
        <h5 className="card-title fw-bold text-primary m-0">
          {`${t("configure_fields_for_group")}: (${activeGroup?.name || activeGroupName || ""})`}
        </h5>
        <button
          className="btn btn-success btn-sm d-inline-flex align-items-center gap-1 fw-bold"
          onClick={onAddField}
        >
          <Plus size={16} /> <span>{t("add_new_field")}</span>
        </button>
      </div>

      <div className="card-body">
        {/* قسم إدارة أجزاء/أقسام المجموعة */}
        <div className="mb-4 p-3 bg-secondary bg-opacity-10 rounded border border-secondary">
          <label className="form-label d-flex align-items-center gap-2 fw-bold text-warning mb-2">
            <Layers size={16} /> أقسام المجموعة (الحقن متعدد الأقسام)
          </label>
          <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
            <input
              type="text"
              className="form-control form-control-sm bg-dark text-white border-secondary w-auto"
              placeholder="اسم القسم الجديد (مثلاً: القسم الأول)"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-warning btn-sm fw-bold d-inline-flex align-items-center gap-1"
              onClick={handleCreateSection}
            >
              <Plus size={14} /> إضافة قسم
            </button>
          </div>
          {sections.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mt-2">
              {sections.map((sec) => (
                <span
                  key={sec.id}
                  className="badge bg-dark border border-secondary p-2 d-inline-flex align-items-center gap-2 text-white"
                >
                  <span>{sec.name}</span>
                  <button
                    type="button"
                    className="btn-close btn-close-white p-0 text-danger"
                    style={{ fontSize: "0.65rem" }}
                    onClick={() => onDeleteSection?.(sec.id)}
                  ></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mb-3 p-3 text-body">
          <label className="form-label d-flex align-items-center gap-2 fw-bold text-info mb-2">
            <Edit size={16} />
            {currentField
              ? t("edit_conditions_for_field", {
                  fieldName: currentField.fieldName || currentField.id,
                })
              : t("select_field_to_edit_conditions")}
          </label>
          <textarea
            dir="ltr"
            className="form-control bg-dark text-white border-secondary font-monospace"
            rows={3}
            disabled={currentEditingIndex === null}
            placeholder={
              currentEditingIndex === null
                ? t("click_edit_conditions_placeholder")
                : t("enter_conditions_placeholder")
            }
            value={
              currentField
                ? typeof currentField.conditions === "object"
                  ? JSON.stringify(currentField.conditions, null, 2)
                  : currentField.conditions || ""
                : ""
            }
            onChange={(e) => {
              if (currentEditingIndex !== null) {
                onUpdateField(
                  currentEditingIndex,
                  "conditions",
                  e.target.value,
                );
              }
            }}
          />
        </div>

        <div className="table-responsive mb-2">
          <table className="table table-dark table-bordered table-hover align-middle mb-0">
            <thead className="table-dark border-secondary text-center">
              <tr>
                <th className="col-order">{t("order")}</th>
                <th className="col-field-id">ID</th>
                <th className="col-toggle">{t("enable")}</th>
                {sections.length > 0 && <th>القسم</th>}
                <th className="col-field-name">{t("field_name")}</th>
                <th className="col-search-type">{t("search_type")}</th>
                <th className="col-selector">{t("element_selector")}</th>
                {isInjectionGroup && (
                  <>
                    <th className="col-injection">{t("injection_value")}</th>
                    <th className="col-verification">
                      {t("verification_mode")}
                    </th>
                  </>
                )}
                <th className="col-conditions">{t("conditions")}</th>
                <th className="col-action-sm">{t("delete")}</th>
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-4">
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
                    isInjectionGroup={isInjectionGroup}
                    sections={sections}
                    isEditingConditions={activeEditIndex === index}
                    onSelectForEdit={() =>
                      setActiveEditIndex(
                        activeEditIndex === index ? null : index,
                      )
                    }
                    onUpdateField={onUpdateField}
                    onDeleteField={(i) => {
                      if (activeEditIndex === i) setActiveEditIndex(null);
                      onDeleteField(i);
                    }}
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
