import type { Field, Group } from "@/src/other/types";
import { evaluateFormulaCondition } from "./hyperformula-evaluator";

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
    // --- الإضافة الجديدة لاستخدام CSS Selector المباشر ---
    cssSelector: () => {
      try {
        return Array.from(document.querySelectorAll<HTMLElement>(val));
      } catch (e) {
        console.warn("Invalid CSS Selector:", val);
        return [];
      }
    },
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
  const currentVal = currentRowObj[currentField.fieldName] ?? "";

  if (!conditionsMap) return currentVal;

  if (typeof conditionsMap === "string") {
    try {
      conditionsMap = JSON.parse(conditionsMap);
    } catch {
      return currentVal;
    }
  }

  if (typeof conditionsMap !== "object" || conditionsMap === null) {
    return currentVal;
  }

  const cleanCurrentVal = String(currentVal).trim().toLowerCase();

  // 1. الدعم المباشر للمطابقة البسيطة { "on": "true", "off": "false" }
  for (const [key, val] of Object.entries(conditionsMap)) {
    if (typeof val !== "object") {
      if (cleanCurrentVal === String(key).trim().toLowerCase()) {
        return String(val);
      }
    }
  }

  // 2. الدعم للـ Nested Map على مستوى الحقول الخارجية (الهيكل القديم)
  const map = conditionsMap as Record<string, Record<string, string>>;
  for (const targetKey in map) {
    if (!Object.prototype.hasOwnProperty.call(map, targetKey)) continue;

    const valueMapping = map[targetKey];
    if (typeof valueMapping !== "object" || valueMapping === null) continue;

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

  return currentVal;
}

// دالة مساعدة لاستخراج النص/القيمة من عنصر فردي
function getNodeValue(targetNode: HTMLElement): string {
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
      // تم استبدال evaluateConditions القديمة بـ evaluateFormulaCondition
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

export function injectGroupData(group: Group): number {
  let count = 0;

  group.fields.forEach((field) => {
    const targetNodes = findInputElement(field);
    const valueToInject =
      field.inputValue !== undefined ? String(field.inputValue).trim() : "";

    targetNodes.forEach((node) => {
      // ----------------------------------------------------
      // 0. معالجة مكونات الـ MultiSelect المخصصة (مثل OutSystems / React)
      // ----------------------------------------------------
      const rootContainer = node.closest(".multi-select-react-and-mob-root");
      if (rootContainer) {
        // تفكيك القيم المطلوب تحديدها (في حال كانت مفصولة بفاصلة)
        const targetValues = valueToInject.split(",").map((v) => v.trim());

        // 1. التفتيش على خيارات القائمة
        const listItems = rootContainer.querySelectorAll<HTMLElement>(
          ".multi-select-react-and-mob-dropdown-menu-item",
        );

        listItems.forEach((item) => {
          const checkbox = item.querySelector<HTMLInputElement>(
            "input[type='checkbox']",
          );
          const label = item.textContent?.trim() || "";

          if (checkbox && label) {
            const shouldBeChecked = targetValues.includes(label);
            if (checkbox.checked !== shouldBeChecked) {
              checkbox.checked = shouldBeChecked;
              checkbox.dispatchEvent(new Event("change", { bubbles: true }));
              checkbox.dispatchEvent(new Event("click", { bubbles: true }));
            }
          }
        });

        // 2. تحديث النص المكتوب في شريط العرض (Prompt Bar) بدون تدمير البنية
        const promptBar = rootContainer.querySelector<HTMLElement>(
          ".multi-select-react-and-mob-dropdown-bar-prompt",
        );
        if (promptBar) {
          promptBar.textContent = targetValues.join(", ");
        }

        count++;
        return; // الخروج لأننا عالجنا المكون المخصص بنجاح
      }

      // ----------------------------------------------------
      // 1. التعامل مع Checkbox المباشر
      // ----------------------------------------------------
      if (node instanceof HTMLInputElement && node.type === "checkbox") {
        const isTrue = ["true", "1", "yes", "نعم", "on"].includes(
          valueToInject.toLowerCase(),
        );
        if (node.checked !== isTrue) {
          node.checked = isTrue;
          node.dispatchEvent(new Event("change", { bubbles: true }));
          node.dispatchEvent(new Event("click", { bubbles: true }));
        }
      }
      // ----------------------------------------------------
      // 2. التعامل مع الـ Select المباشر
      // ----------------------------------------------------
      else if (node instanceof HTMLSelectElement) {
        let matchedOption = Array.from(node.options).find(
          (opt) =>
            opt.value === valueToInject || opt.text.trim() === valueToInject,
        );
        if (matchedOption) {
          node.value = matchedOption.value;
          node.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
      // ----------------------------------------------------
      // 3. التعامل مع حقول الإدخال النصية (Input / Textarea)
      // ----------------------------------------------------
      else if (
        node instanceof HTMLInputElement ||
        node instanceof HTMLTextAreaElement
      ) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;

        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(node, valueToInject);
        } else {
          node.value = valueToInject;
        }

        node.dispatchEvent(new Event("input", { bubbles: true }));
        node.dispatchEvent(new Event("change", { bubbles: true }));
      }
      // ----------------------------------------------------
      // 4. العناصر النصية العادية (افتراضي)
      // ----------------------------------------------------
      else {
        node.textContent = valueToInject;
      }
      count++;
    });
  });

  return count;
}
