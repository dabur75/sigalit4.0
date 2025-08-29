// @ts-nocheck
'use client';

import { useMemo } from 'react';
import { api } from '~/trpc/react';
import { cn } from '~/lib/utils';
import { Badge } from '~/app/_components/ui/badge';
import { Alert, AlertDescription } from '~/app/_components/ui/alert';
import { Star, Info } from 'lucide-react';

interface Props {
  guideId: string;
  selectedDates: Date[];
  onDateClick: (date: Date) => void;
  onConstraintRemove: (constraintId: string) => void;
  isRangeMode: boolean;
  rangeStart: Date | null;
  currentMonth: number;
  currentYear: number;
  houseId: string;
}

export function InteractiveConstraintCalendar({ 
  guideId, 
  selectedDates, 
  onDateClick, 
  onConstraintRemove,
  isRangeMode, 
  rangeStart,
  currentMonth,
  currentYear,
  houseId 
}: Props) {
  const { data: constraints = [], isLoading } = api.scheduling.getMonthlyConstraints.useQuery({
    userId: guideId,
    month: currentMonth,
    year: currentYear,
    houseId: houseId,
  }, {
    enabled: !!guideId && !!houseId,
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const dayOfWeek = firstDay.getDay();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    return days;
  }, [currentMonth, currentYear]);

  const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();
  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth - 1;

  const hebrewDays = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-2">
        {hebrewDays.map((day) => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((date, index) => {
          const isToday = isSameDay(date, new Date());
          const existingConstraint = constraints.find(c => isSameDay(new Date(c.date), date));
          const isSelected = selectedDates.some(d => isSameDay(d, date));
          const isRangeStart = rangeStart && isSameDay(rangeStart, date);

          const handleCellClick = () => {
            if (existingConstraint) {
              onConstraintRemove(existingConstraint.id);
            } else {
              onDateClick(date);
            }
          };
          
          return (
            <div
              key={index}
              onClick={handleCellClick}
              className={cn(
                "h-24 rounded-lg transition-all duration-200 flex flex-col items-center justify-center p-2 text-sm cursor-pointer border",
                !isCurrentMonth(date) && "text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/20",
                isCurrentMonth(date) && "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800/50",
                isToday && "ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-950",
                existingConstraint && "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50",
                isSelected && "bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 ring-2 ring-blue-400",
                isRangeStart && "bg-yellow-100 dark:bg-yellow-900/50 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200",
                !existingConstraint && !isSelected && "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <div className="font-semibold">{date.getDate()}</div>
              {existingConstraint && (
                <div className="mt-1 text-center">
                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">אילוץ</Badge>
                  {existingConstraint.reason && <div className="text-xs mt-1 truncate max-w-[50px]" title={existingConstraint.reason}>{existingConstraint.reason}</div>}
                </div>
              )}
              {isSelected && <Star className="w-4 h-4 mt-1 text-blue-500" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
                {isRangeMode
                ? "מצב טווח: לחץ על תאריך התחלה וסיום לבחירת טווח. לחץ על אילוץ קיים להסרתו."
                : "מצב יום בודד: לחץ על תאריכים להוספה או הסרה. לחץ על אילוץ קיים להסרתו."
                }
            </AlertDescription>
        </Alert>
        <div className="flex items-center justify-end gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-100 border border-red-300"></div><span>אילוץ קיים</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-100 border border-blue-300"></div><span>נבחר</span></div>
            {isRangeMode && <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-100 border border-yellow-300"></div><span>תחילת טווח</span></div>}
        </div>
      </div>
    </div>
  );
}