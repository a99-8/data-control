import { storage } from "wxt/utils/storage";
import type { Group } from "@/src/other/types";
export * from "@/src/utils/handlerpopupAction";
export * from "@/src/utils/injector-scraper";

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
