import { useState, useEffect } from "react";
import { browser } from "wxt/browser";
import type {
  Group,
  InspectedElementData,
  SearchType,
  TableField,
} from "@/src/other/types";
import { getGroups, saveGroups, reorderArray } from "@/src/utils";
import { useModal } from "@/src/components/ModalContext";
import { useTranslation } from "react-i18next";

export function useSidePanelInspector() {
  const { t } = useTranslation();
  const { showAlert } = useModal();

  const [inspecting, setInspecting] = useState(false);
  const [inspectedData, setInspectedData] =
    useState<InspectedElementData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [selectedAttribute, setSelectedAttribute] =
    useState<SearchType>("elementId");
  const [customFieldName, setCustomFieldName] = useState<string>("");
  const [fields, setFields] = useState<TableField[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<string>("");

  const noneText = t("none");

  useEffect(() => {
    getGroups().then(setGroups);
  }, []);

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.action === "ELEMENT_INSPECTED") {
        setInspectedData(message.payload);
        setInspecting(false);
      }
    };

    browser.runtime.onMessage.addListener(messageListener);
    return () => {
      browser.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  useEffect(() => {
    if (inspectedData) {
      if (
        inspectedData.elementId &&
        inspectedData.elementId !== "لا يوجد" &&
        inspectedData.elementId !== noneText
      ) {
        setSelectedAttribute("elementId");
      } else if (
        inspectedData.formControlName &&
        inspectedData.formControlName !== "لا يوجد" &&
        inspectedData.formControlName !== noneText
      ) {
        setSelectedAttribute("formControlName");
      } else if (
        inspectedData.elementPlaceholder &&
        inspectedData.elementPlaceholder !== "لا يوجد" &&
        inspectedData.elementPlaceholder !== noneText
      ) {
        setSelectedAttribute("elementPlaceholder");
      }
    }
  }, [inspectedData, noneText]);

  const startInspect = async () => {
    setInspecting(true);
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) {
      browser.tabs.sendMessage(tab.id, { action: "START_INSPECT" });
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    if (text === "لا يوجد" || text === noneText) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleAddInspectedToTable = () => {
    if (!inspectedData || !customFieldName.trim()) {
      showAlert(
        t("enter_field_name_and_select_element"),
        "warning",
        t("warning"),
      );
      return;
    }

    let searchValue = "";
    if (selectedAttribute === "elementId")
      searchValue = inspectedData.elementId;
    if (selectedAttribute === "formControlName")
      searchValue = inspectedData.formControlName;
    if (selectedAttribute === "elementPlaceholder")
      searchValue = inspectedData.elementPlaceholder;

    if (!searchValue || searchValue === "لا يوجد" || searchValue === noneText) {
      showAlert(t("invalid_selected_option_value"), "warning", t("error"));
      return;
    }

    const nextNum = fields.length + 1;
    const newId = `fld_${nextNum}`;

    const newField: TableField = {
      id: newId,
      enabled: true,
      fieldName: customFieldName.trim(),
      searchType: selectedAttribute,
      searchValue: searchValue,
      inputValue: "",
      conditions: "",
    };

    setFields((prev) => [...prev, newField]);
    setSelectedIds((prev) => new Set([...prev, newField.id]));
    setCustomFieldName("");
  };

  const handleAddField = () => {
    const nextNum = fields.length + 1;
    const newId = `fld_${nextNum}`;

    const newField: TableField = {
      id: newId,
      enabled: true,
      fieldName: "",
      searchType: "elementId",
      searchValue: "",
      inputValue: "",
      conditions: "",
    };

    setFields([...fields, newField]);
    setSelectedIds((prev) => new Set([...prev, newField.id]));
  };

  const handleUpdateField = (
    index: number,
    key: keyof TableField,
    value: any,
  ) => {
    const updated = [...fields];
    const targetField = updated[index];
    if (targetField) {
      updated[index] = { ...targetField, [key]: value };
      setFields(updated);
    }
  };

  const handleDeleteField = (index: number) => {
    const fieldToDelete = fields[index];
    if (!fieldToDelete) return;

    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);

    const nextSelected = new Set(selectedIds);
    nextSelected.delete(fieldToDelete.id);
    setSelectedIds(nextSelected);
  };

  const handleMoveField = (fromIdx: number, toIdx: number) => {
    setFields((prev) => reorderArray(prev, fromIdx, toIdx));
  };

  const toggleSelectField = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (fields.length === 0) return;
    if (fields.every((f) => selectedIds.has(f.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(fields.map((f) => f.id)));
    }
  };

  const handleAddSelectedToGroup = async () => {
    if (selectedGroupIdx === "" || selectedIds.size === 0) return;

    const groupIdx = Number(selectedGroupIdx);
    const targetGroup = groups[groupIdx];
    if (!targetGroup) return;

    const fieldsToAdd = fields.filter((f) => selectedIds.has(f.id));

    const updatedGroups = [...groups];
    updatedGroups[groupIdx] = {
      ...targetGroup,
      fields: [...(targetGroup.fields || []), ...fieldsToAdd],
    };

    setGroups(updatedGroups);
    await saveGroups(updatedGroups);

    showAlert(
      t("fields_added_to_group_success", {
        count: fieldsToAdd.length,
        groupName: targetGroup.name,
      }),
      "success",
      t("success"),
    );
  };

  return {
    inspecting,
    inspectedData,
    copiedKey,
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
    copyToClipboard,
    handleAddInspectedToTable,
    handleAddField,
    handleUpdateField,
    handleDeleteField,
    handleMoveField,
    toggleSelectField,
    toggleSelectAll,
    handleAddSelectedToGroup,
  };
}
