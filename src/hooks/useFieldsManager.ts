import type { Group, Field } from "@/src/other/types";
import { saveGroups } from "@/src/utils";
import { useModal } from "@/src/components/ModalContext";
import { useTranslation } from "react-i18next";

export function useFieldsManager(
  groups: Group[],
  activeGroupIdx: number | null,
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>,
  updateAndSaveGroups: (newGroups: Group[]) => void,
) {
  const { t } = useTranslation();
  const { showAlert } = useModal();
  const activeGroup = activeGroupIdx !== null ? groups[activeGroupIdx] : null;

  const handleAddField = () => {
    if (activeGroupIdx === null || !groups[activeGroupIdx]) return;
    const updated = [...groups];
    const targetGroup = updated[activeGroupIdx];
    if (targetGroup) {
      targetGroup.fields = targetGroup.fields || [];

      // إنشاء معرف بناءً على عدد الحقول الحالية + 1
      const nextNum = targetGroup.fields.length + 1;
      const newId = `fld_${nextNum}`;

      targetGroup.fields.push({
        id: newId,
        enabled: true,
        extract: false,
        fieldName: t("new_field"),
        searchType: "elementId",
        searchValue: "",
        inputValue: "",
        conditions: "",
      });
      updateAndSaveGroups(updated);
    }
  };

  const handleUpdateField = (
    fieldIdx: number,
    key: keyof Field,
    value: any,
  ) => {
    if (activeGroupIdx === null || !groups[activeGroupIdx]) return;
    const updated = [...groups];
    const group = updated[activeGroupIdx];
    if (group && group.fields && group.fields[fieldIdx]) {
      group.fields[fieldIdx] = {
        ...group.fields[fieldIdx],
        [key]: value,
      };
      setGroups(updated);
    }
  };

  const handleDeleteField = (fieldIdx: number) => {
    if (activeGroupIdx === null || !groups[activeGroupIdx]) return;
    const updated = [...groups];
    const group = updated[activeGroupIdx];
    if (group && group.fields) {
      group.fields.splice(fieldIdx, 1);
      setGroups(updated);
    }
  };

  const handleSaveFields = () => {
    if (activeGroupIdx === null || !groups[activeGroupIdx]) return;
    const group = groups[activeGroupIdx];
    if (!group) return;

    for (const field of group.fields) {
      if (
        typeof field.conditions === "string" &&
        field.conditions.trim() !== ""
      ) {
        try {
          JSON.parse(field.conditions);
        } catch {
          showAlert(
            t("json_format_error", { fieldName: field.fieldName }),
            "danger",
            t("input_error"),
          );
          return;
        }
      }
    }

    saveGroups(groups);
    showAlert(t("changes_saved_success"), "success", t("saved"));
  };

  const handleMoveField = (fromIndex: number, toIndex: number) => {
    if (activeGroupIdx === null || !groups[activeGroupIdx]) return;
    const updated = [...groups];
    const group = updated[activeGroupIdx];
    if (group && group.fields) {
      if (toIndex < 0 || toIndex >= group.fields.length) return;

      const [movedField] = group.fields.splice(fromIndex, 1);

      if (movedField) {
        group.fields.splice(toIndex, 0, movedField);
        setGroups(updated);
      }
    }
  };

  return {
    activeGroup,
    handleAddField,
    handleUpdateField,
    handleDeleteField,
    handleSaveFields,
    handleMoveField,
  };
}
