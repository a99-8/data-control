import { useState, useCallback, useRef, useEffect } from "react";
import type { ExtendedGroupsTableProps } from "@/src/types";
import {
  Folder,
  Plus,
  Upload,
  Trash2,
  FileSpreadsheet,
  Download,
  FileJson,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export function GroupsTable({
  groups,
  activeGroupIdx,
  onSelectGroup,
  onAddGroup,
  onDeleteGroup,
  onDeleteAll,
  onUpdateGroupName,
  onImportJSON,
  onExportGroupJSON,
  onExportGroupCSV,
  onImportGroupJSON,
  onImportGroupCSV,
}: ExtendedGroupsTableProps) {
  const { t, i18n } = useTranslation();
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);

  const closeDropdown = useCallback(() => {
    setOpenDropdownIdx(null);
  }, []);

  function useClickOutside<T extends HTMLElement>(handler: () => void) {
    const domNode = useRef<T | null>(null);

    useEffect(() => {
      const maybeHandler = (event: MouseEvent) => {
        if (
          domNode.current &&
          !domNode.current.contains(event.target as Node)
        ) {
          handler();
        }
      };

      document.addEventListener("mousedown", maybeHandler);

      return () => {
        document.removeEventListener("mousedown", maybeHandler);
      };
    }, [handler]);

    return domNode;
  }

  const dropdownRef = useClickOutside<HTMLDivElement>(closeDropdown);

  const toggleDropdown = (idx: number) => {
    setOpenDropdownIdx(openDropdownIdx === idx ? null : idx);
  };

  const isRtl = i18n.language.startsWith("ar");

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header py-3 border-0">
        <h4 className="card-title fw-bold m-0 d-flex align-items-center gap-2">
          <Folder className="text-primary" size={24} /> {t("groups")}
        </h4>
      </div>
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2 mb-3">
          <button
            className="btn btn-primary d-inline-flex align-items-center gap-1"
            onClick={onAddGroup}
          >
            <Plus size={18} /> {t("add_group")}
          </button>
          <label className="btn btn-outline-secondary m-0 cursor-pointer d-inline-flex align-items-center gap-1">
            <Upload size={18} /> {t("import_json")}
            <input
              type="file"
              className="d-none"
              accept=".json"
              onChange={onImportJSON}
            />
          </label>
          <button
            className={`btn btn-outline-danger d-inline-flex align-items-center gap-1 ${
              isRtl ? "me-auto" : "ms-auto"
            }`}
            onClick={onDeleteAll}
          >
            <Trash2 size={18} /> {t("delete_all")}
          </button>
        </div>

        <div className="table-responsive" style={{ overflow: "visible" }}>
          <table className="table table-hover align-middle border mb-0">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>{t("group_name")}</th>
                <th className="text-center" style={{ width: "60%" }}>
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((grp, idx) => {
                const isOpen = openDropdownIdx === idx;
                return (
                  <tr
                    key={grp.id}
                    className={activeGroupIdx === idx ? "table-active" : ""}
                  >
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={grp.name}
                        onChange={(e) => onUpdateGroupName(idx, e.target.value)}
                      />
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        <div
                          ref={isOpen ? dropdownRef : null}
                          className="btn-group btn-group-sm position-relative"
                        >
                          <button
                            type="button"
                            className="btn btn-outline-success dropdown-toggle d-inline-flex align-items-center gap-1"
                            onClick={() => toggleDropdown(idx)}
                          >
                            <ArrowUpDown size={14} /> {t("import_export")}
                          </button>

                          {isOpen && (
                            <ul
                              className="dropdown-menu show shadow-lg"
                              style={{
                                position: "absolute",
                                top: "100%",
                                [isRtl ? "right" : "left"]: "0",
                                zIndex: 9999,
                                marginTop: "4px",
                                minWidth: "170px",
                                backgroundColor: "#1e293b",
                                borderColor: "rgba(255, 255, 255, 0.15)",
                                color: "#f8fafc",
                              }}
                            >
                              <li>
                                <label className="dropdown-item d-flex align-items-center gap-2 cursor-pointer m-0 text-light dark-item">
                                  <FileSpreadsheet size={16} />{" "}
                                  {t("upload_from_csv")}
                                  <input
                                    type="file"
                                    className="d-none"
                                    accept=".csv"
                                    onChange={(e) => {
                                      onImportGroupCSV?.(idx, e);
                                      closeDropdown();
                                    }}
                                  />
                                </label>
                              </li>
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item d-flex align-items-center gap-2 text-start text-light dark-item"
                                  onClick={() => {
                                    onExportGroupCSV?.(idx);
                                    closeDropdown();
                                  }}
                                >
                                  <Download size={16} /> {t("download_csv")}
                                </button>
                              </li>
                              <li>
                                <hr
                                  className="dropdown-divider my-1"
                                  style={{
                                    borderColor: "rgba(255, 255, 255, 0.1)",
                                  }}
                                />
                              </li>
                              <li>
                                <label className="dropdown-item d-flex align-items-center gap-2 cursor-pointer m-0 text-light dark-item">
                                  <FileJson size={16} /> {t("upload_from_json")}
                                  <input
                                    type="file"
                                    className="d-none"
                                    accept=".json"
                                    onChange={(e) => {
                                      onImportGroupJSON?.(idx, e);
                                      closeDropdown();
                                    }}
                                  />
                                </label>
                              </li>
                              <li>
                                <button
                                  type="button"
                                  className="dropdown-item d-flex align-items-center gap-2 text-start text-light dark-item"
                                  onClick={() => {
                                    onExportGroupJSON?.(idx);
                                    closeDropdown();
                                  }}
                                >
                                  <Download size={16} /> {t("download_json")}
                                </button>
                              </li>
                            </ul>
                          )}
                        </div>

                        <button
                          className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
                          onClick={() => onSelectGroup(idx)}
                        >
                          <SlidersHorizontal size={14} /> {t("fields")} (
                          {grp.fields?.length || 0})
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger d-inline-flex align-items-center gap-1"
                          onClick={() => onDeleteGroup(idx)}
                        >
                          <Trash2 size={14} /> {t("delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
