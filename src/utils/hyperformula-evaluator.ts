import { HyperFormula } from "hyperformula";
import type { Field } from "@/src/other/types";

const hf = HyperFormula.buildEmpty({
  licenseKey: "gpl-v3",
});

const SHEET_NAME = "ValidationSheet";
hf.addSheet(SHEET_NAME);

const sheetId: number = hf.getSheetId(SHEET_NAME) ?? 0;

function normalizeFormula(rawFormula: string): string {
  let f = rawFormula.trim();
  if (!f) return "";

  f = f.replace(/[\r\n]+/g, " ");

  if (!f.startsWith("=")) {
    f = "=" + f;
  }

  // إضافة LET لدعم تحويلها للأحرف الكبيرة تلقائياً
  f = f.replace(
    /\b(if|ifs|let|or|and|not|contains|concat|sum|count|text|average|min|max|isblank|iferror|isnumber|value)\b(?=\s*\()/gi,
    (match) => match.toUpperCase(),
  );

  f = f.replace(
    /\b(TRUE|FALSE)\b(?!\s*\()/gi,
    (match) => `${match.toUpperCase()}()`,
  );

  return f;
}

// تحويل رقم العمود (0-indexed) إلى حرف/أحرف العمود الصحيحة في الجدول
// (A, B, ... Z, AA, AB, ... ) بدون أي تدوير، لتجنب تصادم العناوين
// عند وجود أكثر من 26 حقلاً
function colIndexToLetter(idx: number): string {
  let n = idx + 1;
  let letter = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

function sanitizeValue(rawVal: any): any {
  if (
    rawVal instanceof Element ||
    (typeof rawVal === "object" && rawVal !== null && "value" in rawVal)
  ) {
    rawVal = (rawVal as HTMLInputElement).value;
  }

  if (rawVal === "" || rawVal === null || rawVal === undefined) {
    return null;
  }

  if (typeof rawVal === "string") {
    const trimmed = rawVal.trim();
    if (trimmed === "") return null;

    const num = Number(trimmed);
    return !isNaN(num) ? num : trimmed;
  }

  return rawVal;
}

export function evaluateFormulaCondition(
  currentField: Field,
  rowObj: Record<string, any>,
  valuesByFieldId: Record<string, any>,
  allFields: Field[],
): string {
  let currentVal = rowObj[currentField.fieldName] ?? "";
  if (
    currentVal instanceof Element ||
    (typeof currentVal === "object" &&
      currentVal !== null &&
      "value" in currentVal)
  ) {
    currentVal = (currentVal as HTMLInputElement).value;
  }

  const rawConditions =
    typeof currentField.conditions === "string"
      ? currentField.conditions.trim()
      : "";

  if (!rawConditions) {
    return String(currentVal ?? "");
  }

  try {
    let parsedFormula = normalizeFormula(rawConditions);

    const values: any[] = [];
    const cellAddressMap: Record<string, string> = {};

    allFields.forEach((f, idx) => {
      const fieldId = f.id ?? "";
      const rawVal = valuesByFieldId[fieldId] ?? rowObj[f.fieldName ?? ""];
      values.push(sanitizeValue(rawVal));

      const cellAddress = `${colIndexToLetter(idx)}1`;

      if (fieldId) {
        cellAddressMap[fieldId] = cellAddress;
      }
    });

    const currentId = currentField.id ?? "";
    const currentCellAddress = cellAddressMap[currentId] || "A1";
    cellAddressMap["VALUE"] = currentCellAddress;

    hf.setCellContents({ sheet: sheetId, row: 0, col: 0 }, [values]);

    // 1. استخراج متغيرات LET أولاً
    const letVariables = new Set<string>();
    const letMatches = parsedFormula.match(/LET\s*\(([^)]+)\)/i);
    if (letMatches && letMatches[1]) {
      const parts = letMatches[1].split(",");
      for (let i = 0; i < parts.length - 1; i += 2) {
        const varName = parts[i]?.trim();
        if (varName && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
          letVariables.add(varName);
        }
      }
    }

    // 2. استبدال IDs الحقول أولاً مع حماية متغيرات LET
    const keys = Object.keys(cellAddressMap)
      .filter((k) => !letVariables.has(k))
      .sort((a, b) => b.length - a.length);

    if (keys.length > 0) {
      const pattern = new RegExp(
        `(?<!["'a-zA-Z0-9_])\\b(${keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b(?!\\s*\\()(?!["'a-zA-Z0-9_])`,
        "g",
      );
      parsedFormula = parsedFormula.replace(
        pattern,
        (matched) => cellAddressMap[matched] ?? matched,
      );
    }

    // 3. تفكيك دالة LET بعد استبدال الحقول بعناوين الخلايا
    parsedFormula = processLetFormula(parsedFormula);

    hf.setCellContents({ sheet: sheetId, row: 1, col: 0 }, [[parsedFormula]]);

    const result = hf.getCellValue({ sheet: sheetId, row: 1, col: 0 });

    if (result === null || result === undefined || typeof result === "object") {
      console.warn(
        `Formula Evaluation returned an error in field [${currentField.fieldName}]:`,
        result,
        `Parsed formula: ${parsedFormula}`,
      );
      return String(currentVal);
    }

    return String(result);
  } catch (error) {
    console.warn(
      `Formula Evaluation Error in field [${currentField.fieldName}]:`,
      error,
    );
    return String(currentVal);
  }
}

// دالة لتفكيك وتطبيق دالة LET على المعادلة يدوياً
function processLetFormula(formula: string): string {
  const trimmed = formula.trim();

  const letMatch = trimmed.match(/^=LET\s*\(([\s\S]+)\)$/i);
  if (!letMatch || !letMatch[1]) return formula;

  const content = letMatch[1].trim();

  const args: string[] = [];
  let current = "";
  let depth = 0;
  let inString = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"' && content[i - 1] !== "\\") {
      inString = !inString;
    }

    if (!inString) {
      if (char === "(") depth++;
      else if (char === ")") depth--;
    }

    if (char === "," && depth === 0 && !inString) {
      args.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) args.push(current.trim());

  if (args.length < 3 || args.length % 2 === 0) {
    return formula;
  }

  // استخدام pop مع التأكد من القيمة لحل مشكلة Object is possibly 'undefined'
  const rawLastArg = args.pop();
  if (!rawLastArg) return formula;

  let bodyFormula = "=" + rawLastArg;
  const variableMap: Record<string, string> = {};

  for (let i = 0; i < args.length; i += 2) {
    const varName = args[i];
    const varVal = args[i + 1];

    // حل مشكلة Index type عبر التحقق من وجود المفتاح والقيمة
    if (varName !== undefined && varVal !== undefined) {
      variableMap[varName] = varVal;
    }
  }

  const sortedVars = Object.keys(variableMap).sort(
    (a, b) => b.length - a.length,
  );
  sortedVars.forEach((varName) => {
    const varValue = variableMap[varName];
    // التأكد من أن القيمة ليست undefined لحل مشكلة string | undefined في replace
    if (varValue !== undefined) {
      const regex = new RegExp(
        `(?<!["'a-zA-Z0-9_])${varName}(?!["'a-zA-Z0-9_])`,
        "g",
      );
      bodyFormula = bodyFormula.replace(regex, varValue);
    }
  });

  return bodyFormula;
}
