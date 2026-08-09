import { browser } from "wxt/browser";
import i18n from "@/src/i18n"; // تأكد من مسار استدعاء i18n لديك

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

    const noneText = i18n.t("none");

    return {
      elementId: elementId || noneText,
      formControlName: formControlName || noneText,
      elementPlaceholder: elementPlaceholder || noneText,
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

      browser.runtime.sendMessage({
        action: "ELEMENT_INSPECTED",
        payload,
      });
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
