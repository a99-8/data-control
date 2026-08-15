import { useState, useCallback, useRef, useEffect } from "react";
import type { ExtendedGroupsTableProps } from "@/src/other/types";
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
    <div className="card border-0 shadow-sm">
      <div className="card-header py-3 border-0 bg-transparent">
        <h4 className="card-title fw-bold m-0 d-flex align-items-center gap-2">
          <Folder className="text-primary" size={24} />
          <span>{t("groups")}</span>
          <span className="badge bg-secondary ms-2">{groups.length}</span>
        </h4>
      </div>

      <div className="card-body pt-0">
        {/* شريط الأدوات */}
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

        {/* جدول المجموعات */}
        <div className="table-responsive">
          <table className="table table-hover align-middle border mb-0">
            <thead className="table-light">
              <tr>
                {/* تم نقل العرض إلى فئات Bootstrap والـ CSS */}
                <th className="col-group-name">{t("group_name")}</th>
                <th className="col-actions text-center">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center py-4 text-muted">
                    {t("no_groups_added") ||
                      "لا توجد مجموعات. أضف مجموعة جديدة"}
                  </td>
                </tr>
              ) : (
                groups.map((grp, idx) => {
                  const isOpen = openDropdownIdx === idx;
                  const isActive = activeGroupIdx === idx;

                  return (
                    <tr
                      key={grp.id}
                      className={
                        isActive ? "table-active custom-active-row" : ""
                      }
                    >
                      {/* عمود اسم المجموعة */}
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={grp.name}
                          onChange={(e) =>
                            onUpdateGroupName(idx, e.target.value)
                          }
                          placeholder={
                            t("enter_group_name") || "أدخل اسم المجموعة"
                          }
                        />
                      </td>

                      {/* عمود الإجراءات */}
                      <td className="text-center">
                        <div className="d-flex flex-wrap align-items-center justify-content-center gap-1">
                          {/* قائمة الاستيراد/التصدير */}
                          <div
                            ref={isOpen ? dropdownRef : null}
                            className="position-relative d-inline-block"
                          >
                            <button
                              type="button"
                              className="btn btn-outline-success btn-sm dropdown-toggle d-inline-flex align-items-center gap-1"
                              onClick={() => toggleDropdown(idx)}
                            >
                              <ArrowUpDown size={14} />
                              <span>{t("import_export")}</span>
                            </button>

                            {isOpen && (
                              /* تم تحويل التنسيقات المباشرة إلى الفئة custom-dropdown-menu */
                              <ul className="dropdown-menu show shadow-lg custom-dropdown-menu">
                                <li>
                                  <label className="dropdown-item d-flex align-items-center gap-2 cursor-pointer m-0 dark-item">
                                    <FileSpreadsheet size={16} />
                                    <span>{t("upload_from_csv")}</span>
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
                                    className="dropdown-item d-flex align-items-center gap-2 text-start dark-item"
                                    onClick={() => {
                                      onExportGroupCSV?.(idx);
                                      closeDropdown();
                                    }}
                                  >
                                    <Download size={16} />
                                    <span>{t("download_csv")}</span>
                                  </button>
                                </li>
                                <li>
                                  <hr className="dropdown-divider my-1 dark-divider" />
                                </li>
                                <li>
                                  <label className="dropdown-item d-flex align-items-center gap-2 cursor-pointer m-0 dark-item">
                                    <FileJson size={16} />
                                    <span>{t("upload_from_json")}</span>
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
                                    className="dropdown-item d-flex align-items-center gap-2 text-start dark-item"
                                    onClick={() => {
                                      onExportGroupJSON?.(idx);
                                      closeDropdown();
                                    }}
                                  >
                                    <Download size={16} />
                                    <span>{t("download_json")}</span>
                                  </button>
                                </li>
                              </ul>
                            )}
                          </div>

                          {/* زر الحقول */}
                          <button
                            className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                            onClick={() => onSelectGroup(idx)}
                          >
                            <SlidersHorizontal size={14} />
                            <span>{t("fields")}</span>
                            <span className="badge bg-primary bg-opacity-25 text-primary ms-1">
                              {grp.fields?.length || 0}
                            </span>
                          </button>

                          {/* زر الحذف */}
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1"
                            onClick={() => onDeleteGroup(idx)}
                          >
                            <Trash2 size={14} />
                            <span>{t("delete")}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
