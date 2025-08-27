'use client';

import { Card } from '~/app/_components/ui/card';
import { Button } from '~/app/_components/ui/button';
import Link from 'next/link';

interface QuickActionsProps {
  userRole: string;
  selectedHouseId: string | null;
  userHouseId: string | null;
}

export function QuickActions({ userRole, selectedHouseId, userHouseId }: QuickActionsProps) {
  const actions = [
    {
      icon: '👥',
      title: 'ניהול צוות',
      description: 'ניהול חברי הצוות והרשאות',
      href: '/dashboard/crew',
      roles: ['ADMIN', 'COORDINATOR'],
      houseSpecific: false,
    },
    {
      icon: '👤',
      title: 'הוסף משתמש חדש',
      description: 'הוספת מדריך או רכז חדש',
      href: '/users/new',
      roles: ['ADMIN', 'COORDINATOR'],
      houseSpecific: true,
    },
    {
      icon: '🏠',
      title: 'ניהול בתים',
      description: 'ניהול מרכזים ובתים',
      href: '/houses',
      roles: ['ADMIN'],
      houseSpecific: false,
    },
    {
      icon: '📊',
      title: 'דוחות מערכת',
      description: 'דוחות וסטטיסטיקות',
      href: '/reports',
      roles: ['ADMIN', 'COORDINATOR'],
      houseSpecific: true,
    },
    {
      icon: '⚙️',
      title: 'הגדרות מערכת',
      description: 'הגדרות כלליות',
      href: '/settings',
      roles: ['ADMIN'],
      houseSpecific: false,
    },
    {
      icon: '📅',
      title: 'ניהול שיבוצים',
      description: 'תזמון וניהול שיבוצים',
      href: '/shifts',
      roles: ['ADMIN', 'COORDINATOR'],
      houseSpecific: true,
    },
    {
      icon: '🔄',
      title: 'עמוד משמרת',
      description: 'לו"ז שבועי, משימות והפניות',
      href: '/dashboard/shift',
      roles: ['ADMIN', 'COORDINATOR', 'GUIDE'],
      houseSpecific: true,
    },
    {
      icon: '🚫',
      title: 'ניהול אילוצים',
      description: 'זמינות ואילוצים',
      href: '/constraints',
      roles: ['ADMIN', 'COORDINATOR'],
      houseSpecific: true,
    },
  ];

  const filteredActions = actions.filter(action => 
    action.roles.includes(userRole) && 
    (!action.houseSpecific || (selectedHouseId ?? false) || userRole === 'ADMIN')
  );

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          פעולות מהירות
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          גישה מהירה למשימות נפוצות
        </p>
        
        <div className="space-y-3">
          {filteredActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto p-3 text-right"
              >
                <div className="flex items-center space-x-3 space-x-reverse w-full">
                  <span className="text-xl">{action.icon}</span>
                  <div className="flex-1 text-right">
                    <div className="font-medium text-gray-900">
                      {action.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          התראות
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          הודעות חדשות
        </p>
        
        <div className="space-y-3">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200 shadow-sm">
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="text-green-600">✅</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  שיבוץ חדש אושר
                </p>
                <p className="text-xs text-green-600">
                  השיבוץ שלך ליום שני אושר
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 shadow-sm">
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="text-amber-600">⚠️</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  עדכון זמינות
                </p>
                <p className="text-xs text-amber-600">
                  אנא עדכן את הזמינות שלך לשבוע הבא
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          סטטיסטיקות אישיות
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg shadow-sm">
            <span className="text-sm text-gray-600">שיבוצים החודש</span>
            <span className="text-lg font-bold text-purple-700">12</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg shadow-sm">
            <span className="text-sm text-gray-600">שעות עבודה</span>
            <span className="text-lg font-bold text-amber-700">48</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg shadow-sm">
            <span className="text-sm text-gray-600">בתים פעילים</span>
            <span className="text-lg font-bold text-emerald-700">
              {userRole === 'GUIDE' ? '1' : '2'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
