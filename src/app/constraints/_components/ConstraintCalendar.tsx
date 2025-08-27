'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '~/trpc/react';
import { Button } from '~/app/_components/ui/button';
import { Card } from '~/app/_components/ui/card';
import { Input } from '~/app/_components/ui/input';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isConstrainted: boolean;
  isPast: boolean;
}

export function ConstraintCalendar() {
  const { data: session } = useSession();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [constraintReason, setConstraintReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState<Date | null>(null);

  const currentDate = new Date();
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();

  // Fetch existing constraints for the selected month
  const { data: constraints, refetch } = api.scheduling.getMonthlyConstraints.useQuery({
    month: month + 1, // API expects 1-12
    year: year,
    houseId: session?.user?.houseId || '',
    userId: session?.user?.id,
  });

  // Mutation to create constraint
  const createConstraint = api.scheduling.createMonthlyConstraint.useMutation({
    onSuccess: () => {
      refetch();
      setConstraintReason('');
      setShowReasonInput(null);
    },
  });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay()); // Start from Sunday

    const days: CalendarDay[] = [];
    const constraintDates = new Set(
      (constraints || [])
        .filter(c => c.type === 'UNAVAILABLE')
        .map(c => new Date(c.date).toDateString())
    );

    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      days.push({
        date: new Date(date),
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === currentDate.toDateString(),
        isConstrainted: constraintDates.has(date.toDateString()),
        isPast: date < currentDate && date.toDateString() !== currentDate.toDateString(),
      });
    }

    return days;
  }, [year, month, constraints, currentDate]);

  const handleDateClick = (day: CalendarDay) => {
    if (day.isPast || !day.isCurrentMonth) return;

    if (day.isConstrainted) {
      // TODO: Remove constraint (we'll implement this later)
      return;
    }

    // Show reason input for new constraint
    setShowReasonInput(day.date);
    setConstraintReason('');
  };

  const handleAddConstraint = () => {
    if (!showReasonInput || !session?.user?.houseId || !session?.user?.id) return;

    createConstraint.mutate({
      userId: session.user.id,
      houseId: session.user.houseId,
      date: showReasonInput,
      type: 'UNAVAILABLE',
      description: constraintReason || 'לא זמין',
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="px-3"
        >
          ←
        </Button>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h3>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="px-3"
        >
          →
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-0 border-b border-gray-200 bg-gray-50">
          {dayNames.map((dayName) => (
            <div
              key={dayName}
              className="p-3 text-center text-sm font-medium text-gray-700"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-0">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              disabled={day.isPast || !day.isCurrentMonth}
              className={`
                relative h-12 border-r border-b border-gray-100 p-2 text-sm transition-colors
                ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                ${day.isToday ? 'bg-purple-50 font-semibold text-purple-600' : ''}
                ${day.isConstrainted 
                  ? 'bg-red-100 text-red-800 font-medium' 
                  : day.isCurrentMonth && !day.isPast 
                    ? 'hover:bg-gray-50 cursor-pointer' 
                    : ''
                }
                ${day.isPast || !day.isCurrentMonth ? 'cursor-not-allowed opacity-50' : ''}
                disabled:cursor-not-allowed disabled:opacity-50
              `}
            >
              <span>{day.day}</span>
              {day.isConstrainted && (
                <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-red-500"></div>
              )}
              {day.isToday && (
                <div className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-purple-600"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-purple-100 border border-purple-300"></div>
          <span>היום</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-red-100 border border-red-300"></div>
          <span>לא זמין</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-gray-100 border border-gray-300"></div>
          <span>זמין</span>
        </div>
      </div>

      {/* Reason Input Modal */}
      {showReasonInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="mx-4 w-full max-w-md p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              סימון אילוץ ל-{showReasonInput.toLocaleDateString('he-IL')}
            </h3>
            
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                סיבה (אופציונלי)
              </label>
              <Input
                id="reason"
                type="text"
                placeholder="למשל: בדיקות רפואיות, אירוע משפחתי..."
                value={constraintReason}
                onChange={(e) => setConstraintReason(e.target.value)}
                className="w-full"
                dir="rtl"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowReasonInput(null)}
                disabled={createConstraint.isPending}
              >
                ביטול
              </Button>
              <Button
                onClick={handleAddConstraint}
                disabled={createConstraint.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {createConstraint.isPending ? 'שומר...' : 'סמן כלא זמין'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 rounded-md bg-blue-50 border border-blue-200 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400">💡</span>
          </div>
          <div className="mr-3">
            <h3 className="text-sm font-medium text-blue-800">
              איך זה עובד?
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>לחץ על תאריך כדי לסמן אותו כלא זמין</li>
                <li>ימים אדומים הם ימים בהם אתה לא זמין</li>
                <li>לא ניתן לסמן תאריכים שעברו</li>
                <li>האילוצים ישפיעו על השיבוץ החודשי</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}