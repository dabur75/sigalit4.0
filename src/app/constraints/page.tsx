'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '~/app/_components/ui/button';
import { Card } from '~/app/_components/ui/card';
import { ConstraintCalendar } from './_components/ConstraintCalendar';
import { WeeklyConstraintForm } from './_components/WeeklyConstraintForm';
import { VacationRequestForm } from './_components/VacationRequestForm';
import { ConstraintApprovalList } from './_components/ConstraintApprovalList';
import { ConstraintSummary } from './_components/ConstraintSummary';

type TabType = 'onetime' | 'weekly' | 'vacation' | 'approvals';

export default function ConstraintsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('onetime');

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">נדרש אימות</h2>
            <p className="mt-2 text-gray-600">אנא התחבר כדי לצפות באילוצים</p>
          </div>
        </Card>
      </div>
    );
  }

  const userRole = session.user.role;
  const isCoordinatorOrAdmin = userRole === 'COORDINATOR' || userRole === 'ADMIN';

  const tabs = [
    { id: 'onetime', label: 'חד פעמי', icon: '📅' },
    { id: 'weekly', label: 'קבוע שבועי', icon: '🔄' },
    { id: 'vacation', label: 'חופשות', icon: '✈️' },
    ...(isCoordinatorOrAdmin ? [{ id: 'approvals' as TabType, label: 'אישורים', icon: '✅' }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            ניהול אילוצים
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {userRole === 'GUIDE' 
              ? 'ציין מתי אתה לא זמין לעבודה'
              : 'נהל אילוצים עבור המדריכים בבית'
            }
          </p>
        </div>

        {/* User Info */}
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{session.user.name}</h3>
                <p className="text-sm text-gray-600">
                  {userRole === 'GUIDE' && 'מדריך'}
                  {userRole === 'COORDINATOR' && 'רכז'}
                  {userRole === 'ADMIN' && 'מנהל'}
                  {session.user.houseId && ' • בית קבוצתי'}
                </p>
              </div>
              <div className="text-2xl">
                {userRole === 'GUIDE' && '👤'}
                {userRole === 'COORDINATOR' && '👨‍💼'}
                {userRole === 'ADMIN' && '👑'}
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Main Content */}
          <div className="flex-1">
            <Card className="overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-200 bg-white">
                <nav className="flex space-x-8 px-6" aria-label="Tabs" dir="ltr">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`
                        flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium
                        ${activeTab === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }
                      `}
                      dir="rtl"
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'onetime' && (
                  <div>
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                      אילוצים חד פעמיים
                    </h2>
                    <p className="mb-6 text-sm text-gray-600">
                      לחץ על תאריכים בלוח השנה כדי לסמן ימים בהם אתה לא זמין
                    </p>
                    <ConstraintCalendar />
                  </div>
                )}

                {activeTab === 'weekly' && (
                  <div>
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                      אילוצים שבועיים קבועים
                    </h2>
                    <p className="mb-6 text-sm text-gray-600">
                      בחר ימים בשבוע בהם אתה בדרך כלל לא זמין
                      {userRole === 'GUIDE' && ' (דורש אישור רכז)'}
                    </p>
                    <WeeklyConstraintForm />
                  </div>
                )}

                {activeTab === 'vacation' && (
                  <div>
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                      בקשות חופשה
                    </h2>
                    <p className="mb-6 text-sm text-gray-600">
                      הגש בקשה לחופשה עבור טווח תאריכים
                      {userRole === 'GUIDE' && ' (דורש אישור רכז)'}
                    </p>
                    <VacationRequestForm />
                  </div>
                )}

                {activeTab === 'approvals' && isCoordinatorOrAdmin && (
                  <div>
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                      בקשות לאישור
                    </h2>
                    <p className="mb-6 text-sm text-gray-600">
                      אשר או דחה בקשות אילוצים מהמדריכים
                    </p>
                    <ConstraintApprovalList />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar - Constraint Summary */}
          <div className="lg:w-80">
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                סיכום אילוצים
              </h3>
              <ConstraintSummary />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}