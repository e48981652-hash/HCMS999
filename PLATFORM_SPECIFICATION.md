# مواصفات منصة Horizon CMS - وصف شامل للوظائف والإمكانيات والمنطق

## 📋 جدول المحتويات
1. [نظرة عامة على المنصة](#نظرة-عامة-على-المنصة)
2. [الأدوار والصلاحيات](#الأدوار-والصلاحيات)
3. [الوظائف الرئيسية](#الوظائف-الرئيسية)
4. [منطق العمل والتدفقات](#منطق-العمل-والتدفقات)
5. [هيكل البيانات](#هيكل-البيانات)
6. [الميزات التفصيلية](#الميزات-التفصيلية)
7. [التفاعلات والواجهات](#التفاعلات-والواجهات)
8. [التفاصيل التقنية](#التفاصيل-التقنية)
9. [سيناريوهات الاستخدام](#سيناريوهات-الاستخدام)
10. [ملاحظات مهمة للمطورين](#ملاحظات-مهمة-للمطورين)

---

## 1. نظرة عامة على المنصة

### 1.1 الهدف من المنصة
منصة Horizon CMS هي نظام إدارة شامل للعملاء (Client Management System) مصمم لإدارة:
- **الطلبات (Requests)**: نظام ديناميكي لإنشاء وإدارة أنواع مختلفة من الطلبات
- **خطة المحتوى الشهرية (MCP)**: إدارة وتخطيط المحتوى الشهري للعملاء
- **خطة التسويق التشغيلية (OPMP)**: إدارة خطة التسويق الشاملة للعملاء
- **الفرق الداخلية (Teams)**: إدارة الفرق وتوزيع المهام
- **التحليلات والتقارير**: متابعة الأداء والإحصائيات

### 1.2 الخصائص الأساسية
- **نظام متعدد الأدوار**: يدعم 3 أدوار رئيسية (Client, Admin, Staff)
- **دعم ثنائي اللغة**: عربي/إنجليزي مع دعم RTL/LTR
- **نظام صلاحيات مرن**: Role-Based Access Control (RBAC)
- **واجهة حديثة**: React + TypeScript + Tailwind CSS
- **API RESTful**: Laravel Backend مع PostgreSQL

---

## 2. الأدوار والصلاحيات

### 2.1 الأدوار الرئيسية

#### 2.1.1 Client (العميل)
**الوصف**: المستخدم النهائي الذي يمتلك أو يرتبط بشركة/عمل تجاري

**الصلاحيات الأساسية**:
- `businesses.view` - عرض الشركات المرتبطة به
- `requests.create` - إنشاء طلبات جديدة
- `requests.view` - عرض طلباته فقط
- `mcp.view` - عرض خطة المحتوى الشهرية
- `opmp.view` - عرض خطة التسويق التشغيلية

**الوظائف**:
- إنشاء وإدارة الشركات الخاصة به
- تصفح أنواع الطلبات المتاحة
- إنشاء طلبات جديدة باستخدام النماذج الديناميكية
- متابعة حالة الطلبات
- إضافة تعليقات ومرفقات للطلبات
- عرض خطة المحتوى الشهرية (MCP)
- عرض وتعديل خطة التسويق التشغيلية (OPMP)
- إرسال ملاحظات (Feedback)
- الوصول إلى صفحة الدعم

**القيود**:
- لا يمكنه رؤية طلبات عملاء آخرين
- لا يمكنه تعديل حالة الطلبات (فقط المتابعة)
- لا يمكنه إدارة الفرق أو المستخدمين
- لا يمكنه الوصول إلى التقارير والتحليلات الشاملة

#### 2.1.2 Admin (المدير / Account Manager)
**الوصف**: المستخدم الذي يدير النظام بالكامل ويدير العملاء

**الصلاحيات الأساسية**:
- جميع الصلاحيات (Full Access)
- `clients.manage` - إدارة العملاء
- `businesses.manage` - إدارة الشركات
- `requests.assign` - تعيين الطلبات
- `requests.update_status` - تحديث حالة الطلبات
- `mcp.manage` - إدارة خطط المحتوى
- `opmp.manage` - إدارة خطط التسويق
- `settings.manage` - إدارة إعدادات النظام

**الوظائف**:
- إدارة العملاء (إنشاء، تعديل، تعطيل، تفعيل)
- إدارة أنواع الطلبات (Request Types) مع Form Builder
- إدارة الفرق (Teams) وتوزيع الأعضاء
- إدارة المستخدمين (Admin/Staff)
- تعيين الطلبات للفرق أو المستخدمين
- تحديث حالة الطلبات
- إنشاء وإدارة خطط المحتوى الشهرية (MCP)
- إدارة خطة التسويق التشغيلية (OPMP)
- عرض التقارير والتحليلات الشاملة
- إدارة إعدادات النظام
- عرض سجلات التدقيق (Audit Logs)
- تصدير البيانات

**القيود**:
- لا توجد قيود - وصول كامل للنظام

#### 2.1.3 Staff (الموظف)
**الوصف**: المستخدم الذي يعمل على تنفيذ المهام والطلبات

**الصلاحيات الأساسية**:
- `requests.view` - عرض الطلبات المعينة له
- `requests.update_status` - تحديث حالة الطلبات
- `mcp.view` - عرض خطط المحتوى

**الوظائف**:
- عرض الطلبات المعينة له أو لفريقه
- تحديث حالة الطلبات (in-progress, completed, etc.)
- إضافة تعليقات ومرفقات للطلبات
- عرض وإدارة منشورات MCP المعينة له
- تحديث محتوى منشورات MCP
- رفع الملفات والوسائط
- عرض Dashboard مع المهام المعينة

**القيود**:
- لا يمكنه رؤية جميع الطلبات (فقط المعينة له)
- لا يمكنه تعيين الطلبات لآخرين
- لا يمكنه إدارة العملاء أو الفرق
- لا يمكنه الوصول إلى الإعدادات أو التقارير الشاملة

### 2.2 نظام الصلاحيات التفصيلي

#### 2.2.1 Permissions (الصلاحيات)
المنصة تدعم 13 صلاحية أساسية:

1. **clients.view** - عرض قائمة العملاء
2. **clients.manage** - إدارة العملاء (إنشاء، تعديل، حذف)
3. **businesses.view** - عرض الشركات
4. **businesses.manage** - إدارة الشركات
5. **requests.create** - إنشاء طلبات جديدة
6. **requests.view** - عرض الطلبات
7. **requests.assign** - تعيين الطلبات للفرق/المستخدمين
8. **requests.update_status** - تحديث حالة الطلبات
9. **mcp.view** - عرض خطط المحتوى الشهرية
10. **mcp.manage** - إدارة خطط المحتوى
11. **opmp.view** - عرض خطة التسويق التشغيلية
12. **opmp.manage** - إدارة خطة التسويق
13. **settings.manage** - إدارة إعدادات النظام

#### 2.2.2 Roles (الأدوار)
- **Admin Role**: يحصل على جميع الصلاحيات تلقائياً
- **Staff Role**: يحصل على صلاحيات محددة (requests.view, requests.update_status, mcp.view)
- **Client Role**: يحصل على صلاحيات أساسية (businesses.view, requests.create, requests.view, mcp.view, opmp.view)

#### 2.2.3 Authorization Logic (منطق التفويض)
```
IF user.role === 'admin' THEN
    RETURN true (جميع الصلاحيات)
ELSE
    CHECK user.roles.permissions.contains(required_permission)
    RETURN true/false
END IF
```

---

## 3. الوظائف الرئيسية

### 3.1 إدارة العملاء (Client Management)

#### 3.1.1 إنشاء عميل جديد
**المسؤول**: Admin فقط

**التدفق**:
1. Admin يملأ نموذج إنشاء عميل:
   - الاسم الأول والأخير
   - البريد الإلكتروني
   - كلمة المرور
   - رقم الهاتف (اختياري)
2. النظام ينشئ حساب User جديد مع role = 'client'
3. يمكن ربط العميل بشركة موجودة أو إنشاء شركة جديدة له
4. يتم إرسال بريد إلكتروني للترحيب (اختياري)

#### 3.1.2 إدارة حالة العميل
**الحالات المتاحة**:
- **active** - نشط (افتراضي)
- **suspended** - معطل
- **inactive** - غير نشط

**العمليات**:
- **تعطيل (Suspend)**: يمنع العميل من تسجيل الدخول
- **تفعيل (Activate)**: إعادة تفعيل حساب معطل
- **حذف (Delete)**: حذف نهائي (Soft Delete)

### 3.2 إدارة الشركات (Business Management)

#### 3.2.1 هيكل الشركة
```
Business {
    id: number
    owner_user_id: number (User)
    name: string
    industry: string
    description: text
    social_links: JSON {
        facebook: string
        instagram: string
        twitter: string
        linkedin: string
        website: string
    }
    status: enum (active, suspended, inactive)
}
```

#### 3.2.2 العلاقات
- **Business → User (Owner)**: علاقة Many-to-One
- **Business → Users (Members)**: علاقة Many-to-Many عبر `business_user` pivot
- **Business → Requests**: علاقة One-to-Many
- **Business → MCPs**: علاقة One-to-Many
- **Business → OPMP**: علاقة One-to-One

#### 3.2.3 الوظائف
- **إنشاء شركة**: Client أو Admin يمكنه إنشاء شركة
- **تعديل الشركة**: Owner أو Admin يمكنه التعديل
- **ربط مستخدمين**: يمكن ربط مستخدمين متعددين بشركة واحدة
- **عرض الشركات**: Client يرى شركاته فقط، Admin يرى الجميع

### 3.3 نظام الطلبات (Request System)

#### 3.3.1 أنواع الطلبات (Request Types)
**الوصف**: أنواع الطلبات قابلة للتخصيص بالكامل باستخدام Form Builder

**الهيكل**:
```
RequestType {
    id: number
    name: string
    description: text
    is_published: boolean (يظهر للعملاء إذا كان true)
    default_team_id: number (الفريق الافتراضي)
    sla_hours: number (وقت الاستجابة بالساعات)
    fields: RequestTypeField[] (الحقول الديناميكية)
}
```

**الحقول المدعومة (Field Types)**:
1. **text** - نص عادي
2. **textarea** - نص طويل
3. **number** - رقم
4. **email** - بريد إلكتروني
5. **date** - تاريخ
6. **select** - قائمة منسدلة
7. **checkbox** - مربعات اختيار
8. **radio** - أزرار اختيار
9. **image** - صورة واحدة
10. **images** - صور متعددة
11. **file** - ملف واحد
12. **files** - ملفات متعددة

**خصائص الحقول**:
- `field_key` - المفتاح الفريد
- `label` - التسمية المعروضة
- `type` - نوع الحقل
- `required` - إلزامي/اختياري
- `order` - ترتيب العرض
- `options` - خيارات إضافية (JSON):
  ```json
  {
    "multiple": true,           // للصور/الملفات
    "max_files": 5,             // الحد الأقصى
    "max_size": 4,              // بالـ MB
    "allowed_types": ["jpg", "png"], // الأنواع المسموحة
    "options": ["Option 1", "Option 2"], // للـ select/radio
    "placeholder": "Enter text...",
    "min": 0,                   // للـ number
    "max": 100,
    "regex": "^[A-Z]+$"        // نمط التحقق
  }
  ```

#### 3.3.2 إنشاء طلب جديد
**التدفق الكامل**:

1. **العميل يختار نوع الطلب**:
   - يعرض له فقط Request Types التي `is_published = true`
   - يمكنه البحث والتصفية

2. **العميل يملأ النموذج الديناميكي**:
   - يتم إنشاء النموذج تلقائياً بناءً على `RequestType.fields`
   - التحقق من الحقول الإلزامية
   - رفع الملفات/الصور حسب المواصفات

3. **النظام ينشئ الطلب**:
   ```php
   Request {
       request_type_id: number
       business_id: number
       created_by: number (User ID)
       assigned_team_id: number (من RequestType.default_team_id)
       assigned_user_id: null (يتم التعيين لاحقاً)
       status: 'new'
       priority: 'medium'
       due_at: timestamp (now + RequestType.sla_hours)
   }
   ```

4. **حفظ قيم الحقول**:
   - يتم حفظ كل حقل في `request_field_values`
   - النصوص في `value_text`
   - الملفات/الصور في `value_json` مع URLs

5. **رفع الملفات**:
   - الصور/الملفات تُرفع إلى `storage/app/public/requests/{request_id}/`
   - يتم إنشاء `Attachment` record لكل ملف
   - يتم إرجاع URLs في الاستجابة

6. **إرسال الإشعارات**:
   - Event: `RequestCreated`
   - إشعار للفريق المعين
   - إشعار للـ Admin

#### 3.3.3 حالات الطلب (Request Statuses)
**الحالات المتاحة**:
- **new** - جديد (افتراضي عند الإنشاء)
- **draft** - مسودة
- **in-preparation** - قيد الإعداد
- **ready** - جاهز
- **scheduled** - مجدول
- **published** - منشور
- **needs-review** - يحتاج مراجعة
- **completed** - مكتمل
- **in-progress** - قيد التنفيذ
- **waiting** - في الانتظار
- **overdue** - متأخر (يتم حسابه تلقائياً)

**منطق التغيير**:
- Client: لا يمكنه تغيير الحالة (فقط المتابعة)
- Staff: يمكنه تغيير إلى (in-progress, completed, waiting, needs-review)
- Admin: يمكنه تغيير إلى أي حالة

**Event عند تغيير الحالة**:
```php
Event: RequestStatusChanged
- يتم إرسال إشعار للعميل
- يتم تحديث Dashboard
- يتم تسجيل في Audit Log
```

#### 3.3.4 أولويات الطلب (Priority)
**المستويات**:
- **low** - منخفض
- **medium** - متوسط (افتراضي)
- **high** - عالي
- **urgent** - عاجل

**التأثير**:
- يؤثر على ترتيب العرض في Dashboard
- يمكن استخدامه في التقارير والتحليلات

#### 3.3.5 تعيين الطلبات
**الطرق**:
1. **تعيين تلقائي**: عند الإنشاء يتم التعيين للفريق الافتراضي من `RequestType.default_team_id`
2. **تعيين يدوي (Admin)**:
   - تعيين لفريق: `assigned_team_id`
   - تعيين لمستخدم: `assigned_user_id`
   - يمكن تعيين للفريق والمستخدم معاً

**المنطق**:
- إذا تم تعيين لمستخدم، يظهر في Dashboard الخاص به
- إذا تم تعيين لفريق فقط، يظهر لجميع أعضاء الفريق
- Staff يمكنه رؤية الطلبات المعينة له أو لفريقه

#### 3.3.6 التعليقات والمرفقات
**التعليقات (Comments)**:
- يمكن إضافتها من قبل Client, Staff, Admin
- Polymorphic relationship (يمكن استخدامها مع Requests, MCP Posts, etc.)
- دعم Markdown (اختياري)

**المرفقات (Attachments)**:
- رفع ملفات إضافية أثناء العمل على الطلب
- Polymorphic relationship
- أنواع مدعومة: صور، مستندات، ملفات
- حجم محدود حسب الإعدادات

### 3.4 خطة المحتوى الشهرية (MCP - Monthly Content Plan)

#### 3.4.1 الهيكل
```
MCP {
    id: number
    business_id: number
    month: string (Format: "YYYY-MM")
    status: enum (draft, in-preparation, ready, published)
    posts: McpPost[]
}

McpPost {
    id: number
    mcp_id: number
    title: string
    platform: string (Instagram, Facebook, Twitter, LinkedIn, etc.)
    caption: text (Rich Text)
    status: enum (draft, in-preparation, scheduled, published)
    scheduled_at: timestamp
    published_at: timestamp
    assigned_to: number (User ID)
    metadata: JSON (بيانات إضافية خاصة بالمنصة)
}
```

#### 3.4.2 الوظائف

**للعميل (Client)**:
- عرض خطة المحتوى الشهرية
- عرض المنشورات المجدولة
- متابعة حالة المنشورات
- لا يمكنه التعديل (عرض فقط)

**للإدارة (Admin)**:
- إنشاء MCP جديد لشهر معين
- إضافة منشورات جديدة
- تعيين منشورات للفرق/المستخدمين
- جدولة المنشورات (Drag & Drop على Calendar)
- تحديث حالة المنشورات
- Bulk Creation (إنشاء منشورات متعددة دفعة واحدة)
- Post Templates (قوالب للمنشورات)

**للموظف (Staff)**:
- عرض المنشورات المعينة له
- تعديل محتوى المنشورات (Caption)
- رفع الوسائط (صور، فيديو)
- تحديث حالة المنشور (draft → in-preparation → scheduled → published)
- عرض Calendar View

#### 3.4.3 Calendar View مع Drag & Drop
**الوظيفة**:
- عرض Calendar شهري
- عرض المنشورات على التواريخ المحددة
- Drag & Drop لجدولة/إعادة جدولة المنشورات
- تحديث `scheduled_at` تلقائياً عند السحب

**التفاعل**:
1. المستخدم يسحب منشور من قائمة
2. يضعه على تاريخ في Calendar
3. النظام يحدث `scheduled_at` تلقائياً
4. يتم حفظ التغيير في Database

#### 3.4.4 Post Templates
**الوصف**: قوالب جاهزة للمنشورات لتسريع العمل

**الهيكل**:
```
PostTemplate {
    id: number
    name: string
    platform: string
    caption_template: text
    metadata_template: JSON
}
```

**الاستخدام**:
- Admin ينشئ قوالب
- عند إنشاء منشور جديد، يمكن اختيار قالب
- يتم ملء الحقول تلقائياً من القالب

### 3.5 خطة التسويق التشغيلية (OPMP - One-Page Marketing Plan)

#### 3.5.1 الهيكل
```
OPMP {
    id: number
    business_id: number (One-to-One)
    data: JSON {
        // هيكل مرن يمكن تخصيصه
        target_audience: {...},
        value_proposition: {...},
        marketing_channels: [...],
        goals: [...],
        kpis: [...],
        budget: {...},
        timeline: {...}
    }
    updated_by: number (User ID)
    versions: OpmpVersion[] (سجل التغييرات)
}
```

#### 3.5.2 الوظائف
- **عرض OPMP**: Client و Admin يمكنهما العرض
- **تعديل OPMP**: Admin فقط يمكنه التعديل
- **Version History**: حفظ نسخ من التعديلات
- **Export**: تصدير OPMP كـ PDF (اختياري)

#### 3.5.3 Version Control
- كل تعديل يحفظ نسخة جديدة في `opmp_versions`
- يمكن عرض التاريخ والرجوع لنسخة سابقة
- يتم تسجيل من قام بالتعديل ومتى

### 3.6 إدارة الفرق (Team Management)

#### 3.6.1 الهيكل
```
Team {
    id: number
    name: string
    description: text
    users: User[] (Many-to-Many)
    requests: Request[] (الطلبات المعينة)
    performance_metrics: {
        completed_requests: number
        average_completion_time: hours
        on_time_rate: percentage
    }
}
```

#### 3.6.2 الوظائف
- **إنشاء فريق**: Admin فقط
- **تعيين أعضاء**: Admin يمكنه إضافة/إزالة أعضاء
- **متابعة الأداء**: عرض إحصائيات الفريق
- **تعيين طلبات**: يمكن تعيين طلبات للفريق بالكامل

### 3.7 Dashboard والتحليلات

#### 3.7.1 Client Dashboard
**المحتوى**:
- إحصائيات سريعة:
  - عدد الطلبات الإجمالي
  - الطلبات الجديدة
  - الطلبات قيد التنفيذ
  - الطلبات المكتملة
- مخططات:
  - توزيع الطلبات حسب الحالة (Pie Chart)
  - الطلبات على مر الزمن (Line Chart)
- الطلبات الأخيرة
- MCP Overview (نظرة سريعة على خطة المحتوى)

#### 3.7.2 Admin Dashboard
**المحتوى**:
- إحصائيات شاملة:
  - إجمالي العملاء
  - إجمالي الطلبات
  - الطلبات الجديدة اليوم
  - الطلبات المتأخرة
- مخططات:
  - توزيع الطلبات حسب الحالة
  - الطلبات على مر الزمن
  - أداء الفرق (Bar Chart)
  - توزيع الطلبات حسب الأولوية
- النشاطات الأخيرة (Activity Feed)
- التنبيهات (Alerts):
  - طلبات متأخرة
  - طلبات تحتاج انتباه
  - عملاء جدد

#### 3.7.3 Staff Dashboard
**المحتوى**:
- المهام المعينة:
  - الطلبات المعينة له
  - المنشورات المطلوبة (MCP)
- إحصائيات شخصية:
  - الطلبات المكتملة هذا الشهر
  - متوسط وقت الإنجاز
  - معدل الإنجاز في الوقت المحدد
- Kanban Board للمهام

### 3.8 التقارير والتحليلات

#### 3.8.1 أنواع التقارير
1. **تقارير الطلبات**:
   - حسب الحالة
   - حسب الأولوية
   - حسب الفريق
   - حسب العميل
   - حسب الفترة الزمنية

2. **تقارير العملاء**:
   - عدد الطلبات لكل عميل
   - معدل الرضا
   - النشاط الزمني

3. **تقارير الفرق**:
   - الأداء
   - معدل الإنجاز
   - توزيع المهام

#### 3.8.2 التصدير
- تصدير إلى Excel/CSV
- تصدير إلى PDF
- تصدير مخططات كصور

### 3.9 الإعدادات (Settings)

#### 3.9.1 أنواع الإعدادات
1. **Email Templates**:
   - قوالب البريد الإلكتروني
   - تخصيص الرسائل

2. **Notification Settings**:
   - إعدادات الإشعارات
   - أنواع الإشعارات

3. **SLA Configuration**:
   - إعدادات وقت الاستجابة
   - SLA افتراضي

4. **Branding**:
   - الشعار
   - الألوان
   - الخطوط

5. **Audit Log Viewer**:
   - عرض سجلات النظام
   - البحث والتصفية

---

## 4. منطق العمل والتدفقات

### 4.1 تدفق إنشاء طلب جديد

```
1. Client يفتح Requests Catalog
   ↓
2. يعرض له Request Types المنشورة فقط
   ↓
3. Client يختار نوع طلب
   ↓
4. يتم تحميل النموذج الديناميكي بناءً على RequestType.fields
   ↓
5. Client يملأ النموذج:
   - الحقول النصية
   - رفع الملفات/الصور (إذا مطلوب)
   ↓
6. التحقق من الحقول (Frontend + Backend)
   ↓
7. إرسال Request إلى API
   ↓
8. Backend ينشئ Request:
   - request_type_id
   - business_id
   - created_by = current_user.id
   - assigned_team_id = RequestType.default_team_id
   - status = 'new'
   - due_at = now + RequestType.sla_hours
   ↓
9. حفظ قيم الحقول في request_field_values
   ↓
10. رفع الملفات إلى Storage
    ↓
11. إنشاء Attachment records
    ↓
12. إرسال Event: RequestCreated
    ↓
13. إرسال إشعارات:
    - للفريق المعين
    - للـ Admin
    ↓
14. إرجاع Response للـ Client
    ↓
15. Client يرى رسالة نجاح ويتم توجيهه لصفحة تفاصيل الطلب
```

### 4.2 تدفق معالجة طلب

```
1. Request موجود بحالة 'new'
   ↓
2. Admin/Staff يفتح Request Detail Page
   ↓
3. يمكنه:
   - تعيين الطلب لمستخدم/فريق (Admin فقط)
   - تغيير الأولوية
   - إضافة تعليقات
   - رفع مرفقات
   ↓
4. Staff يغير الحالة إلى 'in-progress'
   ↓
5. Event: RequestStatusChanged
   ↓
6. إشعار للعميل بتحديث الحالة
   ↓
7. Staff يعمل على الطلب:
   - يضيف تعليقات
   - يرفع ملفات
   - يطلب معلومات إضافية (يغير الحالة إلى 'waiting')
   ↓
8. عند الانتهاء، Staff يغير الحالة إلى 'completed'
   ↓
9. Event: RequestStatusChanged
   ↓
10. إشعار للعميل بإكمال الطلب
    ↓
11. العميل يمكنه:
    - مراجعة العمل
    - الموافقة
    - طلب تعديلات (يغير الحالة إلى 'needs-review')
```

### 4.3 تدفق إدارة MCP

```
1. Admin ينشئ MCP جديد لشهر معين
   ↓
2. MCP بحالة 'draft'
   ↓
3. Admin يضيف منشورات:
   - يدوياً (Post by Post)
   - Bulk Creation (عدة منشورات دفعة واحدة)
   - من Templates
   ↓
4. Admin يعين المنشورات:
   - للفرق
   - للمستخدمين
   ↓
5. Admin/Staff يجددل المنشورات:
   - باستخدام Calendar View
   - Drag & Drop على التواريخ
   ↓
6. Staff يعمل على المنشورات المعينة له:
   - يكتب Caption
   - يرفع الوسائط
   - يغير الحالة
   ↓
7. عند الجاهزية:
   - Staff يغير الحالة إلى 'ready'
   - Admin يراجع ويغير إلى 'scheduled'
   - عند وقت scheduled_at، يمكن تغيير إلى 'published'
```

### 4.4 تدفق المصادقة (Authentication Flow)

```
1. User يفتح Login Page
   ↓
2. يدخل Email + Password
   ↓
3. Frontend يرسل POST /api/v1/auth/login
   ↓
4. Backend يتحقق:
   - Email موجود؟
   - Password صحيح؟
   - User نشط؟
   ↓
5. إذا نجح:
   - إنشاء Sanctum Token
   - إرجاع User data + Token
   ↓
6. Frontend يحفظ Token في localStorage/memory
   ↓
7. Frontend يضيف Token لجميع API requests:
   Header: Authorization: Bearer {token}
   ↓
8. عند Logout:
   - Frontend يرسل POST /api/v1/auth/logout
   - Backend يحذف Token
   - Frontend يحذف Token من Storage
```

### 4.5 تدفق الصلاحيات (Authorization Flow)

```
1. User يحاول الوصول لصفحة/API endpoint
   ↓
2. Frontend يتحقق:
   - User مسجل دخول؟
   - User.role يسمح بالوصول؟
   ↓
3. إذا فشل → Redirect to Unauthorized Page
   ↓
4. إذا نجح → يرسل API Request
   ↓
5. Backend Middleware يتحقق:
   - Token صحيح؟
   - User موجود؟
   ↓
6. Role Middleware يتحقق:
   - User.role في القائمة المسموحة؟
   ↓
7. Policy/Gate يتحقق:
   - User.hasPermission(required_permission)?
   - User.hasBusinessAccess(business_id)?
   ↓
8. إذا فشل → 403 Forbidden
   ↓
9. إذا نجح → تنفيذ Controller Method
```

---

## 5. هيكل البيانات

### 5.1 الجداول الرئيسية

#### users
```sql
id, first_name, last_name, email, password, phone, role, 
email_verified_at, status, created_at, updated_at, deleted_at
```

#### businesses
```sql
id, owner_user_id, name, industry, description, social_links (JSON), 
status, created_at, updated_at, deleted_at
```

#### business_user (Pivot)
```sql
id, business_id, user_id, role_in_business, created_at, updated_at
```

#### request_types
```sql
id, name, description, is_published, default_team_id, sla_hours, 
created_at, updated_at, deleted_at
```

#### request_type_fields
```sql
id, request_type_id, field_key, label, type, required, order, 
options (JSON), created_at, updated_at
```

#### requests
```sql
id, request_type_id, business_id, created_by, assigned_team_id, 
assigned_user_id, status, priority, due_at, created_at, updated_at, deleted_at
```

#### request_field_values
```sql
id, request_id, field_key, value_text, value_json (JSON), 
created_at, updated_at
```

#### teams
```sql
id, name, description, created_at, updated_at, deleted_at
```

#### team_user (Pivot)
```sql
id, team_id, user_id, role, created_at, updated_at
```

#### mcps
```sql
id, business_id, month (YYYY-MM), status, created_at, updated_at, deleted_at
```

#### mcp_posts
```sql
id, mcp_id, title, platform, caption, status, scheduled_at, 
published_at, assigned_to, metadata (JSON), created_at, updated_at, deleted_at
```

#### opmps
```sql
id, business_id, data (JSON), updated_by, created_at, updated_at, deleted_at
```

#### opmp_versions
```sql
id, opmp_id, data (JSON), updated_by, created_at
```

#### comments
```sql
id, entity_type, entity_id, user_id, content, created_at, updated_at, deleted_at
```

#### attachments
```sql
id, entity_type, entity_id, user_id, file_name, file_path, 
file_size, mime_type, created_at, updated_at
```

#### notifications
```sql
id, user_id, type, title, message, data (JSON), read_at, 
created_at, updated_at
```

#### settings
```sql
id, key, value (JSON), description, created_at, updated_at
```

#### audit_logs
```sql
id, user_id, action, entity_type, entity_id, changes (JSON), 
ip_address, user_agent, created_at
```

### 5.2 العلاقات (Relationships)

```
User
├── businesses (Many-to-Many via business_user)
├── createdRequests (One-to-Many)
├── assignedRequests (One-to-Many)
├── assignedMcpPosts (One-to-Many)
├── teams (Many-to-Many via team_user)
└── roles (Many-to-Many via user_role)

Business
├── owner (Many-to-One: User)
├── users (Many-to-Many via business_user)
├── requests (One-to-Many)
├── mcps (One-to-Many)
└── opmp (One-to-One)

Request
├── requestType (Many-to-One)
├── business (Many-to-One)
├── creator (Many-to-One: User)
├── assignedTeam (Many-to-One)
├── assignedUser (Many-to-One: User)
├── fieldValues (One-to-Many)
├── comments (Polymorphic)
└── attachments (Polymorphic)

RequestType
├── fields (One-to-Many)
├── defaultTeam (Many-to-One)
└── requests (One-to-Many)

MCP
├── business (Many-to-One)
└── posts (One-to-Many)

McpPost
├── mcp (Many-to-One)
└── assignedUser (Many-to-One: User)

Team
├── users (Many-to-Many via team_user)
└── requests (One-to-Many)
```

---

## 6. الميزات التفصيلية

### 6.1 Dynamic Form Builder

#### 6.1.1 الوظيفة
Admin يمكنه إنشاء أنواع طلبات مخصصة باستخدام Form Builder مرئي (Visual Form Builder)

#### 6.1.2 الميزات
- **Drag & Drop**: سحب وإفلات الحقول لترتيبها
- **Field Types**: دعم جميع أنواع الحقول المذكورة
- **Validation Rules**: 
  - Required/Optional
  - Min/Max Length
  - Regex Pattern
  - Custom Validation Messages
- **Conditional Logic**: 
  - إظهار/إخفاء حقول بناءً على قيم حقول أخرى
  - مثال: إذا اختار "نعم" في حقل، يظهر حقل آخر
- **Field Options**: خيارات مخصصة لكل نوع حقل

#### 6.1.3 التخزين
- يتم حفظ الحقول في `request_type_fields`
- كل حقل له `options` JSON يحتوي على الإعدادات

### 6.2 File Upload System

#### 6.2.1 الميزات
- **Multiple Files**: رفع ملفات متعددة
- **File Types**: تحديد الأنواع المسموحة
- **File Size**: تحديد الحد الأقصى للحجم
- **Progress Tracking**: متابعة تقدم الرفع
- **Image Preview**: معاينة الصور قبل الرفع
- **Storage**: حفظ في `storage/app/public/`

#### 6.2.2 التحقق
- Frontend: التحقق قبل الرفع
- Backend: التحقق النهائي
- يتم رفض الملفات التي لا تطابق المواصفات

### 6.3 Notification System

#### 6.3.1 أنواع الإشعارات
- **Request Created**: عند إنشاء طلب جديد
- **Request Status Changed**: عند تغيير حالة طلب
- **Comment Added**: عند إضافة تعليق
- **Attachment Added**: عند إضافة مرفق
- **MCP Post Assigned**: عند تعيين منشور MCP
- **MCP Post Updated**: عند تحديث منشور

#### 6.3.2 طرق الإشعار
- **In-App**: إشعارات داخل التطبيق
- **Email**: بريد إلكتروني (اختياري)
- **Webhook**: إرسال لـ N8n أو أنظمة خارجية (اختياري)

#### 6.3.3 Event-Driven
- استخدام Laravel Events
- Listener يرسل الإشعارات تلقائياً

### 6.4 Search & Filtering

#### 6.4.1 البحث العام
- بحث في جميع الكيانات (Requests, Businesses, Users, etc.)
- Full-text search
- نتائج مصنفة حسب النوع

#### 6.4.2 التصفية
- **Requests**: حسب الحالة، الأولوية، الفريق، العميل، التاريخ
- **MCP Posts**: حسب الحالة، المنصة، التاريخ
- **Clients**: حسب الحالة، الصناعة

### 6.5 Bulk Operations

#### 6.5.1 العمليات المدعومة
- **Bulk Update**: تحديث عدة طلبات دفعة واحدة
- **Bulk Delete**: حذف عدة طلبات
- **Bulk Assign**: تعيين عدة طلبات لفريق/مستخدم
- **Bulk Status Change**: تغيير حالة عدة طلبات

#### 6.5.2 الواجهة
- Checkbox selection
- Select All
- Bulk Actions Dropdown

### 6.6 Export Functionality

#### 6.6.1 أنواع التصدير
- **Excel/CSV**: للبيانات الجدولية
- **PDF**: للتقارير
- **Images**: للمخططات

#### 6.6.2 البيانات القابلة للتصدير
- Requests
- Clients
- Reports
- Analytics

### 6.7 Audit Logs

#### 6.7.1 ما يتم تسجيله
- جميع العمليات المهمة:
  - إنشاء/تعديل/حذف
  - تغيير الحالات
  - تعيينات
  - تسجيلات دخول/خروج
- يتم تسجيل:
  - User ID
  - Action Type
  - Entity Type & ID
  - Changes (قبل/بعد)
  - IP Address
  - User Agent
  - Timestamp

#### 6.7.2 الواجهة
- قائمة بجميع السجلات
- البحث والتصفية
- عرض التفاصيل

---

## 7. التفاعلات والواجهات

### 7.1 واجهات العميل (Client UI)

#### 7.1.1 Dashboard
- Cards للإحصائيات
- Charts (Pie, Line)
- Recent Requests Table
- Quick Actions

#### 7.1.2 Requests Catalog
- Grid/List View لأنواع الطلبات
- Search & Filter
- Request Type Cards مع Description

#### 7.1.3 Create Request
- Dynamic Form بناءً على RequestType
- File Upload مع Progress
- Real-time Validation
- Preview قبل الإرسال

#### 7.1.4 Request Detail
- Timeline للحالة
- Comments Section
- Attachments Gallery
- Status Badge
- Due Date Countdown

#### 7.1.5 MCP View
- Calendar View
- List View
- Post Cards مع Status
- Filter by Platform

### 7.2 واجهات الإدارة (Admin UI)

#### 7.2.1 Dashboard
- Comprehensive Stats
- Multiple Charts
- Activity Feed
- Alerts Panel

#### 7.2.2 Clients Management
- DataTable مع:
  - Search
  - Filter
  - Sort
  - Pagination
  - Bulk Actions
- Create/Edit Dialog
- Suspend/Activate Actions

#### 7.2.3 Request Types Management
- List of Request Types
- Visual Form Builder:
  - Drag & Drop Fields
  - Field Configuration Panel
  - Preview
  - Validation Rules Builder
  - Conditional Logic Builder

#### 7.2.4 Teams Management
- Teams List
- Team Members Assignment
- Performance Metrics
- Charts

#### 7.2.5 MCP Management
- Calendar View مع Drag & Drop
- Bulk Post Creation Dialog
- Post Templates Management
- Post Editor

#### 7.2.6 Settings
- Tabs:
  - Email Templates
  - Notification Settings
  - SLA Configuration
  - Branding
  - Audit Logs Viewer

### 7.3 واجهات الموظف (Staff UI)

#### 7.3.1 Dashboard
- Assigned Tasks
- Personal Stats
- Quick Actions

#### 7.3.2 Tasks Page
- Kanban Board:
  - Columns: New, In Progress, Completed
  - Drag & Drop بين الأعمدة
  - Cards مع Details
- Filters:
  - By Status
  - By Priority
  - By Assignee

#### 7.3.3 MCP Page
- Calendar View
- List View
- Post Editor:
  - Rich Text Editor
  - Media Upload
  - Status Update

### 7.4 المكونات المشتركة (Shared Components)

#### 7.4.1 UI Components
- DataTable: جدول مع بحث، تصفية، ترتيب، pagination
- Charts: Line, Bar, Pie, Area
- Forms: Input, Textarea, Select, Checkbox, Radio
- Dialogs: Modal dialogs
- Toast: إشعارات
- Skeleton: Loading states
- Empty State: حالات فارغة
- Error Boundary: معالجة الأخطاء
- Status Badge: شارات الحالة
- Timeline: خط زمني
- File Uploader: رفع ملفات
- Image Gallery: معرض صور
- Date Picker: اختيار تاريخ
- Calendar: تقويم
- Pagination: ترقيم الصفحات
- Tooltip: تلميحات
- Confirm Dialog: تأكيد العمليات

#### 7.4.2 Layout Components
- MainLayout: التخطيط الرئيسي
- Sidebar: القائمة الجانبية (responsive)
- TopNavbar: شريط علوي مع:
  - Notifications Dropdown
  - Search Bar
  - User Menu
  - Language Switcher
- Breadcrumbs: مسار التنقل
- Command Palette: لوحة أوامر (اختياري)
- Mobile Sidebar: قائمة للجوال

---

## 8. التفاصيل التقنية

### 8.1 Frontend Architecture

#### 8.1.1 Tech Stack
- **React 18**: مكتبة UI
- **TypeScript**: للـ Type Safety
- **React Router v7**: للتنقل
- **Tailwind CSS**: للتصميم
- **shadcn/ui**: مكونات UI
- **i18next**: للترجمة
- **React Hook Form + Zod**: للتحقق من النماذج
- **Recharts**: للمخططات
- **@dnd-kit**: للـ Drag & Drop

#### 8.1.2 Structure
```
src/
├── components/      # المكونات
│   ├── ui/         # مكونات UI أساسية
│   └── layouts/    # مكونات التخطيط
├── contexts/       # React Contexts
├── hooks/          # Custom Hooks
├── lib/            # Utilities
│   ├── api.ts      # API Client
│   ├── i18n.ts     # الترجمة
│   └── utils.ts    # Utilities
├── locales/        # ملفات الترجمة
├── pages/          # الصفحات
└── main.tsx        # Entry Point
```

#### 8.1.3 API Client
- Centralized API client
- Request/Response interceptors
- Error handling
- Retry logic
- Request cancellation
- Caching support

### 8.2 Backend Architecture

#### 8.2.1 Tech Stack
- **Laravel 12**: PHP Framework
- **Laravel Sanctum**: Authentication
- **PostgreSQL**: Database
- **RESTful API**: Architecture

#### 8.2.2 Structure
```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/V1/     # API Controllers
│   └── Middleware/     # Middleware
├── Models/             # Eloquent Models
├── Policies/           # Authorization Policies
├── Events/             # Events
├── Listeners/          # Event Listeners
├── Jobs/               # Queue Jobs
└── Services/           # Business Logic
database/
├── migrations/         # Database Migrations
└── seeders/            # Database Seeders
routes/
└── api.php             # API Routes
```

#### 8.2.3 API Structure
- Versioned: `/api/v1/`
- RESTful conventions
- Protected routes with Sanctum
- Role-based middleware
- Policy-based authorization

### 8.3 Security

#### 8.3.1 Authentication
- Laravel Sanctum tokens
- Token expiration
- Secure password hashing (bcrypt)

#### 8.3.2 Authorization
- Role-based access control
- Policy-based authorization
- Business access checks

#### 8.3.3 Data Protection
- Input validation
- SQL injection protection (Eloquent)
- XSS protection (React escaping)
- CSRF protection
- File upload validation

---

## 9. سيناريوهات الاستخدام

### 9.1 سيناريو: عميل يريد إنشاء طلب تصميم

1. **العميل يسجل دخول**
2. **يفتح Requests Catalog**
3. **يختار "Design Request"**
4. **يملأ النموذج**:
   - عنوان التصميم
   - الوصف
   - رفع صور مرجعية (3 صور)
   - اختيار الألوان المفضلة
5. **يرسل الطلب**
6. **يتم إنشاء Request تلقائياً**:
   - status: 'new'
   - assigned_team_id: Design Team
   - due_at: بعد 72 ساعة (SLA)
7. **يصل إشعار للفريق**
8. **الفريق يبدأ العمل**
9. **العميل يتابع التقدم عبر Dashboard**

### 9.2 سيناريو: إدارة تخطيط محتوى شهري

1. **Admin ينشئ MCP جديد لشهر يناير 2024**
2. **يضيف 30 منشور** (واحد لكل يوم)
3. **يستخدم Bulk Creation**:
   - يختار Platform: Instagram
   - يختار Template: "Product Showcase"
   - يحدد التواريخ: 1-30 يناير
   - ينشئ 30 منشور دفعة واحدة
4. **يعين المنشورات للفريق**:
   - Content Team: 15 منشور
   - Design Team: 15 منشور
5. **يجدول المنشورات**:
   - يستخدم Calendar View
   - يسحب المنشورات على التواريخ
6. **Staff يعمل على المنشورات**:
   - يكتب Caption
   - يرفع الصور
   - يغير الحالة
7. **عند الموعد المحدد**:
   - يتم نشر المنشور تلقائياً (أو يدوياً)

### 9.3 سيناريو: متابعة أداء الفريق

1. **Admin يفتح Teams Page**
2. **يختار فريق "Content Team"**
3. **يرى Dashboard الفريق**:
   - عدد الطلبات المكتملة هذا الشهر
   - متوسط وقت الإنجاز
   - معدل الإنجاز في الوقت المحدد
   - الطلبات المتأخرة
4. **يرى Charts**:
   - أداء الفريق على مر الزمن
   - توزيع الطلبات حسب الحالة
5. **يقرر إعادة توزيع المهام**:
   - ينقل بعض الطلبات لفريق آخر
   - يعين موظفين جدد للفريق

---

## 10. ملاحظات مهمة للمطورين

### 10.1 عند بناء منصة مشابهة

#### 10.1.1 البيانات الأساسية
- ابدأ بإنشاء Models والعلاقات
- استخدم Migrations لإدارة Database Schema
- استخدم Seeders للبيانات الأولية

#### 10.1.2 المصادقة والصلاحيات
- نفذ Authentication أولاً
- أنشئ نظام Roles & Permissions
- استخدم Middleware للتحقق

#### 10.1.3 النظام الديناميكي
- صمم Request System ليكون مرناً
- استخدم JSON للحقول الديناميكية
- أنشئ Form Builder قابل للتوسع

#### 10.1.4 الإشعارات
- استخدم Event-Driven Architecture
- نفذ Notification System مركزي
- أضف Real-time updates (اختياري)

#### 10.1.5 الواجهة
- استخدم Component Library
- نفذ Responsive Design
- أضف Loading & Error States
- استخدم i18n من البداية

### 10.2 أفضل الممارسات

1. **Security First**: تحقق من الصلاحيات في كل endpoint
2. **Validation**: تحقق في Frontend و Backend
3. **Error Handling**: معالجة شاملة للأخطاء
4. **Logging**: سجل العمليات المهمة
5. **Testing**: اكتب Tests للوظائف الحرجة
6. **Documentation**: وثق الـ API والكود
7. **Performance**: استخدم Caching و Indexing
8. **Scalability**: صمم ليكون قابلاً للتوسع

---

## 11. الخلاصة

منصة Horizon CMS هي نظام إدارة شامل يوفر:

✅ **إدارة متكاملة للعملاء والطلبات**
✅ **نظام طلبات ديناميكي قابل للتخصيص**
✅ **إدارة خطط المحتوى والتسويق**
✅ **نظام صلاحيات مرن**
✅ **واجهات حديثة وسهلة الاستخدام**
✅ **تحليلات وتقارير شاملة**
✅ **دعم ثنائي اللغة**

هذا الوصف الشامل يجب أن يكون كافياً لأي مطور لبناء منصة مشابهة بنفس الوظائف والإمكانيات.

---

**تم إنشاء هذا الملف بواسطة**: AI Assistant  
**التاريخ**: 2024  
**الإصدار**: 1.0

