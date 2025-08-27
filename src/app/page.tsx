import Link from "next/link";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gradient-to-br from-sigalit-50 to-sigalit-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-sigalit-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-gradient-to-br from-sigalit-500 to-sigalit-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">ס</span>
                </div>
                <h1 className="text-2xl font-bold text-sigalit-900 dark:text-white">
                  Sigalit
                </h1>
              </div>
              
              <nav className="flex items-center space-x-6 space-x-reverse">
                {session?.user ? (
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      שלום, {session.user.name ?? session.user.email}
                    </span>
                    <Link
                      href="/api/auth/signout"
                      className="px-4 py-2 bg-sigalit-500 text-white rounded-lg hover:bg-sigalit-600 transition-colors"
                    >
                      התנתק
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="px-6 py-2 bg-gradient-to-r from-sigalit-500 to-sigalit-600 text-white rounded-lg hover:from-sigalit-600 hover:to-sigalit-700 transition-all"
                  >
                    התחבר
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-5xl font-bold text-sigalit-900 dark:text-white mb-6">
              מערכת ניהול שיבוצים מתקדמת
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              ניהול יעיל של מדריכים, שיבוצים ולוח שנה עם תמיכה מלאה בעברית ו-RTL
            </p>
            
            {!session?.user && (
              <div className="flex justify-center space-x-4 space-x-reverse">
                <Link
                  href="/auth/signin"
                  className="px-8 py-3 bg-gradient-to-r from-sigalit-500 to-sigalit-600 text-white rounded-lg hover:from-sigalit-600 hover:to-sigalit-700 transition-all text-lg font-semibold"
                >
                  התחל עכשיו
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-3 border-2 border-sigalit-500 text-sigalit-500 dark:text-sigalit-400 rounded-lg hover:bg-sigalit-50 dark:hover:bg-sigalit-900/20 transition-all text-lg font-semibold"
                >
                  למידע נוסף
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white/50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center text-sigalit-900 dark:text-white mb-12">
              תכונות המערכת
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-sigalit-200 dark:border-gray-700">
                <div className="w-16 h-16 bg-gradient-to-br from-sigalit-500 to-sigalit-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl text-white">👥</span>
                </div>
                <h4 className="text-xl font-semibold text-center text-sigalit-900 dark:text-white mb-2">
                  ניהול מדריכים
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  ניהול יעיל של מדריכים ורכזים עם תמיכה בתפקידים שונים
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-sigalit-200 dark:border-gray-700">
                <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl text-white">📅</span>
                </div>
                <h4 className="text-xl font-semibold text-center text-sigalit-900 dark:text-white mb-2">
                  לוח שנה חכם
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  לוח שנה מתקדם עם תמיכה בלוח השנה הישראלי
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-sigalit-200 dark:border-gray-700">
                <div className="w-16 h-16 bg-gradient-to-br from-sigalit-500 to-gold-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl text-white">⚡</span>
                </div>
                <h4 className="text-xl font-semibold text-center text-sigalit-900 dark:text-white mb-2">
                  עדכונים בזמן אמת
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  עדכונים מיידיים על שינויים בשיבוצים והתראות
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview for Logged In Users */}
        {session?.user && (
          <section className="py-20">
            <div className="container mx-auto px-4">
              <h3 className="text-3xl font-bold text-center text-sigalit-900 dark:text-white mb-12">
                לוח הבקרה שלך
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-sigalit-200 dark:border-gray-700">
                  <h4 className="text-xl font-semibold text-sigalit-900 dark:text-white mb-4">
                    שיבוצים קרובים
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    אין שיבוצים קרובים
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-sigalit-200 dark:border-gray-700">
                  <h4 className="text-xl font-semibold text-sigalit-900 dark:text-white mb-4">
                    הודעות חדשות
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    אין הודעות חדשות
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-sigalit-200 dark:border-gray-700">
                  <h4 className="text-xl font-semibold text-sigalit-900 dark:text-white mb-4">
                    פעולות מהירות
                  </h4>
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      className="block w-full text-center py-2 bg-sigalit-100 dark:bg-sigalit-900/30 text-sigalit-700 dark:text-sigalit-300 rounded-lg hover:bg-sigalit-200 dark:hover:bg-sigalit-900/50 transition-colors"
                    >
                      לוח הבקרה
                    </Link>
                    <Link
                      href="/shifts"
                      className="block w-full text-center py-2 bg-sigalit-100 dark:bg-sigalit-900/30 text-sigalit-700 dark:text-sigalit-300 rounded-lg hover:bg-sigalit-200 dark:hover:bg-sigalit-900/50 transition-colors"
                    >
                      צפה בשיבוצים
                    </Link>
                    <Link
                      href="/calendar"
                      className="block w-full text-center py-2 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300 rounded-lg hover:bg-gold-200 dark:hover:bg-gold-900/50 transition-colors"
                    >
                      לוח שנה
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="bg-sigalit-900 dark:bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-sigalit-500 to-sigalit-600 rounded-full flex items-center justify-center">
                <span className="text-lg text-white font-bold">ס</span>
              </div>
              <span className="text-xl font-bold">Sigalit</span>
            </div>
            <p className="text-gray-300">
              מערכת ניהול שיבוצים מתקדמת © 2024
            </p>
          </div>
        </footer>
      </main>
    </HydrateClient>
  );
}
