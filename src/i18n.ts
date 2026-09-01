import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ar from "@/src/other/ar.json";
import en from "@/src/other/en.json"; // تم تصحيح المائل المزدوج في المسار أيضاً

// تحديث اتجاه النص (RTL / LTR) في DOM
const updateDocumentDirection = (lng: string) => {
  const dir = lng.startsWith("ar") ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: "ar", // اللغة الافتراضية

    // عند عدم وجود النص في ملف الترجمة، يتم إرجاع اسم المفتاح (Key) نفسه كما هو
    parseMissingKeyHandler: (key) => {
      return key;
    },

    // إرجاع اسم المفتاح إذا كانت قيمته فارغة أو مفقودة
    returnEmptyString: false,

    interpolation: {
      escapeValue: false,
    },
  });

// ضبط الاتجاه عند التشغيل أول مرة
updateDocumentDirection(i18n.language);

// الاستماع لتغير اللغة لتحديث الاتجاه تلقائياً
i18n.on("languageChanged", (lng) => {
  updateDocumentDirection(lng);
});

export default i18n;
