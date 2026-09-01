import { browser } from "wxt/browser";
import {
  Zap,
  Syringe,
  Download,
  Scan,
  Settings,
  ArrowRightLeft,
  Copy,
  Globe,
  Layers,
} from "lucide-react";
import { ModalProvider } from "@/src/components/ModalContext";
import { usePopupAction } from "@/src/hooks/usePopupAction";
import { useTranslation } from "react-i18next";
import "@/src/other/style.css";

function PopupContent() {
  const {
    groups,
    selectedIdx,
    setSelectedIdx,
    selectedSectionId,
    setSelectedSectionId,
    targetIdx,
    setTargetIdx,
    handleExecute,
  } = usePopupAction();

  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith("ar") ? "en" : "ar";
    i18n.changeLanguage(nextLang);
  };

  const selectedGroup = selectedIdx !== "" ? groups[Number(selectedIdx)] : null;
  const hasSections = Boolean(
    selectedGroup?.sections && selectedGroup.sections.length > 0,
  );

  return (
    <div className="app-shell p-3 popup-container">
      <header className="app-header mb-3 d-flex align-items-center justify-content-between pb-2 border-bottom">
        <h6 className="m-0 fw-bold d-flex align-items-center gap-2">
          <Zap className="text-warning fill-warning" size={20} />
          {t("comprehensive_data_tool")}
        </h6>
        <button
          onClick={toggleLanguage}
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
          title={t("change_language")}
        >
          <Globe size={14} />
          <span className="fw-bold">
            {i18n.language.toUpperCase().slice(0, 2)}
          </span>
        </button>
      </header>

      <main>
        <div className="mb-3">
          <label className="form-label small fw-semibold">
            {t("select_source_group")}
          </label>
          <select
            className="form-select form-select-sm"
            value={selectedIdx}
            onChange={(e) => {
              const newIdx = e.target.value;
              setSelectedIdx(newIdx);
              if (newIdx !== "") {
                const grp = groups[Number(newIdx)];
                if (grp?.sections && grp.sections.length > 0) {
                  setSelectedSectionId(grp.sections[0].id);
                } else {
                  setSelectedSectionId("");
                }
              } else {
                setSelectedSectionId("");
              }
            }}
          >
            <option value="">{t("select_group_placeholder")}</option>
            {groups.map((grp, idx) => (
              <option key={grp.id} value={idx}>
                {grp.name} {grp.isInjectionGroup ? "(حقن)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* عرض قائمة اختيار الأقسام في حال وجودها في المجموعة */}
        {hasSections && (
          <div className="mb-3 bg-dark p-2 rounded border border-secondary">
            <label className="form-label small fw-semibold text-warning d-flex align-items-center gap-1">
              <Layers size={14} /> {t("select_section_to_inject")}
            </label>
            <select
              className="form-select form-select-sm bg-dark text-white border-secondary"
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
            >
              {selectedGroup?.sections?.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
              <option value="__ALL__">
                {t("all_sections_warning")}
              </option>
            </select>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label small fw-semibold">
            {t("select_target_group")}
          </label>
          <select
            className="form-select form-select-sm"
            value={targetIdx}
            onChange={(e) => setTargetIdx(e.target.value)}
          >
            <option value="">{t("select_target_group_placeholder")}</option>
            {groups.map((grp, idx) => (
              <option key={grp.id} value={idx}>
                {grp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="d-grid gap-2 mt-3">
          <button
            className="btn btn-secondary fw-bold d-flex align-items-center justify-content-center gap-2"
            onClick={() => handleExecute("COPY_DATA")}
          >
            <Copy size={18} />
            <span>{t("extract_and_copy")}</span>
          </button>

          <button
            className="btn btn-primary fw-bold d-flex align-items-center justify-content-center gap-2"
            onClick={() => handleExecute("INJECT_DATA")}
          >
            <Syringe size={18} />
            <span>{t("start_injection")}</span>
          </button>

          <button
            className="btn btn-success fw-bold d-flex align-items-center justify-content-center gap-2"
            onClick={() => handleExecute("SCRAPE_DATA")}
          >
            <Download size={18} />
            <span>{t("start_extraction")}</span>
          </button>

          <button
            className="btn btn-info text-white fw-bold d-flex align-items-center justify-content-center gap-2"
            onClick={() => handleExecute("TRANSFER_DATA")}
          >
            <ArrowRightLeft size={18} />
            <span>{t("direct_transfer")}</span>
          </button>

          <button
            className="btn btn-warning fw-bold d-flex align-items-center justify-content-center gap-2"
            onClick={() => handleExecute("SCAN_AND_OPEN_PANEL")}
          >
            <Scan size={18} />
            <span>{t("scan_user_element")}</span>
          </button>

          <button
            className="btn btn-outline-secondary btn-sm mt-2 d-flex align-items-center justify-content-center gap-2"
            onClick={() => browser.runtime.openOptionsPage()}
          >
            <Settings size={16} />
            <span>{t("settings_page")}</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default function PopupApp() {
  return (
    <ModalProvider>
      <PopupContent />
    </ModalProvider>
  );
}
