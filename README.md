# AmmanVerify (Firebase Fact-Check Web)

مشروع Frontend جاهز (HTML/CSS/JS) لرفع الأخبار للمعاينة ثم اعتمادها من الأدمن (صحيح/خاطئ) مع أرشفة تلقائية.

## المميزات
- تسجيل دخول / إنشاء حساب (Email & Password)
- أي حساب جديد يحتاج موافقة الأدمن (Approved) قبل السماح بالدخول
- لوحة أدمن:
  - عرض الأخبار قيد المعاينة
  - تعديل الخبر + اعتماد (صحيح/خاطئ) -> ينتقل للأرشيف مع تاريخ القرار
  - إدارة المستخدمين (موافقة/رفض/تعطيل/حذف بيانات)
- لوحة مستخدم:
  - واجهة ترحيبية
  - إرسال خبر (نص + ملف اختياري)
  - متابعة حالة الأخبار (Pending / True / False)
  - مشاهدة الأخبار الصحيحة (كل الأخبار الصحيحة أو الصحيحة الخاصة بي)

> ملاحظة: حذف حساب Firebase Auth لمستخدم آخر من داخل المتصفح غير ممكن بدون Backend (Cloud Functions/Admin SDK).
> قمنا بتنفيذ "تعطيل الحساب" وحذف بياناته من Firestore.

---

## 1) إعداد Firebase
1. افتح Firebase Console
2. فعّل:
   - Authentication -> Email/Password
   - Firestore Database
   - Storage
3. الصق config داخل:
   - `assets/js/firebase.js`

## 2) قواعد Firestore و Storage
انسخ القواعد من الملف:
- `FIREBASE_RULES.md`

## 3) تشغيل محلياً
بسبب Firebase Modules، افتح المشروع عبر سيرفر محلي.

### الطريقة السريعة (VS Code)
- ثبّت إضافة: Live Server
- افتح `index.html` واضغط **Go Live**

### الطريقة عبر Node
```bash
npx serve .
```

## 4) الرفع على GitHub
1. أنشئ Repository جديد
2. انسخ ملفات المشروع بداخله
3. ارفع (commit & push)

### نشر GitHub Pages (Frontend فقط)
- Settings -> Pages
- اختر:
  - Branch: `main`
  - Folder: `/root`
- احفظ ثم افتح رابط Pages

> تنبيه: لو استخدمت GitHub Pages لازم تضيف الدومين/الرابط ضمن Authorized domains في Firebase Authentication.

## 5) نشر Firebase Hosting (مفضل)
```bash
npm i -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## بيانات الأدمن
- كلمة مرور الأدمن ثابتة داخل `assets/js/index.js` حسب طلبك:
  - `SS4625ss`

يفضّل لاحقاً جعل الأدمن عبر Custom Claims أو صفحة أدمن مرتبطة بحساب محدد.