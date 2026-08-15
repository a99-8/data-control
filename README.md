> 🤖 **ملاحظة:** تم استخدام **Gemini AI** للمساعدة في تطوير وبرمجة هذا المشروع.

# 🧩 CSV Injector & Scraper Extension (`data-control`)

إضافة متصفح حديثة ومتقدمة مبنية باستخدام **WXT Framework** و **React** و **TypeScript**. تتيح الإضافة للمستخدمين إمكانية استخراج البيانات (Data Scraping) وحقنها (Data Injection) داخل عناصر صفحات الويب المحددة بشكل آلي ومخصص، مع دعم بناء مجموعات متعدّدة (Groups) وحقول إدخال ديناميكية (Fields).

---

## 🚀 المميزات الرئيسية

- **لوحة التحكم الشاملة (Options Page):** إدارة المجموعات، إدخال محددات عناصر الـ DOM (Selectors)، وتحديد الشروط الخاصة بالحقول والقواعد.
- **القائمة المنبثقة السريعة (Popup Menu):** تنفيذ سريع لأوامر الكشط (`SCRAPE_DATA`)، الحقن (`INJECT_DATA`)، فتح اللوحة الجانبية، أو نسخ البيانات.
- **اللوحة الجانبية التفاعلية (Side Panel):** فحص الحقول والمسح المباشر لعناصر DOM (`SCAN_INPUT_FIELDS`) وترتيبها وتصدير البيانات إلى ملفات CSV.
- **أداء فائق للـ Content Script:**
  - كشط وحقن البيانات بسلاسة.
  - مطابقة الـ Labels لحقول الإدخال للوصول إلى أداء زمني أقصى مقداره **$O(N)$**.
  - دعم التفاعل مع Shadow DOM باستخدام مكتبة `query-selector-shadow-dom`.
- **دعم متعدد اللغات (i18n):** دعم الكامل للغة العربية والإنجليزية وتغيير اتجاه الصفحة تلقائياً (RTL / LTR).

---

## 📐 خريطة علاقات الملفات وهيكلية المشروع (Architecture Diagram)

توضح الشجرة التالية الهيكل التنظيمي للمشروع والعلاقات التشغيلية بين النقاط المرجعية (Entrypoints)، المكونات (Components)، الخُطافات (Hooks)، والأدوات المساعدة (Utils):

