import { useSingleGroupActions } from "@/src/hooks/useSingleGroupActions";
import { useGroupsManager } from "@/src/hooks/useGroupsManager";
import { useFieldsManager } from "@/src/hooks/useFieldsManager";
import { GroupsTable } from "@/src/components/GroupsTable";
import { FullFieldsTable } from "@/src/components/FieldsTable/FullFieldsTable";
import { ModalProvider } from "@/src/components/ModalContext";
import { Sparkles, Globe } from "lucide-react";
import "@/src/other/style.css";
import { useTranslation } from "react-i18next";

function OptionsContent() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith("ar") ? "en" : "ar";
    i18n.changeLanguage(nextLang);
  };

  const {
    groups,
    activeGroupIdx,
    setActiveGroupIdx,
    handleAddGroup,
    handleDeleteGroup,
    handleDeleteAll,
    handleUpdateGroupName,
    handleToggleInjectionGroup,
    handleAddSection,
    handleDeleteSection,
    handleExportAllJSON,
    handleImportAllJSON,
    updateAndSaveGroups,
    setGroups,
  } = useGroupsManager();

  const {
    handleExportGroupJSON,
    handleExportGroupCSV,
    handleImportGroupJSON,
    handleImportGroupCSV,
  } = useSingleGroupActions(groups, updateAndSaveGroups);

  const {
    activeGroup,
    handleAddField,
    handleUpdateField,
    handleDeleteField,
    handleSaveFields,
    handleMoveField,
  } = useFieldsManager(groups, activeGroupIdx, setGroups, updateAndSaveGroups);

  return (
    <div className="container-xxl px-4 py-4">
      <div className="page-title-bar mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h3 className="m-0 d-flex align-items-center gap-2">
          <Sparkles size={20} className="text-warning" />
          <span>{t("Injection and Extraction Group Settings")}</span>
        </h3>
        <button
          onClick={toggleLanguage}
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
          title={t("change_language")}
        >
          <Globe size={16} />
          <span className="fw-bold">
            {i18n.language.toUpperCase().slice(0, 2)}
          </span>
        </button>
      </div>

      <div className="mb-4">
        <GroupsTable
          groups={groups}
          activeGroupIdx={activeGroupIdx}
          onSelectGroup={setActiveGroupIdx}
          onAddGroup={handleAddGroup}
          onDeleteGroup={handleDeleteGroup}
          onDeleteAll={handleDeleteAll}
          onUpdateGroupName={handleUpdateGroupName}
          onToggleInjectionGroup={handleToggleInjectionGroup}
          onImportJSON={handleImportAllJSON}
          onExportAllJSON={handleExportAllJSON}
          onExportGroupJSON={handleExportGroupJSON}
          onExportGroupCSV={handleExportGroupCSV}
          onImportGroupJSON={handleImportGroupJSON}
          onImportGroupCSV={handleImportGroupCSV}
        />
      </div>

      {activeGroup && (
        <div className="mt-4">
          <FullFieldsTable
            fields={activeGroup.fields || []}
            activeGroup={activeGroup}
            activeGroupName={activeGroup.name}
            onAddField={handleAddField}
            onUpdateField={handleUpdateField}
            onDeleteField={handleDeleteField}
            onSaveFields={handleSaveFields}
            onMoveField={handleMoveField}
            onAddSection={(name) =>
              activeGroupIdx !== null && handleAddSection(activeGroupIdx, name)
            }
            onDeleteSection={(secId) =>
              activeGroupIdx !== null &&
              handleDeleteSection(activeGroupIdx, secId)
            }
          />
        </div>
      )}
    </div>
  );
}

export default function OptionsApp() {
  return (
    <ModalProvider>
      <OptionsContent />
    </ModalProvider>
  );
}
