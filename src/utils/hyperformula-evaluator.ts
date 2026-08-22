import { HyperFormula } from "hyperformula";
import type { Field } from "@/src/other/types";

// تهيئة المحرك
const hf = HyperFormula.buildEmpty({
  licenseKey: "gpl-v3",
});

const SHEET_NAME = "ValidationSheet";
hf.addSheet(SHEET_NAME);
const sheetId: number = hf.getSheetId(SHEET_NAME) ?? 0;

/**
 * تنظيف وتنسيق الصيغة لتوافق HyperFormula تلقائيًا
 */
function normalizeFormula(rawFormula: string): string {
  let f = rawFormula.trim();
  if (!f) return "";

  // إزالة الأسطر الجديدة واستبدالها بمسافات
  f = f.replace(/[\r\n]+/g, " ");

  // إضافة علامة = في البداية إن لم تكن موجودة
  if (!f.startsWith("=")) {
    f = "=" + f;
  }

  // تحويل أسماء الدوال الشهيرة إلى حروف كبيرة (UPPERCASE)
  f = f.replace(
    /\b(if|or|and|not|contains|concat|sum|count|text|average|min|max)\b(?=\s*\()/gi,
    (match) => match.toUpperCase(),
  );

  return f;
}

/**
 * تقييم الشرط باستخدام HyperFormula
 */
export function evaluateFormulaCondition(
  currentField: Field,
  rowObj: Record<string, any>,
  valuesByFieldId: Record<string, any>,
  allFields: Field[],
): string {
  const currentVal = rowObj[currentField.fieldName] ?? "";
  const rawConditions =
    typeof currentField.conditions === "string"
      ? currentField.conditions.trim()
      : "";

  if (!rawConditions) {
    return currentVal;
  }

  try {
    // 1. معالجة وتنظيف الصيغة تلقائيًا
    let parsedFormula = normalizeFormula(rawConditions);

    const values: any[] = [];
    const cellAddressMap: Record<string, string> = {};

    // 2. ترتيب الحقول وتسكين القيم
    allFields.forEach((f, idx) => {
      const rawVal = valuesByFieldId[f.id] ?? rowObj[f.fieldName] ?? "";
      const val = typeof rawVal === "string" ? rawVal.trim() : rawVal;

      // تحويل الرقم إلى Number لتسهيل المقارنات الحسابية
      values.push(!isNaN(Number(val)) && val !== "" ? Number(val) : val);

      const colLetter = String.fromCharCode(65 + (idx % 26));
      const cellAddress = `${colLetter}1`;

      cellAddressMap[f.id] = cellAddress;
      cellAddressMap[f.fieldName] = cellAddress;
    });

    cellAddressMap["VALUE"] = cellAddressMap[currentField.id] || "A1";

    // 3. كتابة بيانات الصف الأول
    hf.setCellContents({ sheet: sheetId, row: 0, col: 0 }, [values]);

    // 4. استبدال الكلمة المفتاحية VALUE
    const valueTarget = cellAddressMap["VALUE"] || "A1";
    parsedFormula = parsedFormula.replace(/\bVALUE\b/g, valueTarget);

    // 5. استبدال المعرفات بأسماء الخلايا (A1, B1...)
    const keys = Object.keys(cellAddressMap).sort(
      (a, b) => b.length - a.length,
    );

    keys.forEach((key) => {
      const targetCell = cellAddressMap[key];
      if (targetCell) {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(
          `(?:\\b|(?<=\\s|^))${escapedKey}(?:\\b|(?=\\s|$))`,
          "g",
        );
        parsedFormula = parsedFormula.replace(regex, targetCell);
      }
    });

    // 6. وضع الصيغة وتقييمها في الصف الثاني (A2)
    hf.setCellContents({ sheet: sheetId, row: 1, col: 0 }, [[parsedFormula]]);

    // 7. قراءة النتيجة
    const result = hf.getCellValue({ sheet: sheetId, row: 1, col: 0 });

    if (result === null || result === undefined || typeof result === "object") {
      return currentVal;
    }

    return String(result);
  } catch (error) {
    console.warn(
      `Formula Evaluation Error in field [${currentField.fieldName}]:`,
      error,
    );
    return currentVal;
  }
}
