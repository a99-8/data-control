import { type ChangeEvent } from "react";
import type { Group, Field } from "@/src/types";
import { downloadCSV } from "@/src/utils";
import { useModal } from "@/src/components/ModalContext";
import { useTranslation } from "react-i18next";
import Papa from "papaparse";

export function useSingleGroupActions(
  groups: Group[],
  updateAndSaveGroups: (newGroups: Group[]) => void,
) {
  const { t } = useTranslation();
  const { showAlert } = useModal();

  const handleExportGroupJSON = (idx: number) => {
    const group = groups[idx];
    if (!group) return;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(group, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${group.name || "group"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportGroupCSV = (idx: number) => {
    const group = groups[idx];
    if (!group || !group.fields || group.fields.length === 0) {
      showAlert(t("no_fields_to_export"), "warning", t("warning"));
      return;
    }
    downloadCSV(group.fields, `${group.name || "group"}_fields.csv`);
  };

  const handleImportGroupJSON = (
    idx: number,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    const targetGroup = groups[idx];
    if (!file || !targetGroup) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const updated = [...groups];
        const fields = Array.isArray(parsed) ? parsed : parsed.fields || [];

        updated[idx] = {
          ...targetGroup,
          fields: fields,
        };

        updateAndSaveGroups(updated);
        showAlert(t("group_data_import_success"), "success", t("success"));
      } catch {
        showAlert(t("json_import_failed"), "danger", t("error"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportGroupCSV = (
    idx: number,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    const targetGroup = groups[idx];
    if (!file || !targetGroup) return;

    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedFields: Field[] = results.data.map((row, fIdx) => ({
          id: `fld_${Date.now()}_${fIdx}`,
          enabled: row.enabled ?? true,
          fieldName: row.fieldName || "",
          searchType: row.searchType || "elementId",
          searchValue: row.searchValue || "",
          inputValue: row.inputValue || "",
          conditions: row.conditions || "",
        }));

        const updated = [...groups];
        updated[idx] = { ...targetGroup, fields: importedFields };
        updateAndSaveGroups(updated);
        showAlert(t("csv_fields_import_success"), "success", t("success"));
      },
      error: () => {
        showAlert(t("csv_parse_failed"), "danger", t("error"));
      },
    });
    e.target.value = "";
  };

  return {
    handleExportGroupJSON,
    handleExportGroupCSV,
    handleImportGroupJSON,
    handleImportGroupCSV,
  };
}
