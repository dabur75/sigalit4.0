'use client';

import { api } from '~/trpc/react';
import { Button } from '~/app/_components/ui/button';

interface ShiftInstructorsProps {
  houseId: string;
  selectedDate: Date;
}

export function ShiftInstructors({ houseId, selectedDate }: ShiftInstructorsProps) {
  const { data: instructors } = api.sigalit.getShiftInstructors.useQuery({
    houseId,
    date: selectedDate,
  });

  return (
    <div className="space-y-4">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">תאריך:</span>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
          >
            יום קודם ←
          </Button>
          <Button
            size="sm"
            className="bg-sigalit-500 hover:bg-sigalit-600 text-white text-xs"
          >
            היום
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
          >
            מחר →
          </Button>
        </div>
      </div>

      {/* Instructors List */}
      {instructors && instructors.length > 0 ? (
        <div className="space-y-3">
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {instructor.user.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {instructor.shiftType === 'MORNING' ? 'בוקר' :
                     instructor.shiftType === 'AFTERNOON' ? 'צהריים' :
                     instructor.shiftType === 'EVENING' ? 'ערב' : 'לילה'}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(instructor.date).toLocaleDateString('he-IL')}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          אין מדריכים במשמרת היום
        </div>
      )}

      {/* Add One-time Activity Button */}
      <Button
        className="w-full bg-green-500 hover:bg-green-600 text-white"
      >
        + הוסף פעילות חד-פעמית
      </Button>
    </div>
  );
}
