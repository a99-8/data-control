import { browser } from "wxt/browser";
import i18n from "@/src/i18n";
import { querySelectorDeep } from "query-selector-shadow-dom"; // استيراد المكتبة

/**
 * دالة مساعدة لتوليد CSS Selector دقيق ودعام للـ Shadow DOM
 */
const generateCssSelector = (el: HTMLElement): string => {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return "";

  // 1. إذا كان لديه ID فريد
  if (el.id) {
    const idSelector = `#${CSS.escape(el.id)}`;
    // التأكد من أن الـ ID يحدد عنصراً فريداً
    if (document.querySelectorAll(idSelector).length === 1) {
      return idSelector;
    }
  }

  // 2. استخدام الميزات الشهيرة لأدوات الإدخال والسيطرة
  const formControlName = el.getAttribute("formcontrolname");
  if (formControlName) {
    return `[formcontrolname="${CSS.escape(formControlName)}"]`;
  }

  const nameAttr = el.getAttribute("name");
  if (nameAttr) {
    return `[name="${CSS.escape(nameAttr)}"]`;
  }

  // 3. بناء المسار الشجري والهيكلي
  const path: string[] = [];
  let current: HTMLElement | null = el;

  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.nodeName.toLowerCase();

    if (current.id) {
      selector += `#${CSS.escape(current.id)}`;
      path.unshift(selector);
      break; // المعرف كافٍ لإيقاف صعود الشجرة
    } else {
      // حساب الترتيب بين الإخوة (Siblings)
      let sibling = current.previousElementSibling;
      let index = 1;
      while (sibling) {
        if (sibling.nodeName.toLowerCase() === selector) {
          index++;
        }
        sibling = sibling.previousElementSibling;
      }
      if (index > 1) {
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);

    // التعامل مع الانتقال عبر الـ Shadow Root إذا كان العنصر داخل Shadow DOM
    const parent = current.parentNode;
    if (parent instanceof ShadowRoot) {
      current = parent.host as HTMLElement; // الصعود إلى العنصر المضيف للـ Shadow
    } else {
      current = parent as HTMLElement | null;
    }
  }

  return path.join(" > ");
};

export function useElementInspector() {
  let isInspecting = false;
  const STYLE_ID = "wxt-disabled-inspector-fix";
  let modifiedDisabledElements: HTMLElement[] = [];

  const injectDisabledFixStyle = () => {
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.innerHTML = `
        [disabled], :disabled, .form-control-disabled2 {
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(style);
    }

    modifiedDisabledElements = Array.from(
      document.querySelectorAll("[disabled]"),
    ) as HTMLElement[];

    modifiedDisabledElements.forEach((el) => {
      el.removeAttribute("disabled");
      el.setAttribute("data-wxt-was-disabled", "true");
    });
  };

  const removeDisabledFixStyle = () => {
    const style = document.getElementById(STYLE_ID);
    if (style) {
      style.remove();
    }

    const elementsToRestore = document.querySelectorAll(
      "[data-wxt-was-disabled]",
    );
    elementsToRestore.forEach((el) => {
      el.setAttribute("disabled", "");
      el.removeAttribute("data-wxt-was-disabled");
    });
    modifiedDisabledElements = [];
  };

  // useElementInspector.ts [تعديل دالة getElementProperties]

  const getElementProperties = (target: HTMLElement) => {
    const elementId = target.id || null;

    const formControlName =
      target.getAttribute("formcontrolname") ||
      target.getAttribute("ng-reflect-name") ||
      target.getAttribute("name") ||
      null;

    let elementPlaceholder: string | null = null;

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    ) {
      elementPlaceholder = target.placeholder || null;
    } else if (target instanceof HTMLSelectElement) {
      const firstOption = target.options[0];
      if (
        firstOption &&
        (firstOption.hasAttribute("disabled") ||
          firstOption.value === "" ||
          firstOption.value === "-1")
      ) {
        elementPlaceholder = firstOption.text.trim();
      } else {
        elementPlaceholder = target.getAttribute("placeholder") || null;
      }
    } else {
      elementPlaceholder = target.getAttribute("placeholder") || null;
    }

    // --- استخراج الـ Label المرتبط بالعنصر ---
    let elementLabel: string | null = null;

    // 1. البحث عبر عنصر label يحتوي على خاصية for
    if (elementId) {
      const labelEl = document.querySelector<HTMLLabelElement>(
        `label[for="${CSS.escape(elementId)}"]`,
      );
      if (labelEl) elementLabel = labelEl.textContent?.trim() || null;
    }

    // 2. البحث عن label أقرب في الشجرة (Parent Label)
    if (!elementLabel) {
      const parentLabel = target.closest("label");
      if (parentLabel) {
        // جلب النص الخاص بالـ label مع استبعاد نص حقل الإدخال نفسه
        const clone = parentLabel.cloneNode(true) as HTMLElement;
        clone
          .querySelectorAll("input, select, textarea")
          .forEach((child) => child.remove());
        elementLabel = clone.textContent?.trim() || null;
      }
    }

    // 3. البحث عبر aria-labelledby
    if (!elementLabel) {
      const ariaLabelledBy = target.getAttribute("aria-labelledby");
      if (ariaLabelledBy) {
        const labelledEl = document.getElementById(ariaLabelledBy);
        if (labelledEl) elementLabel = labelledEl.textContent?.trim() || null;
      }
    }

    // 4. البحث عبر aria-label المباشر
    if (!elementLabel) {
      elementLabel = target.getAttribute("aria-label") || null;
    }

    const cssSelector = generateCssSelector(target);
    const noneText = i18n.t("none");

    return {
      elementId: elementId || noneText,
      formControlName: formControlName || noneText,
      elementPlaceholder: elementPlaceholder || noneText,
      elementLabel: elementLabel || noneText, // <-- تمت إضافة خاصية Label هنا
      cssSelector: cssSelector || noneText,
    };
  };

  const handleElementInspect = (e: MouseEvent | PointerEvent) => {
    if (!isInspecting) return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;

    if (target) {
      const inputElement =
        (target.closest(
          "input, select, textarea, [formcontrolname]",
        ) as HTMLElement) || target;

      const payload = getElementProperties(inputElement);

      try {
        browser.runtime
          .sendMessage({
            action: "ELEMENT_INSPECTED",
            payload,
          })
          .catch(() => {
            // تجاهل خطأ عدم وجود مستمع
          });
      } catch (err) {
        // Catch synchronous exceptions
      }
    }

    stopInspecting();
  };

  const startInspecting = () => {
    isInspecting = true;
    injectDisabledFixStyle();
    document.body.style.cursor = "crosshair";
    document.addEventListener("pointerdown", handleElementInspect, true);
    document.addEventListener("click", handleElementInspect, true);
  };

  const stopInspecting = () => {
    isInspecting = false;
    removeDisabledFixStyle();
    document.body.style.cursor = "default";

    document.removeEventListener("pointerdown", handleElementInspect, true);
    document.removeEventListener("click", handleElementInspect, true);
  };

  return {
    startInspecting,
    stopInspecting,
  };
}
