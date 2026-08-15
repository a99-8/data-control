import { useState, useEffect } from "react";
import { browser } from "wxt/browser";
import { getGroups, saveGroups } from "@/src/utils";
import type { Group, ActionType, ActionResponse } from "@/src/other/types";
import { useModal } from "@/src/components/ModalContext";
import { useTranslation } from "react-i18next";

export function usePopupAction() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<string>("");
  const [targetIdx, setTargetIdx] = useState<string>("");
  const { showAlert } = useModal();

  useEffect(() => {
    document.body.classList.add("popup-body");
    getGroups().then(setGroups);
  }, []);

  const handleExecute = async (action: ActionType | "SCAN_AND_OPEN_PANEL") => {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    if (action === "SCAN_AND_OPEN_PANEL") {
      try {
        await browser.sidePanel.open({ tabId: tab.id });
        window.close();
      } catch (err) {
        showAlert(t("side_panel_open_error"), "danger", t("error"));
      }
      return;
    }

    if (selectedIdx === "") {
      showAlert(t("select_source_group_alert"), "warning", t("warning"));
      return;
    }

    const sourceGroup = groups[Number(selectedIdx)];

    if (action === "TRANSFER_DATA") {
      if (targetIdx === "") {
        showAlert(t("select_target_group_alert"), "warning", t("warning"));
        return;
      }
      if (selectedIdx === targetIdx) {
        showAlert(t("select_different_groups_alert"), "warning", t("warning"));
        return;
      }

      const targetGroup = groups[Number(targetIdx)];

      try {
        const response = (await browser.tabs.sendMessage(tab.id, {
          action: "TRANSFER_DATA",
          sourceGroup,
          targetGroup,
        })) as ActionResponse & { updatedTargetGroup?: Group };

        if (response?.status === "success") {
          if (response.updatedTargetGroup) {
            const updatedGroups = [...groups];
            updatedGroups[Number(targetIdx)] = response.updatedTargetGroup;
            setGroups(updatedGroups);
            await saveGroups(updatedGroups);
          }

          showAlert(
            t("transfer_data_success", {
              extractedCount: response.extractedCount ?? 0,
              count: response.count ?? 0,
            }),
            "success",
            t("success"),
          );
        } else {
          showAlert(
            response?.message || t("transfer_data_error"),
            "danger",
            t("error"),
          );
        }
      } catch {
        showAlert(t("page_connection_error"), "danger", t("error"));
      }
      return;
    }

    if (action === "COPY_DATA") {
      try {
        const response = (await browser.tabs.sendMessage(tab.id, {
          action: "COPY_DATA",
          group: sourceGroup,
        })) as ActionResponse;

        if (response?.status === "success") {
          showAlert(
            t("copy_data_success", {
              count: response.count || 0,
              columnsCount: response.columnsCount || 0,
            }),
            "success",
            t("success"),
          );
        } else {
          showAlert(
            response?.message || t("copy_data_error"),
            "danger",
            t("error"),
          );
        }
      } catch {
        showAlert(t("page_connection_error"), "danger", t("error"));
      }
      return;
    }

    try {
      const response = (await browser.tabs.sendMessage(tab.id, {
        action,
        group: sourceGroup,
      })) as ActionResponse;

      if (response?.status === "success") {
        if (action === "INJECT_DATA") {
          showAlert(
            t("inject_data_success", { count: response.count }),
            "success",
            t("success"),
          );
        } else {
          showAlert(
            t("extract_data_success", {
              count: response.count || 0,
              columnsCount: response.columnsCount || 0,
            }),
            "success",
            t("success"),
          );
        }
      }
    } catch {
      showAlert(t("page_connection_error"), "danger", t("error"));
    }
  };

  return {
    groups,
    selectedIdx,
    setSelectedIdx,
    targetIdx,
    setTargetIdx,
    handleExecute,
  };
}
