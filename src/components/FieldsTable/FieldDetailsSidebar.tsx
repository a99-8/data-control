import React from "react";
import type { Field, SearchType, VerificationMode } from "@/src/other/types";
import { Settings2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FieldDetailsSidebarProps {
  field: Field;
  index: number;
  isInjectionGroup: boolean;
  onUpdateField: (index: number, key: keyof Field, value: any) => void;
  onClose: () => void;
}

export const FieldDetailsSidebar: React.FC<FieldDetailsSidebarProps> = ({
  field,
  index,
  isInjectionGroup,
  onUpdateField,
  onClose,
}) => {
  const { t } = useTranslation();

  const inputClass =
    "form-control form-control-sm bg-dark text-white border-secondary";
  const selectClass =
    "form-select form-select-sm bg-dark text-white border-secondary";

  return (
    <div
      className="bg-secondary bg-opacity-10 border border-secondary rounded p-3 shadow position-sticky"
      style={{ width: "320px", minWidth: "320px", top: "1rem", zIndex: 10 }}
    >
      {/* الهيدر وزر الإغلاق */}
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
        <h6 className="m-0 text-info fw-bold d-flex align-items-center gap-2">
          <Settings2 size={18} />
          {t("field_options")}: {field.fieldName || field.id}
        </h6>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary p-1"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      <div className="d-flex flex-column gap-3">
        {/* 1. نوع البحث */}
        <div>
          <label className="form-label small fw-bold text-light mb-1">
            {t("search_type")}
          </label>
          <select
            className={selectClass}
            value={field.searchType}
            onChange={(e) =>
              onUpdateField(index, "searchType", e.target.value as SearchType)
            }
          >
            <option value="elementId">ID</option>
            <option value="elementLabel">Label</option>
            <option value="regexId">Regex</option>
            <option value="cssSelector">Selector</option>
            <option value="elementPlaceholder">Placeholder</option>
            <option value="formControlName">FormControl</option>
            <option value="defaultValue">Default</option>
          </select>
        </div>

        {/* 2. محدد العنصر */}
        <div>
          <label className="form-label small fw-bold text-light mb-1">
            {t("element_selector")}
          </label>
          <input
            type="text"
            className={`${inputClass} font-monospace`}
            value={field.searchValue}
            onChange={(e) =>
              onUpdateField(index, "searchValue", e.target.value)
            }
            placeholder={t("element_selector")}
          />
        </div>

        {/* 3. قيمة الحقن */}
        {isInjectionGroup && (
          <div>
            <label className="form-label small fw-bold text-light mb-1">
              {t("injection_value")}
            </label>
            <input
              type="text"
              className={inputClass}
              value={field.inputValue || ""}
              onChange={(e) =>
                onUpdateField(index, "inputValue", e.target.value)
              }
              placeholder={t("injection_value")}
            />
          </div>
        )}

        {/* 4. كيفية التحقق */}
        <div>
          <label className="form-label small fw-bold text-light mb-1">
            {t("verification_mode")}
          </label>
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
            <option value="none">{t("none")}</option>
            <option value="extract_compare">{t("extract_and_compare")}</option>
            <option value="compare_only">{t("compare_only")}</option>
          </select>
        </div>
      </div>
    </div>
  );
};
