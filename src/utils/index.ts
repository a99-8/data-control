import { storage } from "wxt/utils/storage";
import type { Field, Group } from "@/src/other/types";
export * from "@/src/utils/handlerpopupAction";
export * from "@/src/utils/hyperformula-evaluator";
export * from "@/src/utils/injector-scraper";
export * from "@/src/utils/injectSingleField";

export function downloadCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0 || !data[0]) return;

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  csvRows.push(
    headers.map((header) => `"${header.replace(/"/g, '""')}"`).join(","),
  );

  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header] ?? "";
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvContent = "\uFEFF" + csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename.endsWith(".csv") ? filename : `${filename}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function reorderArray<T>(
  list: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  const result = [...list];
  const [removed] = result.splice(fromIndex, 1);
  if (removed) {
    result.splice(toIndex, 0, removed);
  }
  return result;
}

export const groupsStorage = storage.defineItem<Group[]>(
  "local:scrapersGroups",
  {
    defaultValue: [],
  },
);

export const getGroups = async (): Promise<Group[]> => {
  return (await groupsStorage.getValue()) ?? [];
};

export const saveGroups = async (groups: Group[]): Promise<void> => {
  await groupsStorage.setValue(groups);
};

export function findElementsByLabel(labelValue: string): HTMLElement[] {
  const elements: HTMLElement[] = [];
  const cleanValue = labelValue.trim().toLowerCase();

  if (!cleanValue) return elements;

  // البحث عن وسم label أو mat-label
  const labels = Array.from(document.querySelectorAll("label, mat-label"));
  for (const label of labels) {
    const text = label.textContent?.trim().toLowerCase() || "";
    if (text.includes(cleanValue)) {
      // 1. البحث عبر خاصية for
      const htmlFor = label.getAttribute("for");
      if (htmlFor) {
        const el = document.getElementById(htmlFor);
        if (el) elements.push(el);
        continue;
      }

      // 2. البحث داخل الحاوي المشترك (لأنظمة Angular Material Dynamic Forms)
      const parentContainer = label.closest(
        "input-field, select-field, app-date-picker, app-dynamic-field, .mat-mdc-form-field",
      );
      if (parentContainer) {
        const inputEl = parentContainer.querySelector<HTMLElement>(
          "input, select, textarea, mat-select",
        );
        if (inputEl) {
          elements.push(inputEl);
          continue;
        }
      }

      // 3. البحث في العناصر الداخلية للـ Label
      const nestedInput = label.querySelector<HTMLElement>(
        "input, select, textarea, mat-select",
      );
      if (nestedInput) elements.push(nestedInput);
    }
  }

  return elements;
}

export function findInputElement(field: Field): HTMLElement[] {
  const val = (field.searchValue || "").trim();
  if (!val) return [];

  const selectors: Record<string, () => HTMLElement[]> = {
    elementId: () => {
      const cleanId = val.startsWith("#") ? val.substring(1) : val;
      const el = document.getElementById(cleanId);
      return el ? [el] : [];
    },
    // <-- إضافة خيار البحث بالوسم Label هنا
    elementLabel: () => findElementsByLabel(val),
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
