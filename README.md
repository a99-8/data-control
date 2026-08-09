# 🧩 CSV Injector & Scraper Extension (`csv-injector-extension`)

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

```text
csv-injector-extension/
├── 📄 package.json                    # إدارة الحزم والسكربتات (WXT, React, TypeScript, PapaParse, i18next)
├── 📄 tsconfig.json                  # إعدادات TypeScript الممتدة من WXT
├── 📄 wxt.config.ts                   # إعدادات إطار العمل WXT لبناء إضافة المتصفح
│
├── 📁 entrypoints/                    # نقاط الإدخال الخاصة بالإضافة (Web Extension Entrypoints)
│   ├── 📁 options/                    # لوحة الإعدادات والإدارة الكبيرة
│   │   ├── 📄 App.tsx                 # [OptionsApp / OptionsContent] التحكم بالمجموعات ومحددات DOM
│   │   ├── 📄 index.html              # صفحة HTML للوحة الإعدادات
│   │   └── 📄 main.tsx                # نقطة الانطلاق والربط بـ React و i18n
│   │
│   ├── 📁 popup/                      # القائمة المنبثقة عند الضغط على أيقونة الإضافة
│   │   ├── 📄 App.tsx                 # [PopupApp / PopupContent] القائمة السريعة لإرسال أوامر الحقن والكشط
│   │   ├── 📄 index.html              # HTML الخاص بالقائمة المنبثقة
│   │   └── 📄 main.tsx                # تهيئة React للـ Popup
│   │
│   ├── 📁 sidepanel/                  # اللوحة الجانبية للتصفح والفحص
│   │   ├── 📄 App.tsx                 # [SidePanelApp / SidePanel] عرض الحقول الممسوحة وتصدير CSV
│   │   ├── 📄 index.html              # HTML اللوحة الجانبية
│   │   └── 📄 main.tsx                # تهيئة React للـ SidePanel
│   │
│   ├── 📄 background.ts               # السكربت الخلفي للإضافة (Background Service Worker)
│   └── 📄 content.ts                  # السكربت المستمع داخل الصفحة النشطة (active tab)
│                                      #  ├── SCRAPE_DATA          -> يستخرج البيانات عبر extractGroupData ويوفر CSV
│                                      #  ├── INJECT_DATA          -> يحقن البيانات عبر injectGroupData
│                                      #  └── SCAN_INPUT_FIELDS    -> يمسح حقول DOM بمطابقة Labels بـ O(N)
│
└── 📁 src/                            # شجرة الكود المصدري وإعادة الاستخدام
    ├── 📁 components/                 # واجهات ومكونات React
    │   ├── 📄 FieldsTable.tsx         # جدول عرض وتعديل الحقول
    │   ├── 📄 GroupsTable.tsx         # جدول عرض وإدارة المجموعات
    │   ├── 📄 ScanFieldsTable.tsx     # جدول الحقول المكتشفة في اللوحة الجانبية
    │   ├── 📄 Modal.tsx               # نافذة النوافذ المنبثقة (Modal Dialog)
    │   └── 📄 ModalContext.tsx        # سياق إدارة النوافذ (ModalProvider & useModal)
    │
    ├── 📁 hooks/                      # الخطافات المخصصة (Custom React Hooks)
    │   ├── 📄 useElementInspector.ts  # خطاف فحص عناصر DOM من الصفحة
    │   ├── 📄 useFieldsManager.ts     # إدارة عمليات إضافة وتعديل الحقول
    │   ├── 📄 useGroupsManager.ts     # إدارة المجموعات والتخزين Local Storage
    │   ├── 📄 usePopupAction.ts       # معالجة أوامر التفاعل من الـ Popup
    │   ├── 📄 useSidePanelInspector.ts# فحص العناصر والتفاعل مع SidePanel
    │   └── 📄 useSingleGroupActions.ts# إجراء العمليات على مجموعة واحدة
    │
    ├── 📁 types/                      # تعريف الأنواع والواجهات (TypeScript Interfaces)
    │   └── 📄 index.ts                # (Group, Field, ActionRequest, ActionResponse, TableField, ...)
    │
    ├── 📁 utils/                      # الأدوات والمساعدات البرمجية
    │   ├── 📄 index.ts                # أدوات التحميل والتخزين (downloadCSV, reorderArray, groupsStorage)
    │   ├── 📄 handlerpopupAction.ts   # (handleScrapeData, handleInjectData, handleTransferData, handleCopyData)
    │   └── 📄 injector-scraper.ts     # المحرك الرئيسي (findInputElement, extractGroupData, injectGroupData, evaluateConditions)
    │
    └── 📄 i18n.ts                     # تهيئة اللغات ودعم الاتجاهين RTL/LTR (updateDocumentDirection)
```
