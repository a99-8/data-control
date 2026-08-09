import type { Field, Group } from "@/src/types";
import i18n from "@/src/i18n";

function findInputElement(field: Field): HTMLElement[] {
  const val = (field.searchValue || "").trim();
  if (!val) return [];

  const selectors: Record<string, () => HTMLElement[]> = {
    elementId: () => {
      const cleanId = val.startsWith("#") ? val.substring(1) : val;
      const el = document.getElementById(cleanId);
      return el ? [el] : [];
    },
    regexId: () => {
      try {
        const pattern =
          val.includes("*") && !val.includes(".*")
            ? val.replace(/\*/g, ".*")
            : val;
        const regex = new RegExp(`^${pattern}$`);
        return Array.from(
          document.querySelectorAll<HTMLElement>("[id]"),
        ).filter((el) => regex.test(el.id));
      } catch {
        return [];
      }
    },
    formControlName: () =>
      Array.from(
        document.querySelectorAll(`[formcontrolname="${CSS.escape(val)}"]`),
      ),
    elementPlaceholder: () =>
      Array.from(
        document.querySelectorAll(
          `input[placeholder="${CSS.escape(val)}"], textarea[placeholder="${CSS.escape(val)}"]`,
        ),
      ),
  };

  return selectors[field.searchType]?.() || [];
}

function evaluateConditions(
  currentField: Field,
  currentRowObj: Record<string, any>,
  valuesByFieldId: Record<string, any>,
  allFields: Field[],
): string {
  let conditionsMap = currentField.conditions;
  if (!conditionsMap) return currentRowObj[currentField.fieldName] || "";

  if (typeof conditionsMap === "string") {
    try {
      conditionsMap = JSON.parse(conditionsMap);
    } catch {
      return currentRowObj[currentField.fieldName] || "";
    }
  }

  if (typeof conditionsMap !== "object" || conditionsMap === null) {
    return currentRowObj[currentField.fieldName] || "";
  }

  const map = conditionsMap as Record<string, Record<string, string>>;

  for (const targetKey in map) {
    if (!Object.prototype.hasOwnProperty.call(map, targetKey)) continue;

    const valueMapping = map[targetKey];
    let actualVal: any = null;

    if (Object.prototype.hasOwnProperty.call(valuesByFieldId, targetKey)) {
      actualVal = valuesByFieldId[targetKey];
    } else if (Object.prototype.hasOwnProperty.call(currentRowObj, targetKey)) {
      actualVal = currentRowObj[targetKey];
    } else {
      const matchedField = allFields.find(
        (f) => f.id === targetKey || f.fieldName === targetKey,
      );
      if (matchedField) actualVal = currentRowObj[matchedField.fieldName];
    }

    if (actualVal !== null && actualVal !== undefined) {
      const cleanActualVal = String(actualVal).trim().toLowerCase();
      for (const expectedKey in valueMapping) {
        if (cleanActualVal === String(expectedKey).trim().toLowerCase()) {
          return String(valueMapping[expectedKey]);
        }
      }
    }
  }

  return currentRowObj[currentField.fieldName] || "";
}

export function extractGroupData(group: Group): Record<string, any>[] {
  const rows: Record<string, any>[] = [];
  let maxItemsCount = 1;

  group.fields.forEach((field) => {
    const nodes = findInputElement(field);
    if (nodes.length > maxItemsCount) maxItemsCount = nodes.length;
  });

  for (let rowIndex = 0; rowIndex < maxItemsCount; rowIndex++) {
    const rowObj: Record<string, any> = {};
    const valuesByFieldId: Record<string, any> = {};

    group.fields.forEach((field) => {
      let val = "";
      if (field.searchType === "defaultValue") {
        val = field.searchValue || "";
      } else {
        const nodes = findInputElement(field);
        if (nodes.length) {
          const targetNode = nodes[rowIndex] || nodes[0];
          if (targetNode) {
            if (targetNode instanceof HTMLSelectElement) {
              const selectedOpt =
                Array.from(targetNode.options).find((opt) => opt.selected) ||
                targetNode.options[targetNode.selectedIndex];

              // فحص النصوص الافتراضية باللغتين لمنع استخراج الخيارات غير المحددة
              const optText = selectedOpt?.text ? selectedOpt.text.trim() : "";
              const isDefaultOptionText =
                optText.includes("الرجاء اختيار") ||
                optText.toLowerCase().includes("please select") ||
                optText.toLowerCase().includes("select option");

              if (
                !selectedOpt ||
                selectedOpt.disabled ||
                selectedOpt.value === "-1" ||
                selectedOpt.value.trim() === "" ||
                isDefaultOptionText
              ) {
                val = "";
              } else {
                val = optText || selectedOpt.value;
              }
            } else if (
              targetNode instanceof HTMLInputElement ||
              targetNode instanceof HTMLTextAreaElement
            ) {
              val = targetNode.value || "";
            } else {
              val = targetNode.textContent || "";
            }
          }
        }
      }

      val = val ? val.trim() : "";
      rowObj[field.fieldName] = val;
      if (field.id) valuesByFieldId[field.id] = val;
    });

    group.fields.forEach((field) => {
      if (field.conditions) {
        rowObj[field.fieldName] = evaluateConditions(
          field,
          rowObj,
          valuesByFieldId,
          group.fields,
        );
      }
    });

    rows.push(rowObj);
  }
  const cleanRows = rows.filter((row) =>
    Object.values(row).some((v) => v !== "" && v !== null && v !== undefined),
  );

  return cleanRows;
}

export function injectGroupData(group: Group): number {
  let count = 0;

  group.fields.forEach((field) => {
    const targetNodes = findInputElement(field);
    const valueToInject =
      field.inputValue !== undefined ? field.inputValue : "";

    targetNodes.forEach((node) => {
      if (node instanceof HTMLSelectElement) {
        node.value = valueToInject;
        node.dispatchEvent(new Event("change", { bubbles: true }));
      } else if (
        node instanceof HTMLInputElement ||
        node instanceof HTMLTextAreaElement
      ) {
        node.value = valueToInject;
        node.dispatchEvent(new Event("input", { bubbles: true }));
        node.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        node.textContent = valueToInject;
      }
      count++;
    });
  });

  return count;
}
