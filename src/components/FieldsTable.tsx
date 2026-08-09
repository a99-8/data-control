import type { SearchType, FieldsTableProps } from "@/src/types";
import { Plus, Trash2, Save } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FieldsTable({
  activeGroup,
  onAddField,
  onUpdateField,
  onDeleteField,
  onSaveFields,
  onMoveField,
}: FieldsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header py-3 d-flex justify-content-between align-items-center border-0">
        <h5 className="card-title fw-bold text-primary m-0">
          {t("configure_fields_for_group")}: ({activeGroup.name})
        </h5>
        <button
          className="btn btn-success btn-sm d-inline-flex align-items-center gap-1"
          onClick={onAddField}
        >
          <Plus size={16} /> {t("add_new_field")}
        </button>
      </div>
      <div className="card-body">
        <div className="table-responsive mb-3">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-light text-center">
              <tr>
                <th style={{ width: "60px" }}>{t("order")}</th>
                <th style={{ width: "120px" }}>{t("field_id")}</th>
                <th style={{ width: "50px" }}>{t("enable")}</th>
                <th>{t("field_name")}</th>
                <th style={{ width: "170px" }}>{t("search_type")}</th>
                <th>{t("element_selector")}</th>
                <th>{t("injection_value")}</th>
                <th style={{ width: "200px" }}>{t("conditions_json")}</th>
                <th style={{ width: "50px" }}>{t("delete")}</th>
              </tr>
            </thead>
            <tbody>
              {activeGroup.fields?.map((fld, fIdx) => (
                <tr key={fld.id}>
                  {/* الترتيب الرقمي */}
                  <td className="text-center" style={{ width: "80px" }}>
                    <input
                      type="number"
                      className="form-control form-control-sm text-center px-1 no-spinner"
                      min={1}
                      max={activeGroup.fields.length}
                      value={fIdx + 1}
                      onChange={(e) => {
                        const newIndex = parseInt(e.target.value, 10) - 1;
                        if (
                          !isNaN(newIndex) &&
                          newIndex >= 0 &&
                          newIndex < activeGroup.fields.length
                        ) {
                          onMoveField(fIdx, newIndex);
                        }
                      }}
                    />
                  </td>

                  {/* ID الحقل */}
                  <td className="text-center">
                    <code className="small fw-bold">{fld.id}</code>
                  </td>

                  {/* التفعيل */}
                  <td className="text-center">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={fld.enabled ?? true}
                      onChange={(e) =>
                        onUpdateField(fIdx, "enabled", e.target.checked)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={fld.fieldName}
                      onChange={(e) =>
                        onUpdateField(fIdx, "fieldName", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={fld.searchType}
                      onChange={(e) =>
                        onUpdateField(
                          fIdx,
                          "searchType",
                          e.target.value as SearchType,
                        )
                      }
                    >
                      <option value="elementId">id</option>
                      <option value="regexId">Regex ID</option>
                      <option value="elementPlaceholder">Placeholder</option>
                      <option value="formControlName">formcontrolname</option>
                      <option value="defaultValue">default Value</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={fld.searchValue}
                      onChange={(e) =>
                        onUpdateField(fIdx, "searchValue", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={fld.inputValue}
                      onChange={(e) =>
                        onUpdateField(fIdx, "inputValue", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <textarea
                      className="form-control form-control-sm font-monospace"
                      rows={2}
                      value={
                        typeof fld.conditions === "object"
                          ? JSON.stringify(fld.conditions, null, 2)
                          : fld.conditions || ""
                      }
                      onChange={(e) =>
                        onUpdateField(fIdx, "conditions", e.target.value)
                      }
                    />
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-sm btn-outline-danger p-1 d-inline-flex align-items-center justify-content-center"
                      onClick={() => onDeleteField(fIdx)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-primary px-4 d-inline-flex align-items-center gap-2"
            onClick={onSaveFields}
          >
            <Save size={18} /> {t("save_changes")}
          </button>
        </div>
      </div>
    </div>
  );
}
