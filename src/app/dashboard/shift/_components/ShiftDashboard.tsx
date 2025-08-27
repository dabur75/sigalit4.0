'use client';

import { useState } from 'react';
import { Card } from '~/app/_components/ui/card';
import { HouseSelector } from '../../_components/HouseSelector';
import { WeeklySchedule } from './WeeklySchedule';
import { ShiftTasks } from './ShiftTasks';
import { MedicalReferrals } from './MedicalReferrals';
import { ShiftInstructors } from './ShiftInstructors';
import { InternalMessages } from './InternalMessages';

interface ShiftDashboardProps {
  selectedHouseId: string | null;
  onHouseChange: (houseId: string | null) => void;
  userRole: string;
  userHouseId: string | null;
}

export function ShiftDashboard({ 
  selectedHouseId, 
  onHouseChange, 
  userRole, 
  userHouseId 
}: ShiftDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Set default house selection based on user role
  if (!selectedHouseId && userRole === 'GUIDE' && (userHouseId ?? false)) {
    onHouseChange(userHouseId);
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const getCurrentDateString = () => {
    return selectedDate.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (!selectedHouseId) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            בחירת בית
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            אנא בחר בית כדי לצפות במידע המשמרת
          </p>
          <HouseSelector 
            selectedHouseId={selectedHouseId}
            onHouseChange={onHouseChange}
            userRole={userRole}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* House Selector for Coordinators and Admins */}
      {(userRole === 'COORDINATOR' || userRole === 'ADMIN') && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            בחירת בית
          </h2>
          <HouseSelector 
            selectedHouseId={selectedHouseId}
            onHouseChange={onHouseChange}
            userRole={userRole}
          />
        </Card>
      )}

      {/* Date Selector */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            תאריך נבחר: {getCurrentDateString()}
          </h2>
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={() => {
                const prevDate = new Date(selectedDate);
                prevDate.setDate(prevDate.getDate() - 1);
                setSelectedDate(prevDate);
              }}
              className="px-3 py-2 bg-sigalit-100 hover:bg-sigalit-200 dark:bg-sigalit-900/30 dark:hover:bg-sigalit-900/50 text-sigalit-700 dark:text-sigalit-300 rounded-lg transition-colors"
            >
              יום קודם
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-2 bg-sigalit-500 hover:bg-sigalit-600 text-white rounded-lg transition-colors"
            >
              היום
            </button>
            <button
              onClick={() => {
                const nextDate = new Date(selectedDate);
                nextDate.setDate(nextDate.getDate() + 1);
                setSelectedDate(nextDate);
              }}
              className="px-3 py-2 bg-sigalit-100 hover:bg-sigalit-200 dark:bg-sigalit-900/30 dark:hover:bg-sigalit-900/50 text-sigalit-700 dark:text-sigalit-300 rounded-lg transition-colors"
            >
              מחר
            </button>
          </div>
        </div>
      </Card>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Weekly Schedule */}
          <Card className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                לו״ז שבועי
              </h3>
            <WeeklySchedule 
              houseId={selectedHouseId}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
          </Card>

          {/* Shift Tasks */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              משימות משמרת
            </h3>
            <ShiftTasks 
              houseId={selectedHouseId}
              selectedDate={selectedDate}
            />
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Medical Referrals */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              הפניות לרופא
            </h3>
            <MedicalReferrals 
              houseId={selectedHouseId}
              selectedDate={selectedDate}
            />
          </Card>

          {/* Shift Instructors */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              מדריכים במשמרת
            </h3>
            <ShiftInstructors 
              houseId={selectedHouseId}
              selectedDate={selectedDate}
            />
          </Card>

          {/* Internal Messages */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              הודעות פנימיות
            </h3>
            <InternalMessages 
              houseId={selectedHouseId}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
