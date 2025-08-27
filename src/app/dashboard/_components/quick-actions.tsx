"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";
import Link from "next/link";

interface QuickActionsProps {
  userRole: string;
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const isAdmin = userRole === 'ADMIN';
  const isCoordinator = userRole === 'COORDINATOR';

  const getRoleBasedActions = () => {
    if (isAdmin) {
      return [
        { name: 'הוסף משתמש חדש', href: '/users/new', icon: '👤', color: 'bg-sigalit-500' },
        { name: 'ניהול בתים', href: '/houses', icon: '🏠', color: 'bg-gold-500' },
        { name: 'דוחות מערכת', href: '/reports', icon: '📊', color: 'bg-purple-500' },
        { name: 'הגדרות מערכת', href: '/settings', icon: '⚙️', color: 'bg-gray-500' },
      ];
    }
    
    if (isCoordinator) {
      return [
        { name: 'צור שיבוץ חדש', href: '/shifts/new', icon: '📅', color: 'bg-sigalit-500' },
        { name: 'ניהול מדריכים', href: '/users', icon: '👥', color: 'bg-gold-500' },
        { name: 'לוח שנה', href: '/calendar', icon: '🗓️', color: 'bg-purple-500' },
        { name: 'בקשות אישור', href: '/approvals', icon: '✅', color: 'bg-green-500' },
      ];
    }
    
    // Guide actions
    return [
      { name: 'הצג שיבוצים שלי', href: '/my-shifts', icon: '📋', color: 'bg-sigalit-500' },
      { name: 'דווח זמינות', href: '/availability', icon: '📝', color: 'bg-gold-500' },
      { name: 'לוח שנה אישי', href: '/my-calendar', icon: '🗓️', color: 'bg-purple-500' },
      { name: 'עדכן פרטים', href: '/profile', icon: '👤', color: 'bg-gray-500' },
    ];
  };

  const actions = getRoleBasedActions();

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-white dark:bg-gray-800 border-sigalit-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-sigalit-900 dark:text-white">
            פעולות מהירות
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            גישה מהירה למשימות נפוצות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actions.map((action) => (
              <Link key={action.name} href={action.href}>
                <Button 
                  variant="outline" 
                  className="w-full justify-start space-x-3 space-x-reverse border-sigalit-200 dark:border-gray-600 hover:bg-sigalit-50 dark:hover:bg-sigalit-900/20"
                >
                  <span className={`w-8 h-8 ${action.color} rounded-full flex items-center justify-center text-white text-sm`}>
                    {action.icon}
                  </span>
                  <span className="text-sigalit-900 dark:text-white">{action.name}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-white dark:bg-gray-800 border-sigalit-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-sigalit-900 dark:text-white">
            התראות
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            הודעות חדשות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                שיבוץ חדש אושר
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                השיבוץ שלך ליום שני אושר
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                עדכון זמינות
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                אנא עדכן את הזמינות שלך לשבוע הבא
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-white dark:bg-gray-800 border-sigalit-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-sigalit-900 dark:text-white">
            סטטיסטיקות אישיות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">שיבוצים החודש</span>
              <span className="font-semibold text-sigalit-900 dark:text-white">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">שעות עבודה</span>
              <span className="font-semibold text-sigalit-900 dark:text-white">48</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">בתים פעילים</span>
              <span className="font-semibold text-sigalit-900 dark:text-white">2</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
