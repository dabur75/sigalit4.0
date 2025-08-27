# Sigalit - מערכת ניהול שיבוצים

מערכת מתקדמת לניהול שיבוצים, מדריכים ולוח שנה עם תמיכה מלאה בעברית ו-RTL.

## ⚠️ **חשוב: מדריך הפעלה לסשן חדש**

**לפני שתתחיל לעבוד על הפרויקט, חובה לקרוא את:**
- [`SESSION_STARTUP.md`](./SESSION_STARTUP.md) - מדריך הפעלה לסשן חדש
- [`PROJECT.md`](./PROJECT.md) - סטטוס הפרויקט הנוכחי
- [`tasks/README.md`](./tasks/README.md) - סטטוס משימות

**אין להתחיל פיתוח ללא קריאת המדריכים הללו!**

## 🚀 תכונות המערכת

- **ניהול מדריכים ורכזים** - מערכת ניהול משתמשים מתקדמת
- **לוח שנה חכם** - תמיכה בלוח השנה הישראלי (שישי-שבת)
- **ניהול שיבוצים** - יצירה ועריכה של שיבוצים
- **ניהול אילוצים** - הגדרת זמינות והעדפות
- **אימות מתקדם** - NextAuth.js עם תמיכה ב-Discord
- **ממשק עברי** - תמיכה מלאה ב-RTL ועברית
- **עיצוב מודרני** - Tailwind CSS עם תמיכה במצב כהה

## 🛠️ טכנולוגיות

- **Frontend**: Next.js 14+, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: tRPC, Prisma
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Deployment**: Docker (אופציונלי)

## 📋 דרישות מערכת

- Node.js 18+ 
- PostgreSQL 12+
- npm או yarn

## 🚀 התקנה והפעלה

### 1. שכפול הפרויקט

```bash
git clone <repository-url>
cd sigalit-new
```

### 2. התקנת תלויות

```bash
npm install
```

### 3. הגדרת משתני סביבה

צור קובץ `.env` בתיקיית הפרויקט:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sigalit_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (configure as needed)
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"
```

### 4. הגדרת מסד הנתונים

```bash
# יצירת מסד הנתונים
npx prisma db push

# או שימוש במיגרציות
npx prisma migrate dev --name init
```

### 5. הפעלת השרת

```bash
npm run dev
```

המערכת תהיה זמינה בכתובת: http://localhost:3000

## 🗄️ מבנה מסד הנתונים

### טבלאות עיקריות

- **Users** - משתמשים (מדריכים, רכזים, מנהלים)
- **Houses** - בתים/מרכזים
- **Shifts** - שיבוצים
- **Constraints** - אילוצים וזמינות

### מודלים

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  role      UserRole
  email     String   @unique
  phone     String?
  isActive  Boolean  @default(true)
  houseId   String?
  // ... NextAuth fields
}

model Shift {
  id       String   @id @default(cuid())
  date     DateTime
  guideId  String
  role     String
  type     ShiftType
  // ... relations
}
```

## 🔐 אימות והרשאות

המערכת משתמשת ב-NextAuth.js עם:

- **Discord OAuth** - התחברות עם Discord
- **Email Authentication** - התחברות עם אימייל
- **Role-based Access Control** - הרשאות מבוססות תפקיד

### תפקידים

- **GUIDE** - מדריך (גישה מוגבלת)
- **COORDINATOR** - רכז (גישה מורחבת)
- **ADMIN** - מנהל (גישה מלאה)

## 🎨 עיצוב וממשק

### תמיכה ב-RTL

- תמיכה מלאה בעברית ו-RTL
- פונט Heebo מ-Google Fonts
- עיצוב מותאם לממשק עברי

### צבעים

- **Purple** - צבע ראשי (Sigalit)
- **Gold** - צבע משני
- **Dark Mode** - תמיכה במצב כהה

## 📱 תכונות נוספות

- **Mobile Responsive** - תמיכה מלאה במובייל
- **Real-time Updates** - עדכונים בזמן אמת
- **Calendar Integration** - אינטגרציה עם לוח שנה
- **Export/Import** - ייצוא וייבוא נתונים

## 🧪 בדיקות

```bash
# בדיקת TypeScript
npm run typecheck

# בדיקת ESLint
npm run lint

# בדיקת Prettier
npm run format:check
```

## 🚀 פריסה

### Docker

```bash
# בניית Image
docker build -t sigalit .

# הפעלה
docker run -p 3000:3000 sigalit
```

### Vercel

```bash
npm install -g vercel
vercel --prod
```

## 📚 תיעוד נוסף

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [tRPC Documentation](https://trpc.io/docs)

## 🤝 תרומה לפרויקט

1. Fork הפרויקט
2. צור branch חדש (`git checkout -b feature/amazing-feature`)
3. Commit השינויים (`git commit -m 'Add amazing feature'`)
4. Push ל-branch (`git push origin feature/amazing-feature`)
5. פתח Pull Request

## 📄 רישיון

פרויקט זה מוגן תחת רישיון MIT.

## 📞 תמיכה

לשאלות ותמיכה:
- פתח Issue ב-GitHub
- פנה לצוות הפיתוח

---

**Sigalit Team** - מערכת ניהול שיבוצים מתקדמת © 2024
