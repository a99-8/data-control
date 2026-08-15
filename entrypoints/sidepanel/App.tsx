import { useSidePanelInspector } from "@/src/hooks/useSidePanelInspector";
import { Search, Plus, Globe } from "lucide-react";
import { ModalProvider } from "@/src/components/ModalContext";
import { useTranslation } from "react-i18next";
import { FieldsTable } from "@/src/components/FieldsTable";

function SidePanel() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith("ar") ? "en" : "ar";
    i18n.changeLanguage(nextLang);
  };

  const {
    inspecting,
    inspectedData,
    selectedAttribute,
    setSelectedAttribute,
    customFieldName,
    setCustomFieldName,
    fields,
    selectedIds,
    groups,
    selectedGroupIdx,
    setSelectedGroupIdx,
    startInspect,
    handleAddInspectedToTable,
    handleAddField,
    handleUpdateField,
    handleDeleteField,
    handleMoveField,
    toggleSelectField,
    toggleSelectAll,
    handleAddSelectedToGroup,
  } = useSidePanelInspector();

  const isAllSelected =
    fields.length > 0 && fields.every((f) => selectedIds.has(f.id));

  const formatInspectedValue = (val: string | undefined) => {
    if (!val || val === "لا يوجد" || val === "None") return t("none");
    return val;
  };

  return (
    <div className="p-3 bg-dark text-white min-vh-100">
      {/* زر التبديل بين اللغات في الأعلى */}
      <div className="d-flex justify-content-end mb-2">
        <button
          onClick={toggleLanguage}
          className="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
          title={t("change_language")}
        >
          <Globe size={14} />
          <span className="fw-bold">
            {i18n.language.toUpperCase().slice(0, 2)}
          </span>
        </button>
      </div>

      {/* Container موحد يجمع التفتيش واختيار المجموعات مع زر الإضافة */}
      <div className="card shadow-sm border-secondary bg-dark text-white mb-3">
        <div className="card-body p-3 d-flex flex-column gap-3">
          {/* قسم زر الفحص واستعراض الخصائص */}
          <div>
            <button
              className={`btn ${inspecting ? "btn-warning" : "btn-primary"} w-100 mb-3 d-flex align-items-center justify-content-center gap-2 fw-bold`}
              onClick={startInspect}
              disabled={inspecting}
            >
              <Search size={18} />
              <span>
                {inspecting
                  ? t("click_any_element")
                  : t("select_element_from_page")}
              </span>
            </button>

            {inspectedData && (
              <div className="bg-secondary bg-opacity-25 text-white p-3 rounded-3 shadow-sm border border-secondary">
                <h6 className="fw-bold mb-3 border-bottom border-secondary pb-2 text-center text-light">
                  {t("selected_element_properties")}
                </h6>

                <div className="d-flex flex-column gap-2 mb-3">
                  <label
                    className={`d-flex justify-content-between align-items-center p-2 rounded cursor-pointer border ${
                      selectedAttribute === "elementId"
                        ? "border-primary bg-secondary bg-opacity-50"
                        : "bg-secondary bg-opacity-25 border-transparent"
                    }`}
                  >
                    <div className="text-start overflow-hidden me-2">
                      <small className="text-light d-block text-uppercase fw-semibold">
                        id
                      </small>
                      <span className="fw-bold text-white text-break">
                        {formatInspectedValue(inspectedData.elementId)}
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="inspectedAttribute"
                      className="form-check-input"
                      checked={selectedAttribute === "elementId"}
                      disabled={
                        inspectedData.elementId === "لا يوجد" ||
                        inspectedData.elementId === "None"
                      }
                      onChange={() => setSelectedAttribute("elementId")}
                    />
                  </label>

                  <label
                    className={`d-flex justify-content-between align-items-center p-2 rounded cursor-pointer border ${
                      selectedAttribute === "formControlName"
                        ? "border-primary bg-secondary bg-opacity-50"
                        : "bg-secondary bg-opacity-25 border-transparent"
                    }`}
                  >
                    <div className="text-start overflow-hidden me-2">
                      <small className="text-light d-block text-uppercase fw-semibold">
                        formControlName
                      </small>
                      <span className="fw-bold text-white text-break">
                        {formatInspectedValue(inspectedData.formControlName)}
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="inspectedAttribute"
                      className="form-check-input"
                      checked={selectedAttribute === "formControlName"}
                      disabled={
                        inspectedData.formControlName === "لا يوجد" ||
                        inspectedData.formControlName === "None"
                      }
                      onChange={() => setSelectedAttribute("formControlName")}
                    />
                  </label>

                  <label
                    className={`d-flex justify-content-between align-items-center p-2 rounded cursor-pointer border ${
                      selectedAttribute === "elementPlaceholder"
                        ? "border-primary bg-secondary bg-opacity-50"
                        : "bg-secondary bg-opacity-25 border-transparent"
                    }`}
                  >
                    <div className="text-start overflow-hidden me-2">
                      <small className="text-light d-block text-uppercase fw-semibold">
                        elementPlaceholder
                      </small>
                      <span className="fw-bold text-white text-break">
                        {formatInspectedValue(inspectedData.elementPlaceholder)}
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="inspectedAttribute"
                      className="form-check-input"
                      checked={selectedAttribute === "elementPlaceholder"}
                      disabled={
                        inspectedData.elementPlaceholder === "لا يوجد" ||
                        inspectedData.elementPlaceholder === "None"
                      }
                      onChange={() =>
                        setSelectedAttribute("elementPlaceholder")
                      }
                    />
                  </label>
                </div>

                <div className="row g-2">
                  <div className="col-8">
                    <input
                      type="text"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      placeholder={t("enter_field_name_placeholder")}
                      value={customFieldName}
                      onChange={(e) => setCustomFieldName(e.target.value)}
                    />
                  </div>
                  <div className="col-4">
                    <button
                      className="btn btn-success btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-1"
                      onClick={handleAddInspectedToTable}
                    >
                      <Plus size={16} /> <span>{t("add")}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-secondary my-1" />

          {/* قسم ربط المجموعة */}
          <div>
            <label className="form-label small fw-bold mb-2">
              {t("select_group_to_link")}
            </label>
            <select
              className="form-select form-select-sm bg-dark text-white border-secondary mb-3"
              value={selectedGroupIdx}
              onChange={(e) => setSelectedGroupIdx(e.target.value)}
            >
              <option value="">{t("select_group_placeholder")}</option>
              {groups.map((grp, idx) => (
                <option key={grp.id} value={idx}>
                  {grp.name}
                </option>
              ))}
            </select>

            <button
              className="btn btn-primary fw-bold w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={handleAddSelectedToGroup}
              disabled={selectedGroupIdx === "" || selectedIds.size === 0}
            >
              <Plus size={18} />
              <span>
                {t("add_selected_fields")} ({selectedIds.size}) {t("to_group")}
              </span>
            </button>
          </div>
        </div>
      </div>

      <FieldsTable
        compact={true}
        fields={fields}
        selectedIds={selectedIds}
        isAllSelected={isAllSelected}
        toggleSelectAll={toggleSelectAll}
        toggleSelectField={toggleSelectField}
        onAddField={handleAddField}
        onUpdateField={handleUpdateField}
        onDeleteField={handleDeleteField}
        onMoveField={handleMoveField}
      />
    </div>
  );
}

export default function SidePanelApp() {
  return (
    <ModalProvider>
      <SidePanel />
    </ModalProvider>
  );
}
