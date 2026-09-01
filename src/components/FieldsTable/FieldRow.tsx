import React from "react";
import type {
  Field,
  SearchType,
  VerificationMode,
  FieldSection,
} from "@/src/other/types";
import { Trash2, Edit3, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FieldRowProps {
  field: Field;
  index: number;
  totalLength: number;
  compact: boolean;
  isInjectionGroup?: boolean;
  sections?: FieldSection[];
  isSelected?: boolean;
  isEditingConditions?: boolean;
  onSelectForEdit?: () => void;
  onToggleSelect?: () => void;
  onUpdateField: (index: number, key: keyof Field, value: any) => void;
  onDeleteField: (index: number) => void;
  onMoveField?: (fromIndex: number, toIndex: number) => void;
}

export const FieldRow: React.FC<FieldRowProps> = ({
  field,
  index,
  totalLength,
  compact,
  isInjectionGroup = true,
  sections = [],
  isSelected,
  isEditingConditions,
  onSelectForEdit,
  onToggleSelect,
  onUpdateField,
  onDeleteField,
  onMoveField,
}) => {
  const { t } = useTranslation();

  const inputClass =
    "form-control form-control-sm bg-dark text-white border-secondary";
  const selectClass =
    "form-select form-select-sm bg-dark text-white border-secondary";

  return (
    <tr className={isEditingConditions ? "table-active" : ""}>
      {compact ? (
        <td className="text-center col-checkbox">
          <input
            type="checkbox"
            className="form-check-input"
            checked={isSelected}
            onChange={onToggleSelect}
          />
        </td>
      ) : (
        <>
          <td className="text-center col-order">
            <input
              type="number"
              className={`${inputClass} text-center px-1 no-spinner`}
              min={1}
              max={totalLength}
              value={index + 1}
              onChange={(e) => {
                const newIndex = parseInt(e.target.value, 10) - 1;
                if (
                  !isNaN(newIndex) &&
                  newIndex >= 0 &&
                  newIndex < totalLength &&
                  onMoveField
                ) {
                  onMoveField(index, newIndex);
                }
              }}
            />
          </td>
          <td className="text-center col-field-id">
            <code className="small fw-bold text-danger">{field.id}</code>
          </td>
          <td className="text-center col-toggle">
            <input
              type="checkbox"
              className="form-check-input"
              checked={field.enabled ?? true}
              onChange={(e) =>
                onUpdateField(index, "enabled", e.target.checked)
              }
            />
          </td>
        </>
      )}

      {/* حقل تحديد القسم في حال وجود أقسام للمجموعة */}
      {sections.length > 0 && (
        <td style={{ minWidth: "120px" }}>
          <select
            className={selectClass}
            value={field.sectionId || ""}
            onChange={(e) =>
              onUpdateField(index, "sectionId", e.target.value || undefined)
            }
          >
            <option value="">(بدون قسم)</option>
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name}
              </option>
            ))}
          </select>
        </td>
      )}

      <td className="col-field-name">
        <input
          type="text"
          className={inputClass}
          value={field.fieldName}
          onChange={(e) => onUpdateField(index, "fieldName", e.target.value)}
          placeholder={t("field_name")}
        />
      </td>

      <td className="col-search-type">
        <select
          className={selectClass}
          value={field.searchType}
          onChange={(e) =>
            onUpdateField(index, "searchType", e.target.value as SearchType)
          }
        >
          <option value="elementId">ID</option>
          <option value="regexId">Regex</option>
          <option value="cssSelector">Selector</option>
          <option value="elementPlaceholder">Placeholder</option>
          <option value="formControlName">FormControl</option>
          <option value="defaultValue">Default</option>
        </select>
      </td>

      <td className="col-selector">
        <input
          type="text"
          className={`${inputClass} font-monospace`}
          value={field.searchValue}
          onChange={(e) => onUpdateField(index, "searchValue", e.target.value)}
          placeholder={t("element_selector")}
        />
      </td>

      {!compact && (
        <>
          {isInjectionGroup && (
            <td className="col-injection">
              <input
                type="text"
                className={inputClass}
                value={field.inputValue || ""}
                onChange={(e) =>
                  onUpdateField(index, "inputValue", e.target.value)
                }
                placeholder={t("injection_value")}
              />
            </td>
          )}

          <td className="text-center col-verification">
            <select
              className={selectClass}
              value={field.verificationMode || "none"}
              onChange={(e) =>
                onUpdateField(
                  index,
                  "verificationMode",
                  e.target.value as VerificationMode,
                )
              }
            >
              <option value="none">بدون تحقق</option>
              <option value="extract_compare">استخرج ثم قارن</option>
              <option value="compare_only">قارن فقط</option>
            </select>
          </td>

          <td className="text-center col-conditions">
            <button
              type="button"
              className={`btn btn-sm d-inline-flex align-items-center gap-1 ${
                isEditingConditions ? "btn-warning" : "btn-outline-info"
              }`}
              onClick={onSelectForEdit}
            >
              {isEditingConditions ? (
                <>
                  <CheckCircle size={14} />{" "}
                  <span>{t("currently_editing")}</span>
                </>
              ) : (
                <>
                  <Edit3 size={14} /> <span>{t("edit_conditions")}</span>
                </>
              )}
            </button>
          </td>
        </>
      )}

      <td className="text-center col-action-sm">
        <button
          className="btn btn-sm btn-outline-danger p-1 d-inline-flex align-items-center justify-content-center"
          onClick={() => onDeleteField(index)}
          title={t("delete")}
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};
