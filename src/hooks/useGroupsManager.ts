import { useState, useEffect, type ChangeEvent } from "react";
import { getGroups, saveGroups } from "@/src/utils";
import type { Group } from "@/src/other/types";
import { useModal } from "@/src/components/ModalContext";
import { useTranslation } from "react-i18next";

export function useGroupsManager() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupIdx, setActiveGroupIdx] = useState<number | null>(null);
  const { showAlert, showConfirm } = useModal();

  useEffect(() => {
    document.body.classList.add("options-body");
    getGroups().then(setGroups);
  }, []);

  const updateAndSaveGroups = (newGroups: Group[]) => {
    setGroups(newGroups);
    saveGroups(newGroups);
  };

  const handleAddGroup = () => {
    const newGroup: Group = {
      id: `grp_${Date.now()}`,
      name: t("new_group"),
      fields: [],
    };
    updateAndSaveGroups([...groups, newGroup]);
  };

  const handleDeleteGroup = (idx: number) => {
    showConfirm({
      title: t("delete_group_title"),
      message: t("delete_group_confirm"),
      variant: "danger",
      onConfirm: () => {
        const updated = groups.filter((_, i) => i !== idx);
        if (activeGroupIdx === idx) setActiveGroupIdx(null);
        updateAndSaveGroups(updated);
      },
    });
  };

  const handleDeleteAll = () => {
    showConfirm({
      title: t("delete_all_title"),
      message: t("delete_all_confirm"),
      variant: "danger",
      onConfirm: () => {
        setActiveGroupIdx(null);
        updateAndSaveGroups([]);
      },
    });
  };

  const handleUpdateGroupName = (idx: number, name: string) => {
    const updated = [...groups];
    if (updated[idx]) {
      updated[idx].name = name;
      setGroups(updated);
    }
  };

  const handleImportJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);

        // دعم كافة أشكال الـ JSON الممكنة (مجموعة واحدة مباشرة، أو كائن يحتوي على group/groups، أو مصفوفة)
        let imported: Group[] = [];

        if (Array.isArray(parsed)) {
          imported = parsed;
        } else if (parsed.groups && Array.isArray(parsed.groups)) {
          imported = parsed.groups;
        } else if (parsed.group) {
          imported = [parsed.group];
        } else if (parsed.fields && parsed.name) {
          // إذا كان الملف يحتوي على بيانات مجموعة واحدة مباشرة مثل ملفك الحالي
          imported = [parsed];
        }

        if (imported.length === 0) {
          showAlert(t("import_failed"), "danger", t("error"));
          return;
        }

        updateAndSaveGroups([...groups, ...imported]);
        showAlert(t("import_success"), "success", t("success"));
      } catch {
        showAlert(t("import_failed"), "danger", t("error"));
      } finally {
        // تفريغ قيمة المدخل لتتمكن من استيراد نفس الملف مرة أخرى دون مشاكل
        e.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  return {
    groups,
    setGroups,
    activeGroupIdx,
    setActiveGroupIdx,
    updateAndSaveGroups,
    handleAddGroup,
    handleDeleteGroup,
    handleDeleteAll,
    handleUpdateGroupName,
    handleImportJSON,
  };
}
