import {
  extractGroupData,
  injectGroupData,
} from "@/src/utils/injector-scraper";
import { downloadCSV } from "@/src/utils/";
import type { ActionRequest, ActionResponse, Group } from "@/src/other/types";
import { omit } from "lodash-es";
import i18n from "@/src/i18n"; // استدعاء ملف تهيئة i18next الرئيسي

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Local Helper Function ---
function getFilteredRows(group?: Group) {
  if (!group) return null;

  const extractedRows = extractGroupData(group);
  if (!extractedRows || extractedRows.length === 0) return null;

  const disabledFields = group.fields
    .filter((f) => f.enabled === false)
    .map((f) => f.fieldName);

  const filteredRows = extractedRows.map((row) => omit(row, disabledFields));
  const columnsCount = Object.keys(filteredRows[0] || {}).length;

  return { filteredRows, count: filteredRows.length, columnsCount };
}

// --- Handlers ---
export function handleScrapeData(request: ActionRequest): ActionResponse {
  const result = getFilteredRows(request.group);
  if (!result) {
    return {
      status: "error",
      message: i18n.t("no_data_found_to_extract"),
      data: [],
      count: 0,
      columnsCount: 0,
    };
  }

  const fileName = `${request.group?.name || "extracted_data"}.csv`;
  downloadCSV(result.filteredRows, fileName);

  return {
    status: "success",
    data: result.filteredRows,
    count: result.count,
    columnsCount: result.columnsCount,
  };
}

export async function handleCopyData(
  request: ActionRequest,
): Promise<ActionResponse> {
  const result = getFilteredRows(request.group);

  if (!result) {
    return {
      status: "error",
      message: i18n.t("no_data_found_empty_or_default"),
      data: [],
      count: 0,
      columnsCount: 0,
    };
  }

  const textToCopy = result.filteredRows
    .map((row) => Object.values(row).join("\t"))
    .join("\n");

  try {
    // 1. المحاولة باستخدام Clipboard API الحديثة
    await navigator.clipboard.writeText(textToCopy);

    return {
      status: "success",
      data: result.filteredRows,
      count: result.count,
      columnsCount: result.columnsCount,
    };
  } catch (err) {
    // 2. المحاولة باستخدام الحل البديل في حال فشل الأول
    const success = copyUsingExecCommand(textToCopy);

    if (success) {
      return {
        status: "success",
        data: result.filteredRows,
        count: result.count,
        columnsCount: result.columnsCount,
      };
    }

    return {
      status: "error",
      message: i18n.t("clipboard_copy_failed"),
      data: [],
      count: 0,
      columnsCount: 0,
    };
  }
}

// دالة مساعدة للنسخ المباشر عبر DOM
function copyUsingExecCommand(text: string): boolean {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    // تجنب تحريك الصفحة أثناء إضافة العنصر
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);
    return successful;
  } catch (e) {
    return false;
  }
}

export function handleInjectData(request: ActionRequest): ActionResponse {
  if (!request.group) {
    return { status: "error", message: i18n.t("group_not_specified") };
  }

  const injectedCount = injectGroupData(request.group);
  return { status: "success", count: injectedCount };
}

export async function handleTransferData(
  request: ActionRequest,
): Promise<ActionResponse & { updatedTargetGroup?: Group }> {
  if (!request.sourceGroup || !request.targetGroup) {
    return {
      status: "error",
      message: i18n.t("groups_data_incomplete"),
    };
  }

  const extractedRows = extractGroupData(request.sourceGroup);
  if (!extractedRows || extractedRows.length === 0) {
    return {
      status: "error",
      message: i18n.t("no_data_found_in_source_group"),
    };
  }

  await sleep(300);

  const rowData = extractedRows[0];

  const updatedTargetGroup: Group = {
    ...request.targetGroup,
    fields: request.targetGroup.fields.map((targetField) => {
      const matchedVal = rowData?.[targetField.fieldName];
      return {
        ...targetField,
        inputValue:
          matchedVal !== undefined && matchedVal !== null
            ? String(matchedVal)
            : targetField.inputValue,
      };
    }),
  };

  const injectedCount = injectGroupData(updatedTargetGroup);
  const extractedCount = rowData
    ? Math.max(0, Object.keys(rowData).length - 1)
    : 0;

  return {
    status: "success",
    extractedCount,
    count: injectedCount,
    updatedTargetGroup,
  };
}
