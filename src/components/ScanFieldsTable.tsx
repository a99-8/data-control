import React from "react";
import { Plus, Trash2, CheckSquare, Square } from "lucide-react";
import type { ScanFieldsTableProps, SearchType } from "@/src/types";
import { useTranslation } from "react-i18next";

export const ScanFieldsTable: React.FC<ScanFieldsTableProps> = ({
  fields,
  selectedIds,
  isAllSelected,
  toggleSelectAll,
  toggleSelectField,
  handleAddField,
  handleMoveField,
  handleUpdateField,
  handleDeleteField,
}) => {
  const { t } = useTranslation();

  return (
    <div className="card border-secondary shadow-sm bg-dark text-white mb-3">
      <div className="card-header py-2 bg-dark border-secondary d-flex justify-content-between align-items-center text-white">
        <h6 className="fw-bold text-primary m-0">
          {t("extracted_fields_list")} ({fields.length})
        </h6>
        <button
          className="btn btn-success btn-sm d-inline-flex align-items-center gap-1 fw-bold"
          onClick={handleAddField}
        >
          <Plus size={16} /> <span>{t("empty_field")}</span>
        </button>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-dark table-bordered table-hover align-middle mb-0">
            <thead className="table-dark text-center small border-secondary">
              <tr>
                <th style={{ width: "40px" }}>
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
                <th style={{ width: "55px" }}>{t("order")}</th>
                <th>{t("field_name")}</th>
                <th style={{ width: "130px" }}>{t("selector_type")}</th>
                <th>{t("element_selector")}</th>
                <th style={{ width: "40px" }}>{t("delete")}</th>
              </tr>
            </thead>
            <tbody className="small">
              {fields.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-light py-4">
                    {t("no_fields_in_table")}
                  </td>
                </tr>
              ) : (
                fields.map((fld, fIdx) => (
                  <tr key={fld.id}>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedIds.has(fld.id)}
                        onChange={() => toggleSelectField(fld.id)}
                      />
                    </td>

                    <td className="text-center">
                      <input
                        type="number"
                        className="form-control form-control-sm text-center px-1 bg-dark text-white border-secondary"
                        min={1}
                        max={fields.length}
                        value={fIdx + 1}
                        onChange={(e) => {
                          const newIndex = parseInt(e.target.value, 10) - 1;
                          if (
                            !isNaN(newIndex) &&
                            newIndex >= 0 &&
                            newIndex < fields.length
                          ) {
                            handleMoveField(fIdx, newIndex);
                          }
                        }}
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm bg-dark text-white border-secondary"
                        value={fld.fieldName}
                        onChange={(e) =>
                          handleUpdateField(fIdx, "fieldName", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <select
                        className="form-select form-select-sm bg-dark text-white border-secondary"
                        value={fld.searchType}
                        onChange={(e) =>
                          handleUpdateField(
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
                        className="form-control form-control-sm font-monospace bg-dark text-white border-secondary"
                        value={fld.searchValue}
                        onChange={(e) =>
                          handleUpdateField(fIdx, "searchValue", e.target.value)
                        }
                      />
                    </td>

                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-danger p-1"
                        onClick={() => handleDeleteField(fIdx)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
