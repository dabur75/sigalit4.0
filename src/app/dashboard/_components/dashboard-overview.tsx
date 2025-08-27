"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";

export function DashboardOverview() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-sigalit-900 dark:text-white mb-6">
        סקירה כללית
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <Card className="bg-white dark:bg-gray-800 border-sigalit-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-sigalit-900 dark:text-white">
              משתמשים
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              סה&quot;כ במערכת
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sigalit-600 dark:text-sigalit-400">
              6
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span className="text-green-600">+2</span> החודש
            </div>
          </CardContent>
        </Card>

        {/* Active Shifts */}
        <Card className="bg-white dark:bg-gray-800 border-sigalit-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-sigalit-900 dark:text-white">
              שיבוצים פעילים
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              השבוע
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold-600 dark:text-gold-400">
              10
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span className="text-green-600">+3</span> מהשבוע שעבר
            </div>
          </CardContent>
        </Card>

        {/* Houses */}
        <Card className="bg-white dark:bg-gray-800 border-sigalit-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-sigalit-900 dark:text-white">
              בתים
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              מרכזים פעילים
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              2
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span className="text-green-600">+1</span> החודש
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="bg-white dark:bg-gray-800 border-sigalit-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-sigalit-900 dark:text-white">
              ממתין לאישור
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              בקשות חדשות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              0
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              הכל מאושר
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-sigalit-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-sigalit-900 dark:text-white">
              התפלגות מדריכים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">מדריכים</span>
                <span className="font-semibold text-sigalit-900 dark:text-white">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">רכזים</span>
                <span className="font-semibold text-sigalit-900 dark:text-white">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">מנהלים</span>
                <span className="font-semibold text-sigalit-900 dark:text-white">1</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-sigalit-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-sigalit-900 dark:text-white">
              שיבוצים לפי סוג
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">בוקר</span>
                <span className="font-semibold text-sigalit-900 dark:text-white">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">צהריים</span>
                <span className="font-semibold text-sigalit-900 dark:text-white">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">ערב</span>
                <span className="font-semibold text-sigalit-900 dark:text-white">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
