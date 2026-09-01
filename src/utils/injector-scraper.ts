import type { Field, Group } from "@/src/other/types";
import { evaluateFormulaCondition } from "./hyperformula-evaluator";

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

// دالة مساعدة لتحديد عناصر الإدخال
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
    cssSelector: () => {
      try {
        return Array.from(document.querySelectorAll<HTMLElement>(val));
      } catch (e) {
        return [];
      }
    },
  };

  return selectors[field.searchType]?.() || [];
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

// دالة مساعدة لحقن حقل واحد
function injectSingleField(field: Field): boolean {
  const targetNodes = findInputElement(field);
  if (targetNodes.length === 0) return false;

  const valueToInject =
    field.inputValue !== undefined ? String(field.inputValue).trim() : "";

  targetNodes.forEach((node) => {
    // 1. التعامل مع قوائم Multi-Select الخاصة
    const rootContainer = node.closest(".multi-select-react-and-mob-root");
    if (rootContainer) {
      const targetValues = valueToInject
        .split(",")
        .map((v) => v.trim().toLowerCase());

      const listItems = rootContainer.querySelectorAll<HTMLElement>(
        ".multi-select-react-and-mob-dropdown-menu-item",
      );

      listItems.forEach((item) => {
        const checkbox = item.querySelector<HTMLInputElement>(
          "input[type='checkbox']",
        );
        const label = item.textContent?.trim().toLowerCase() || "";
        if (checkbox && label) {
          const shouldBeChecked = targetValues.includes(label);
          if (checkbox.checked !== shouldBeChecked) {
            checkbox.click();
          }
        }
      });

      const promptBar = rootContainer.querySelector<HTMLElement>(
        ".multi-select-react-and-mob-dropdown-bar-prompt",
      );
      if (promptBar) {
        promptBar.textContent = valueToInject;
      }
      return;
    }

    // 2. التعامل مع Checkbox / Radio
    if (
      node instanceof HTMLInputElement &&
      (node.type === "checkbox" || node.type === "radio")
    ) {
      const isTrue = ["true", "1", "yes", "نعم", "on"].includes(
        valueToInject.toLowerCase(),
      );

      if (node.type === "checkbox") {
        if (node.checked !== isTrue) node.click();
      } else if (node.type === "radio") {
        if (
          node.value.trim().toLowerCase() === valueToInject.toLowerCase() ||
          isTrue
        ) {
          if (!node.checked) node.click();
        }
      }
      return;
    }

    // 3. التعامل مع القوائم المنسدلة HTML Select
    if (node instanceof HTMLSelectElement) {
      const targetValues = valueToInject
        .split(",")
        .map((v) => v.trim().toLowerCase());

      if (node.multiple) {
        Array.from(node.options).forEach((opt) => {
          const optVal = opt.value.trim().toLowerCase();
          const optText = opt.text.trim().toLowerCase();
          opt.selected =
            targetValues.includes(optVal) || targetValues.includes(optText);
        });
      } else {
        const matchedOption = Array.from(node.options).find(
          (opt) =>
            opt.value.trim().toLowerCase() === valueToInject.toLowerCase() ||
            opt.text.trim().toLowerCase() === valueToInject.toLowerCase(),
        );
        if (matchedOption) {
          node.value = matchedOption.value;
        }
      }

      node.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }

    // 4. التعامل مع حقول الإدخال النصية Input و Textarea
    if (
      node instanceof HTMLInputElement ||
      node instanceof HTMLTextAreaElement
    ) {
      node.focus();

      let finalValue = valueToInject;
      if (
        node instanceof HTMLInputElement &&
        (node.type === "number" ||
          /^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(valueToInject))
      ) {
        const sanitized = valueToInject.replace(/,/g, "");
        if (!isNaN(Number(sanitized))) {
          finalValue = sanitized;
        }
      }

      const prototype =
        node instanceof HTMLTextAreaElement
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;

      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        prototype,
        "value",
      )?.set;

      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(node, finalValue);
      } else {
        node.value = finalValue;
      }

      node.dispatchEvent(new Event("input", { bubbles: true }));
      node.dispatchEvent(new Event("change", { bubbles: true }));
      node.dispatchEvent(new Event("blur", { bubbles: true }));
      return;
    }

    // 5. العناصر القابلة للتعديل ContentEditable
    if (node.isContentEditable) {
      node.focus();
      node.innerText = valueToInject;
      node.dispatchEvent(new Event("input", { bubbles: true }));
      node.dispatchEvent(new Event("change", { bubbles: true }));
      node.dispatchEvent(new Event("blur", { bubbles: true }));
      return;
    }

    // 6. الحالات الافتراضية
    if ("value" in node) {
      (node as any).value = valueToInject;
    } else {
      node.textContent = valueToInject;
    }

    node.dispatchEvent(new Event("input", { bubbles: true }));
    node.dispatchEvent(new Event("change", { bubbles: true }));
  });

  return true;
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
  fieldsToInject.forEach((field) => {
    if (injectSingleField(field)) {
      count++;
    }
  });

  return count;
}