csv-injector-extension/
├── 📄 package.json # إدارة الحزم والسكربتات (WXT, React, TypeScript, PapaParse, i18next, Bootstrap, Lodash, Lucide)
├── 📄 tsconfig.json # إعدادات TypeScript الممتدة من WXT
├── 📄 wxt.config.ts # إعدادات إطار العمل WXT لبناء إضافة المتصفح
│
├── 📁 entrypoints/ # نقاط الإدخال الخاصة بالإضافة (Web Extension Entrypoints)
│ ├── 📁 options/ # لوحة الإعدادات والإدارة الكبيرة[cite: 1]
│ │ ├── 📄 App.tsx # [OptionsApp / OptionsContent] التحكم بالمجموعات ومحددات DOM[cite: 1]
│ │ ├── 📄 index.html # صفحة HTML للوحة الإعدادات
│ │ └── 📄 main.tsx # نقطة الانطلاق والربط بـ React و i18n[cite: 1]
│ │
│ ├── 📁 popup/ # القائمة المنبثقة عند الضغط على أيقونة الإضافة[cite: 1]
│ │ ├── 📄 App.tsx # [PopupApp / PopupContent] القائمة السريعة لإرسال أوامر الحقن والكشط[cite: 1]
│ │ ├── 📄 index.html # HTML الخاص بالقائمة المنبثقة[cite: 1]
│ │ └── 📄 main.tsx # تهيئة React للـ Popup[cite: 1]
│ │
│ ├── 📁 sidepanel/ # اللوحة الجانبية للتصفح والفحص[cite: 1]
│ │ ├── 📄 App.tsx # [SidePanelApp / SidePanel] عرض الحقول الممسوحة وتصدير CSV[cite: 1]
│ │ ├── 📄 index.html # HTML اللوحة الجانبية[cite: 1]
│ │ └── 📄 main.tsx # تهيئة React للـ SidePanel[cite: 1]
│ │
│ ├── 📄 background.ts # السكربت الخلفي للإضافة (Background Service Worker)
│ └── 📄 content.ts # السكربت المستمع داخل الصفحة النشطة (active tab) مع معالجة الأوامر[cite: 1]
│ # ├── SCRAPE_DATA -> استخراج البيانات وإنشاء ملفات CSV[cite: 1]
│ # ├── INJECT_DATA -> حقن البيانات في عناصر المدخلات[cite: 1]
│ # ├── TRANSFER_DATA -> نقل البيانات بين المجموعات[cite: 1]
│ # └── COPY_DATA -> نسخ البيانات للقيام بنقل مباشر[cite: 1]
│
└── 📁 src/ # شجرة الكود المصدري وإعادة الاستخدام[cite: 1]
├── 📁 components/ # واجهات ومكونات React[cite: 1]
│ ├── 📁 FieldsTable/ # مكونات جدول الحقول المقسمة[cite: 1]
│ │ ├── 📄 CompactFieldsTable.tsx # العرض المصغر لجدول الحقول[cite: 1]
│ │ ├── 📄 FieldRow.tsx # مكون سطر الحقل الفردي[cite: 1]
│ │ └── 📄 FullFieldsTable.tsx # العرض الكامل لجدول الحقول[cite: 1]
│ ├── 📄 FieldsTable.tsx # المكون الموحد لجدول الحقول (UnifiedFieldsTable)[cite: 1]
│ ├── 📄 GroupsTable.tsx # جدول عرض وإدارة المجموعات[cite: 1]
│ ├── 📄 Modal.tsx # نافذة النوافذ المنبثقة (Modal Dialog)[cite: 1]
│ └── 📄 ModalContext.tsx # سياق إدارة النوافذ (ModalProvider & useModal)[cite: 1]
│
├── 📁 hooks/ # الخطافات المخصصة (Custom React Hooks)[cite: 1]
│ ├── 📄 useElementInspector.ts # خطاف فحص عناصر DOM من الصفحة[cite: 1]
│ ├── 📄 useFieldsManager.ts # إدارة عمليات إضافة وتعديل الحقول[cite: 1]
│ ├── 📄 useGroupsManager.ts # إدارة المجموعات والتخزين[cite: 1]
│ ├── 📄 usePopupAction.ts # معالجة أوامر التفاعل من الـ Popup[cite: 1]
│ ├── 📄 useSidePanelInspector.ts# فحص العناصر والتفاعل مع SidePanel[cite: 1]
│ └── 📄 useSingleGroupActions.ts# إجراء العمليات على مجموعة واحدة[cite: 1]
│
├── 📁 other/ # التعريفات والأنواع[cite: 1]
│ ├── 📄 ar.json # ملف اللغة العربية [cite: 1]
│ ├── 📄 en.json # ملف اللغة الانجليزية [cite: 1]
│ ├── 📄 style.css # ملف التنسيقات[cite: 1]
│ └── 📄 types.ts # تعريف جميع أنواع TypeScript (Group, Field, ActionRequest, ActionResponse, TableField, ...)[cite: 1]
│
├── 📁 utils/ # الأدوات والمساعدات البرمجية[cite: 1]
│ ├── 📄 handlerpopupAction.ts # (handleScrapeData, handleInjectData, handleTransferData, handleCopyData, copyUsingExecCommand)[cite: 1]
│ ├── 📄 index.ts # أدوات التحميل والتخزين (downloadCSV, reorderArray, groupsStorage, saveGroups, getGroups)[cite: 1]
│ └── 📄 injector-scraper.ts # المحرك الرئيسي (findInputElement, extractGroupData, injectGroupData, evaluateConditions, getNodeValue)[cite: 1]
│
└── 📄 i18n.ts # تهيئة اللغات ودعم الاتجاهين RTL/LTR (updateDocumentDirection)[cite: 1]
