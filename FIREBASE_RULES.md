# Firestore Rules (اقتراح)

> عدّل حسب احتياجك. هذه القواعد تسمح:
- المستخدم يسجّل ويكتب ملفه داخل `users/{uid}` عند التسجيل
- الأدمن (Front-end) ليس له claim حقيقي، لذلك القواعد هنا مبنية على صلاحيات المستخدم فقط.
- المستخدم يقرأ بياناته فقط.
- المستخدم يضيف خبر ضمن `news` ويقرأ أخباره.
- قراءة الأخبار المؤرشفة الصحيحة متاحة لجميع المستخدمين المسجلين.
- التعديل على الأخبار أو اعتمادها يجب أن يكون من الأدمن — لكن هذا يحتاج Custom Claims / Backend.

**لذلك:**
إذا تريد أمن كامل، أنشئ Cloud Functions + Custom Claims للأدمن، ثم غيّر القواعد.

---

## قواعد مبسطة للتجربة (ليست مثالية)
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    // users
    match /users/{uid} {
      allow create: if signedIn() && request.auth.uid == uid;
      allow read: if signedIn() && request.auth.uid == uid;
      allow update: if signedIn() && request.auth.uid == uid;
      // delete by user only (optional)
      allow delete: if false;
    }

    // news
    match /news/{id} {
      // user creates news
      allow create: if signedIn()
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.status == "pending";

      // user can read own news
      allow read: if signedIn()
        && (resource.data.userId == request.auth.uid
            || (resource.data.status == "archived" && resource.data.verdict == true));

      // user should not update after create (admin only ideally)
      allow update, delete: if false;
    }
  }
}
```

# Storage Rules (اقتراح)
```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /submissions/{uid}/{newsId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

> ملاحظة مهمة: هذه قواعد للتجربة. لو بدك الأدمن يعدل الأخبار بأمان لازم Backend (Cloud Functions) عشان القواعد تعرف "مين أدمن".