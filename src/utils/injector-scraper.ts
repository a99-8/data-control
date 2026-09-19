import type { Field, Group } from "@/src/other/types";
import { evaluateFormulaCondition } from "./hyperformula-evaluator";
import { findInputElement, injectSingleField } from "@/src/utils";

// دالة مساعدة لاستخراج النص/القيمة من عنصر فردي
export function getNodeValue(targetNode: HTMLElement): string {
  if (targetNode instanceof HTMLSelectElement) {
    const currentValue = targetNode.value ? targetNode.value.trim() : "";
    let selectedOpt = Array.from(targetNode.options).find(
      (opt) => opt.value.trim() === currentValue,
    );
    if (!selectedOpt) {
      selectedOpt = Array.from(targetNode.options).find((opt) =>
        opt.hasAttribute("selected"),
      );
    }
    if (!selectedOpt) {
      selectedOpt = Array.from(targetNode.options).find(
        (opt) => opt.selected && opt.value.trim() !== "",
      );
    }
    if (!selectedOpt && targetNode.selectedIndex >= 0) {
      selectedOpt = targetNode.options[targetNode.selectedIndex];
    }

    const optText = selectedOpt?.text ? selectedOpt.text.trim() : "";
    const optValue = selectedOpt?.value ? selectedOpt.value.trim() : "";

    const isDefaultOptionText =
      optText.includes("الرجاء اختيار") ||
      optText.toLowerCase().includes("please select") ||
      optText.toLowerCase().includes("select option");

    if (
      !selectedOpt ||
      selectedOpt.disabled ||
      optValue === "" ||
      optValue === "-1" ||
      isDefaultOptionText
    ) {
      return "";
    }
    return optText;
  }

  if (
    targetNode instanceof HTMLInputElement &&
    targetNode.type === "checkbox"
  ) {
    return targetNode.checked ? "true" : "false";
  }

  if (
    targetNode instanceof HTMLInputElement ||
    targetNode instanceof HTMLTextAreaElement
  ) {
    return targetNode.value || "";
  }

  return targetNode.textContent || "";
}

export function extractGroupData(group: Group): Record<string, any>[] {
  const rows: Record<string, any>[] = [];
  const rowObj: Record<string, any> = {};
  const valuesByFieldId: Record<string, any> = {};

  // 1. استخراج البيانات كما هي
  group.fields.forEach((field) => {
    let val = "";
    const mode = field.verificationMode || "extract_compare";

    if (mode !== "compare_only" && field.searchType !== "defaultValue") {
      const nodes = findInputElement(field);
      if (nodes.length === 1 && nodes[0]) {
        val = getNodeValue(nodes[0]);
      } else if (nodes.length > 1) {
        const extractedValues = nodes
          .filter((node): node is HTMLElement => Boolean(node))
          .map((node) => getNodeValue(node).trim())
          .filter((v) => v !== "");

        const areAllNumbers =
          extractedValues.length > 0 &&
          extractedValues.every((v) => !isNaN(Number(v)));

        val = areAllNumbers
          ? String(extractedValues.reduce((acc, curr) => acc + Number(curr), 0))
          : extractedValues.join(", ");
      }
    } else {
      val = field.searchValue || "";
    }

    val = val ? val.trim() : "";
    rowObj[field.fieldName] = val;
    if (field.id) valuesByFieldId[field.id] = val;
  });

  // 2. تطبيق صيغ HyperFormula للتحقق والمقارنة
  group.fields.forEach((field) => {
    const mode = field.verificationMode || "extract_compare";

    if (mode !== "none" && field.conditions) {
      rowObj[field.fieldName] = evaluateFormulaCondition(
        field,
        rowObj,
        valuesByFieldId,
        group.fields,
      );
    }
  });

  rows.push(rowObj);
  return rows.filter((row) =>
    Object.values(row).some((v) => v !== "" && v !== null && v !== undefined),
  );
}

export function injectGroupData(group: Group, sectionId?: string): number {
  if (group.isInjectionGroup === false) return 0;

  let fieldsToInject: Field[] = [];

  // 1. إذا تم تحديد قسم معين صراحة
  if (sectionId && sectionId.trim() !== "" && sectionId !== "__ALL__") {
    fieldsToInject = group.fields.filter(
      (field) => field.enabled !== false && field.sectionId === sectionId,
    );
  }
  // 2. إذا تم اختيار حقن كافة الأقسام صراحة
  else if (sectionId === "__ALL__") {
    fieldsToInject = group.fields.filter((field) => field.enabled !== false);
  }
  // 3. إذا لم يتم تمرير قسم وكانت هناك أقسام متوفرة (يتم حقن حقول القسم الأول افتراضياً لتجنب دهس البيانات)
  else if (group.sections && group.sections.length > 0) {
    const firstSectionId = group.sections[0]?.id;
    if (firstSectionId) {
      fieldsToInject = group.fields.filter(
        (field) =>
          field.enabled !== false && field.sectionId === firstSectionId,
      );
    } else {
      fieldsToInject = group.fields.filter((field) => field.enabled !== false);
    }
  }
  // 4. إذا لم توجد أقسام في المجموعة مطلقاً
  else {
    fieldsToInject = group.fields.filter((field) => field.enabled !== false);
  }

  let count = 0;
  fieldsToInject.forEach(async (field) => {
    if (await injectSingleField(field)) {
      count++;
    }
  });

  return count;
}
