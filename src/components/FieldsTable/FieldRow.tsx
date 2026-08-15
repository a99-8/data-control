import React from "react";
import type { Field, SearchType, VerificationMode } from "@/src/other/types";
import { Trash2 } from "lucide-react";

interface FieldRowProps {
  field: Field;
  index: number;
  totalLength: number;
  compact: boolean;
  isSelected?: boolean;
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
  isSelected,
  onToggleSelect,
  onUpdateField,
  onDeleteField,
  onMoveField,
}) => {
  const inputClass =
    "form-control form-control-sm bg-dark text-white border-secondary";
  const selectClass =
    "form-select form-select-sm bg-dark text-white border-secondary";

  return (
    <tr>
      {/* عمود التحديد - نسخة مضغوطة */}
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
          {/* عمود الترتيب - النسخة الكاملة */}
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
          {/* عمود ID الحقل */}
          <td className="text-center col-field-id">
            <code className="small fw-bold text-danger">{field.id}</code>
          </td>
          {/* عمود التفعيل */}
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

      {/* عمود اسم الحقل */}
      <td className="col-field-name">
        <input
          type="text"
          className={inputClass}
          value={field.fieldName}
          onChange={(e) => onUpdateField(index, "fieldName", e.target.value)}
          placeholder={compact ? "اسم الحقل" : "أدخل اسم الحقل"}
        />
      </td>

      {/* عمود نوع البحث */}
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

      {/* عمود محدد العنصر */}
      <td className="col-selector">
        <input
          type="text"
          className={`${inputClass} font-monospace`}
          value={field.searchValue}
          onChange={(e) => onUpdateField(index, "searchValue", e.target.value)}
          placeholder={compact ? "المحدد..." : "أدخل محدد العنصر..."}
        />
      </td>

      {/* الأعمدة الإضافية للنسخة الكاملة فقط */}
      {!compact && (
        <>
          {/* عمود قيمة الحقن */}
          <td className="col-injection">
            <input
              type="text"
              className={inputClass}
              value={field.inputValue || ""}
              onChange={(e) =>
                onUpdateField(index, "inputValue", e.target.value)
              }
              placeholder="قيمة الحقن..."
            />
          </td>

          {/* عمود طريقة التحقق */}
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

          {/* عمود الشروط JSON */}
          <td className="col-conditions">
            <textarea
              className={`${inputClass} font-monospace`}
              rows={2}
              value={
                typeof field.conditions === "object"
                  ? JSON.stringify(field.conditions, null, 2)
                  : field.conditions || ""
              }
              onChange={(e) =>
                onUpdateField(index, "conditions", e.target.value)
              }
              placeholder='{"key": "value"}'
            />
          </td>
        </>
      )}

      {/* عمود الحذف */}
      <td className="text-center col-action-sm">
        <button
          className="btn btn-sm btn-outline-danger p-1 d-inline-flex align-items-center justify-content-center"
          onClick={() => onDeleteField(index)}
          title="حذف الحقل"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};
