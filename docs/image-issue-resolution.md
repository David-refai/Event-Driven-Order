# توثيق حل مشكلة عرض الصور (Image Display Resolution)

هذا المستند يشرح المشكلة التي واجهناها في عرض صور الملف الشخصي (Profile Pictures) والحلول التي تم تطبيقها لضمان استقرار النظام.

## 1. المشكلة (The Problem)
كان المستخدمون يواجهون أخطاء **404 Not Found** عند محاولة عرض الصور المرفوعة، على الرغم من أن الملفات موجودة فعلياً على السيرفر.

### الأسباب الرئيسية:
1. **تداخل المسارات (Routing Conflict):** كانت بوابة API (Gateway) تحتوي على مسار عام `/uploads/**` يوجه جميع الطلبات لخدمة المنتجات (`product-service`)، بينما صور البروفايل موجودة في خدمة الهوية (`auth-service`).
2. **نسخ برمجية قديمة (Stale Build):** التعديلات في ملفات الإعدادات (`application.yml`) لم تكن تظهر في الحاويات (Docker Containers) لأن الـ Docker كان يقوم بنسخ ملف الـ JAR القديم الذي لم يتم تحديثه بواسطة Maven.
3. **التحقق من الهوية (Security):** كانت خدمات الخلفية تمنع الوصول للصور بدون "Token"، مما يسبب خطأ **401 Unauthorized**.
4. **روابط غير مكتملة في الواجهة:** كانت الواجهة الأمامية تحاول الوصول للصور عبر رابط نسبي أو رابط خاطئ (`localhost:3000`) بدلاً من الـ Gateway.

---

## 2. الكود الذي كان يعيق الحل (The Blocking Code)

### في بوابة API (`api-gateway/application.yml`):
كان المسار الخاص بالمنتجات يأخذ الأولوية ويحتوي على مسار عام جداً:
```yaml
# الكود القديم (المسبب للمشكلة)
- id: product-service
  predicates:
    - Path=/api/products/**, /uploads/** # هذا السطر كان يسرق طلبات البروفايل
```

### في إعدادات الحماية (`SecurityConfig.java`):
كانت المسارات تتطلب تسجيل دخول حتى للصور العامة:
```java
// الكود القديم
.requestMatchers("/auth/**").permitAll()
.anyRequest().authenticated() // هذا كان يشمل /uploads/
```

---

## 3. الحل النهائي (The Solution)

### أ- إصلاح المسارات في الـ Gateway:
تم فصل مسارات الصور وتخصيصها لضمان وصول كل طلب للخدمة الصحيحة، مع وضع مسار البروفايل في الأعلى.
```yaml
routes:
  - id: auth-service-uploads
    uri: http://auth-service:8086
    predicates:
      - Path=/uploads/profiles/** # محدد بدقة لخدمة الـ Auth

  - id: product-service
    uri: http://product-service:8088
    predicates:
      - Path=..., /uploads/products/** # محدد بدقة لخدمة الـ Product
```

### ب- إصلاح عملية البناء (Build Process):
تم تنبيه النظام بضرورة تشغيل `mvn clean package` قبل بناء حاوية Docker لضمان تحديث ملف الـ JAR بالإعدادات الجديدة.

### ج- توحيد جلب الصور في الواجهة الأمامية:
تم إنشاء دالة `getImageUrl` في `lib/utils.ts` لضمان أن كل صورة تبدأ بـ `/uploads/` يتم تحويلها تلقائياً لرابط API Gateway الكامل.

### د- تعديل `AuthContext`:
بدلاً من تخزين المسار النسبي، تم تعديل الـ `AuthContext` ليقوم بتحويل الرابط فور تسجيل الدخول:
```typescript
profilePicture: data.profilePicture 
  ? `${AUTH_URL}${data.profilePicture}` 
  : undefined
```

---

## 4. كيفية التحقق (Verification)
يمكن التأكد من الحل دائماً باستخدام هذا الأمر في الـ Terminal:
```bash
curl -I http://localhost:8000/uploads/profiles/your-image-name.jpg
```
إذا كانت النتيجة `HTTP/1.1 200 OK` فهذا يعني أن المسار والخدمة والصلاحيات تعمل بشكل سليم.
