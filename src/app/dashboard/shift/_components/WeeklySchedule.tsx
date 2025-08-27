'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';
import { Button } from '~/app/_components/ui/button';

import { ScheduleCard } from './ScheduleCard';

interface WeeklyScheduleProps {
  houseId: string;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DAYS_OF_WEEK = [
  { id: 0, name: 'ראשון', shortName: 'א' },
  { id: 1, name: 'שני', shortName: 'ב' },
  { id: 2, name: 'שלישי', shortName: 'ג' },
  { id: 3, name: 'רביעי', shortName: 'ד' },
  { id: 4, name: 'חמישי', shortName: 'ה' },
  { id: 5, name: 'שישי', shortName: 'ו' },
  { id: 6, name: 'שבת', shortName: 'ש' },
];

export function WeeklySchedule({ houseId, selectedDate, onDateChange }: WeeklyScheduleProps) {
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data: weeklySchedule } = api.sigalit.getWeeklySchedule.useQuery({
    houseId,
  });

  const { data: oneTimeOverrides } = api.sigalit.getOneTimeOverrides.useQuery({
    houseId,
    startDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 7),
    endDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 7),
  });

  const getActivitiesForDay = (dayOfWeek: number) => {
    const regularActivities = weeklySchedule?.filter(activity => activity.dayOfWeek === dayOfWeek) || [];
    
    // Get overrides for the next 7 days starting from today
    const today = new Date();
    const overrides = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() === dayOfWeek) {
        const dayOverrides = oneTimeOverrides?.filter(override => {
          const overrideDate = new Date(override.date);
          return overrideDate.toDateString() === date.toDateString();
        }) ?? [];
        overrides.push(...dayOverrides);
      }
    }

    return { regularActivities, overrides };
  };

  const getDayLabel = (dayOfWeek: number) => {
    const day = DAYS_OF_WEEK.find(d => d.id === dayOfWeek);
    return day ? day.name : '';
  };



  const handleAddActivity = (dayOfWeek: number) => {
    setSelectedDay(dayOfWeek);
    setIsAddingActivity(true);
  };

  const handleAddOneTimeChange = (dayOfWeek: number) => {
    // Calculate the next occurrence of this day
    const today = new Date();
    const daysUntilNext = (dayOfWeek - today.getDay() + 7) % 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);
    
    onDateChange(nextDate);
    // TODO: Open override form
  };

  return (
    <div className="space-y-4">
      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map((day) => {
                  const { regularActivities, overrides } = getActivitiesForDay(day.id);
        const hasOverrides = (overrides?.length ?? 0) > 0;
        
        return (
          <div key={day.id} className="space-y-2">
            {/* Day Header */}
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {day.shortName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {day.name}
              </div>
            </div>

            {/* Activities */}
            <div className="space-y-2">
              {(regularActivities?.length ?? 0) > 0 ? (
                regularActivities?.map((activity) => (
                  <ScheduleCard
                    key={activity.id}
                    activity={activity}
                    isOverride={false}
                    onEdit={() => {/* TODO: Edit activity */}}
                    onDelete={() => {/* TODO: Delete activity */}}
                  />
                ))
              ) : (
                <div className="text-xs text-gray-400 dark:text-gray-600 text-center py-2">
                  אין פעילויות
                </div>
              )}

              {/* Overrides */}
              {hasOverrides && (
                <div className="space-y-2">
                  {overrides?.map((override) => (
                    <ScheduleCard
                      key={override.id}
                      activity={override}
                      isOverride={true}
                      onEdit={() => {/* TODO: Edit override */}}
                      onDelete={() => {/* TODO: Delete override */}}
                    />
                  ))}
                </div>
              )}

              {/* Override Status */}
              {!hasOverrides && (regularActivities?.length ?? 0) > 0 && (
                <div className="text-xs text-gray-400 dark:text-gray-600 text-center py-1">
                  אין שינויים חד פעמיים קרובים
                </div>
              )}
            </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => handleAddActivity(day.id)}
                  className="w-full text-xs py-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  + פעילויות
                </Button>
                
                <Button
                  onClick={() => handleAddOneTimeChange(day.id)}
                  className="w-full text-xs py-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  הוסף שינוי חד פעמי
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Activity Modal (TODO) */}
      {isAddingActivity && selectedDay !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              הוסף פעילות ליום {getDayLabel(selectedDay)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              טופס הוספת פעילות יוצג כאן
            </p>
            <div className="flex space-x-2 space-x-reverse">
              <Button
                onClick={() => setIsAddingActivity(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                ביטול
              </Button>
              <Button
                onClick={() => {
                  // TODO: Save activity
                  setIsAddingActivity(false);
                }}
                className="bg-sigalit-500 hover:bg-sigalit-600 text-white"
              >
                שמור
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
