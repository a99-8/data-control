import type { Field } from "@/src/other/types";
import { waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { findInputElement } from "@/src/utils";

const user = userEvent.setup();

// injectSingleField.ts

export type FieldType = "text" | "select" | "date" | "checkbox" | "radio";

export interface FieldToInject {
  label: string;
  value: string;
  type?: FieldType;
  selector?: string;
  sectionId?: string;
}

/**
 * تحديث قيمة عنصر الإدخال برمجياً مع تحفيز الأحداث الخاصة بـ Angular / React
 */
function setNativeValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, "value")?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(
    prototype,
    "value",
  )?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }
}

/**
 * حقن حقول النصوص والأرقام القياسية (input / textarea)
 */
export async function injectTextInput(
  node: HTMLInputElement | HTMLTextAreaElement | HTMLElement,
  valueToInject: string,
): Promise<boolean> {
  let finalValue = valueToInject;

  // تنظيف الأرقام الفاصلة إذا كان الحقل من نوع أرقام
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

  if (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement) {
    // 1. تركيز العنصر
    node.focus();

    // 2. ضبط القيمة عبر الـ Prototype Setter لضمان وصولها لـ Angular Forms
    setNativeValue(node, finalValue);

    // 3. تحفيز الأحداث اللازمة لتحديث النموذج
    node.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    node.dispatchEvent(
      new Event("change", { bubbles: true, cancelable: true }),
    );
    node.dispatchEvent(new Event("blur", { bubbles: true, cancelable: true }));

    return true;
  }

  return false;
}

/**
 * حقن حقول الاختيار المنسدلة القياسية (<select>)
 */
export async function injectSelectInput(
  selectEl: HTMLSelectElement,
  valueToInject: string,
): Promise<boolean> {
  selectEl.focus();

  const options = Array.from(selectEl.options);
  const matchedOption = options.find(
    (opt) =>
      opt.value === valueToInject ||
      opt.text
        .trim()
        .toLowerCase()
        .includes(valueToInject.trim().toLowerCase()),
  );

  if (matchedOption) {
    selectEl.value = matchedOption.value;
    selectEl.dispatchEvent(new Event("change", { bubbles: true }));
    selectEl.dispatchEvent(new Event("blur", { bubbles: true }));
    return true;
  }

  return false;
}

/**
 * حقن حقول الاختيار الخاصة بـ Angular Material (mat-select)
 */
export async function injectMatSelect(
  selectEl: HTMLElement,
  optionText: string,
): Promise<boolean> {
  // التحقق مما إذا كان الحقل معطلاً لتجنب الأخطاء
  if (
    selectEl.getAttribute("aria-disabled") === "true" ||
    selectEl.classList.contains("mat-mdc-select-disabled") ||
    selectEl.classList.contains("mat-select-disabled")
  ) {
    console.warn("حقل الاختيار معطل (Disabled)، تم تخطي الحقن.");
    return false;
  }

  // 1. فتح القائمة المنسدلة باستخدام MouseEvent لتجاوز pointer-events: none
  selectEl.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
  );
  selectEl.dispatchEvent(
    new MouseEvent("mouseup", { bubbles: true, cancelable: true }),
  );
  selectEl.click();

  // 2. الانتظار القليل حتى يتم إنشاء الـ Overlay الخارجي لـ Material
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 3. البحث عن الخيارات المتوفرة في الـ Overlay
  const options = Array.from(
    document.querySelectorAll<HTMLElement>(
      "mat-option, .mat-mdc-option, .mat-option",
    ),
  );

  const cleanOptionText = optionText.trim().toLowerCase();
  const targetOption = options.find((opt) =>
    opt.textContent?.trim().toLowerCase().includes(cleanOptionText),
  );

  if (targetOption) {
    targetOption.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
    );
    targetOption.click();
    return true;
  } else {
    // غلق القائمة في حال عدم العثور على الخيار (بالنقر خارج القائمة)
    document.body.click();
    console.warn(
      `لم يتم العثور على الخيار "${optionText}" في القائمة المنسدلة.`,
    );
  }

  return false;
}

/**
 * الدالة الرئيسية للتحكم في نوع الحقن حسب نوع العنصر
 */
export async function injectSingleField(
  targetElement: HTMLElement,
  field: FieldToInject,
): Promise<boolean> {
  if (!targetElement || !field.value) return false;

  const tagName = targetElement.tagName.toLowerCase();

  // 1. معالجة حقول mat-select في Angular Material
  if (
    tagName === "mat-select" ||
    targetElement.classList.contains("mat-mdc-select") ||
    targetElement.classList.contains("mat-select")
  ) {
    return await injectMatSelect(targetElement, field.value);
  }

  // 2. معالجة عناصر Select القياسية
  if (targetElement instanceof HTMLSelectElement) {
    return await injectSelectInput(targetElement, field.value);
  }

  // 3. معالجة عناصر Input / Textarea
  if (
    targetElement instanceof HTMLInputElement ||
    targetElement instanceof HTMLTextAreaElement
  ) {
    return await injectTextInput(targetElement, field.value);
  }

  // 4. في حال كانت الحاوية تحتوي على input في الداخل
  const innerInput = targetElement.querySelector<
    HTMLInputElement | HTMLTextAreaElement
  >("input, textarea");
  if (innerInput) {
    return await injectTextInput(innerInput, field.value);
  }

  return false;
}

/**
 * 3. دالة معالجة محددات التواريخ (Datepickers)
 * مثال على العناصر: <input matInput class="mat-datepicker-input">
 */
export async function injectDatePicker(
  node: HTMLInputElement,
  valueToInject: string,
): Promise<boolean> {
  await user.clear(node);
  if (valueToInject) {
    await user.type(node, valueToInject);
  }
  return true;
}

/**
 * 4. دالة معالجة أزرار الاختيار المادي ومربعات التأشير (Checkboxes & Radio Buttons)
 * مثال على العناصر: <input type="checkbox">, <input type="radio">
 */
export async function injectBooleanInput(
  node: HTMLInputElement,
  valueToInject: string,
): Promise<boolean> {
  const isTrue = ["true", "1", "yes", "نعم", "on"].includes(
    valueToInject.toLowerCase(),
  );

  if (node.type === "checkbox" && node.checked !== isTrue) {
    await user.click(node);
    return true;
  }

  if (node.type === "radio") {
    const matchesValue =
      node.value.trim().toLowerCase() === valueToInject.toLowerCase();
    if ((matchesValue || isTrue) && !node.checked) {
      await user.click(node);
      return true;
    }
  }

  return false;
}

/**
 * 5. دالة معالجة القوائم المنسدلة القياسية (Native HTML Select)
 * مثال: <select><option value="1">...</option></select>
 */
export async function injectNativeSelect(
  node: HTMLSelectElement,
  valueToInject: string,
): Promise<boolean> {
  const targetValues = valueToInject
    .split(",")
    .map((v) => v.trim().toLowerCase());

  const optionsToSelect = Array.from(node.options)
    .filter(
      (opt) =>
        targetValues.includes(opt.value.trim().toLowerCase()) ||
        targetValues.includes(opt.text.trim().toLowerCase()),
    )
    .map((opt) => opt.value);

  if (optionsToSelect.length > 0) {
    await user.selectOptions(node, optionsToSelect);
    return true;
  }

  return false;
}
