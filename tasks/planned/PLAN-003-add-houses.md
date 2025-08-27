# תכנון: הוספת בתים למערכת Sigalit

## 🎯 **מטרת המשימה**
הוספת 2 בתים נפרדים למערכת: **בית דרור** ו**בית חבצלת**, עם הפרדה מלאה בין הבתים והרשאות מתאימות למשתמשים.

## 📋 **דרישות פונקציונליות**

### **הפרדה בין בתים:**
- כל בית הוא מערכת נפרדת לחלוטין
- אין ממשק או גישה בין הבתים
- כל בית מנהל את המשתמשים, השיבוצים והאילוצים שלו בלבד

### **הרשאות משתמשים:**
- **מדריכים**: רואים רק את הבית שלהם
- **רכזים**: רואים את 2 הבתים (גישה מלאה)
- **מנהלים**: גישה מלאה לכל המערכת

### **ממשק ניהול:**
- עמוד ניהול בתים למנהלים
- עמוד ניהול בתים לרכזים
- הפרדה ויזואלית ברורה בין הבתים

## 🗄️ **שינויים בבסיס הנתונים**

### **עדכון מודל House:**
```prisma
model House {
    id          String   @id @default(cuid())
    name        String   // שם הבית (בית דרור, בית חבצלת)
    code        String   @unique // קוד קצר (dor, chabatzelet)
    description String?  // תיאור הבית
    isActive    Boolean  @default(true)
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    
    users User[]
    shifts Shift[]
    
    @@index([name])
    @@index([code])
}
```

### **עדכון מודל Shift:**
```prisma
model Shift {
    id       String   @id @default(cuid())
    date     DateTime
    guideId  String
    houseId  String   // הוספת קשר לבית
    role     String
    type     ShiftType
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    
    guide    User     @relation(fields: [guideId], references: [id], onDelete: Cascade)
    house    House    @relation(fields: [houseId], references: [id], onDelete: Cascade)
    
    @@index([date])
    @@index([guideId])
    @@index([houseId])
    @@index([type])
}
```

### **עדכון מודל Constraint:**
```prisma
model Constraint {
    id          String   @id @default(cuid())
    userId      String
    houseId     String   // הוספת קשר לבית
    date        DateTime
    type        ConstraintType
    description String?
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    
    user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    house       House    @relation(fields: [houseId], references: [id], onDelete: Cascade)
    
    @@index([userId])
    @@index([houseId])
    @@index([date])
    @@index([type])
}
```

## 🔧 **שינויים בקוד**

### **1. עדכון סכמת בסיס הנתונים:**
- עדכון `schema.prisma`
- יצירת migration חדש
- עדכון נתוני seed

### **2. עדכון API Routes:**
- עדכון `sigalit.ts` router
- הוספת פונקציות לניהול בתים
- עדכון פונקציות קיימות לתמיכה בבתים

### **3. עדכון ממשק המשתמש:**
- עדכון Dashboard לתצוגה לפי בית
- הוספת עמוד ניהול בתים
- עדכון ניווט ותפריטים

### **4. עדכון לוגיקת הרשאות:**
- עדכון NextAuth middleware
- הוספת בדיקות הרשאה לפי בית
- עדכון Session interface

## 📊 **נתוני Seed חדשים**

### **בתים:**
```typescript
// בית דרור
{
    name: "בית דרור",
    code: "dor",
    description: "מרכז פעילות בית דרור",
    isActive: true
}

// בית חבצלת  
{
    name: "בית חבצלת",
    code: "chabatzelet",
    description: "מרכז פעילות בית חבצלת",
    isActive: true
}
```

### **משתמשים:**
- עדכון משתמשים קיימים לשיוך לבתים
- הוספת משתמשים חדשים לכל בית

## 🎨 **עיצוב הממשק**

### **צבעים לכל בית:**
- **בית דרור**: כחול (#3b82f6)
- **בית חבצלת**: ירוק (#10b981)

### **אלמנטים ויזואליים:**
- כותרות עם צבעי בית
- תגיות צבעוניות לזיהוי בית
- הפרדה ברורה בין בתים בדשבורד

## ⏱️ **זמן משוער:**
- **תכנון וניתוח**: 1 שעה ✅
- **עדכון סכמה**: 2 שעות
- **עדכון API**: 3 שעות  
- **עדכון ממשק**: 4 שעות
- **בדיקות ואינטגרציה**: 2 שעות
- **סה"כ**: 12 שעות

## 🚀 **שלבי ביצוע:**
1. ✅ תכנון מפורט (נוכחי)
2. 🔄 אישור התכנית
3. 🔄 עדכון סכמת בסיס הנתונים
4. 🔄 עדכון API routes
5. 🔄 עדכון ממשק המשתמש
6. 🔄 בדיקות ואינטגרציה
7. 🔄 תיעוד ועדכון PROJECT.md

## ⚠️ **הערות חשובות:**
- יש לשמור על הפרדה מלאה בין הבתים
- יש לוודא שהרשאות עובדות נכון
- יש לבדוק שהנתונים לא מתערבבים בין הבתים
- יש לעדכן את כל הפונקציות הקיימות לתמיכה בבתים

---
**מחבר**: AI Assistant  
**תאריך**: 24 באוגוסט 2025  
**סטטוס**: ממתין לאישור
