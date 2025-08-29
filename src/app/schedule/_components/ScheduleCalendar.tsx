'use client';

import { useState, useMemo } from 'react';
import { AssignmentRole } from '@prisma/client';
import { api } from '~/trpc/react';
import { Card } from '~/app/_components/ui/card';
import { Button } from '~/app/_components/ui/button';

interface ScheduleCalendarProps {
  schedule: any;
  assignments: any[];
  selectedDay: Date | null;
  onDaySelect: (date: Date) => void;
  onAssignmentSuccess: () => void;
  currentMonth: number;
  currentYear: number;
}

export default function ScheduleCalendar({
  schedule,
  assignments,
  selectedDay,
  onDaySelect,
  onAssignmentSuccess,
  currentMonth,
  currentYear,
}: ScheduleCalendarProps) {
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [dragOverRole, setDragOverRole] = useState<AssignmentRole | null>(null);

  const createAssignmentMutation = api.scheduling.createAssignment.useMutation({
    onSuccess: () => {
      onAssignmentSuccess();
    },
    onError: (error) => {
      alert(`שגיאה בשיבוץ: ${error.message}`);
    },
  });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const startDate = new Date(firstDay);
    
    // Adjust for Hebrew calendar (Sunday = 0)
    const dayOfWeek = firstDay.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks (42 days) to ensure complete calendar
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentMonth, currentYear]);

  // Get assignments for a specific day
  const getAssignmentsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return assignments.filter(assignment => 
      assignment.date.toISOString().split('T')[0] === dateStr
    );
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, date: Date, role: AssignmentRole) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverDay(date.toISOString().split('T')[0]);
    setDragOverRole(role);
  };

  const handleDragLeave = () => {
    setDragOverDay(null);
    setDragOverRole(null);
  };

  // Handle drop
  const handleDrop = async (e: React.DragEvent, date: Date, role: AssignmentRole) => {
    e.preventDefault();
    setDragOverDay(null);
    setDragOverRole(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { guideId, guideName } = data;

      if (!guideId) {
        alert('שגיאה: מידע המדריך לא תקין');
        return;
      }

      // Check if guide already assigned for this day and role
      const dayAssignments = getAssignmentsForDay(date);
      const existingAssignment = dayAssignments.find(a => 
        a.guideId === guideId && a.role === role
      );

      if (existingAssignment) {
        alert(`${guideName} כבר משובץ למשמרת ${role === AssignmentRole.REGULAR ? 'רגילה' : 'חפיפה'} ביום זה`);
        return;
      }

      // Create the assignment
      await createAssignmentMutation.mutateAsync({
        scheduleId: schedule.id,
        guideId,
        date,
        role,
        shiftType: 'WEEKDAY', // Default, can be enhanced later
        isManual: true,
        isLocked: false,
      });

    } catch (error) {
      console.error('Error parsing drag data:', error);
      alert('שגיאה בעיבוד הנתונים');
    }
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    onDaySelect(date);
  };

  // Check if day is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth - 1;
  };

  // Check if day is selected
  const isSelected = (date: Date) => {
    if (!selectedDay) return false;
    return date.toDateString() === selectedDay.toDateString();
  };

  // Check if day is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Render assignment slot
  const renderAssignmentSlot = (date: Date, role: AssignmentRole, label: string) => {
    const dayAssignments = getAssignmentsForDay(date);
    const assignment = dayAssignments.find(a => a.role === role);
    const dateStr = date.toISOString().split('T')[0];
    
    const isDropZone = dragOverDay === dateStr && dragOverRole === role;
    
    return (
      <div
        className={`
          h-8 border rounded text-xs flex items-center justify-center
          transition-all duration-200 cursor-pointer
          ${assignment 
            ? 'bg-blue-100 border-blue-300 text-blue-800' 
            : 'bg-gray-50 border-gray-200 text-gray-500'
          }
          ${isDropZone 
            ? 'bg-green-100 border-green-400 border-2' 
            : ''
          }
          hover:bg-gray-100
        `}
        onDragOver={(e) => handleDragOver(e, date, role)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, date, role)}
        title={assignment ? `${assignment.guide.name} - ${label}` : `${label} - פנוי`}
      >
        {assignment ? (
          <span className="truncate px-1">
            {assignment.guide.name}
          </span>
        ) : (
          <span>○</span>
        )}
      </div>
    );
  };

  const hebrewDays = ['א\'', 'ב\'', 'ג\'', 'ד\'', 'ה\'', 'ו\'', 'ש\''];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          לוח שיבוץ - {new Intl.DateTimeFormat('he-IL', { 
            month: 'long', 
            year: 'numeric' 
          }).format(new Date(currentYear, currentMonth - 1))}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onAssignmentSuccess}
          className="text-xs"
        >
          רענון
        </Button>
      </div>

      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {hebrewDays.map((day) => (
          <div key={day} className="text-center font-medium text-gray-700 py-2 text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const dayAssignments = getAssignmentsForDay(date);
          const isCurrentMonthDay = isCurrentMonth(date);
          const isSelectedDay = isSelected(date);
          const isTodayDay = isToday(date);
          
          return (
            <div
              key={index}
              className={`
                border rounded-md p-2 min-h-[120px] cursor-pointer
                transition-all duration-200
                ${isCurrentMonthDay 
                  ? 'bg-white border-gray-200 hover:bg-gray-50' 
                  : 'bg-gray-50 border-gray-100 text-gray-400'
                }
                ${isSelectedDay 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : ''
                }
                ${isTodayDay 
                  ? 'border-blue-300 border-2' 
                  : ''
                }
              `}
              onClick={() => handleDayClick(date)}
            >
              {/* Date Number */}
              <div className={`
                text-center text-sm font-medium mb-2
                ${!isCurrentMonthDay ? 'text-gray-400' : ''}
                ${isTodayDay ? 'text-blue-600' : ''}
              `}>
                {date.getDate()}
              </div>

              {/* Assignment Slots */}
              <div className="space-y-1">
                {/* Regular Shift */}
                {renderAssignmentSlot(date, AssignmentRole.REGULAR, 'רגיל')}
                
                {/* Overlap Shift */}
                {renderAssignmentSlot(date, AssignmentRole.BACKUP, 'חפיפה')}
              </div>

              {/* Assignment Count Indicator */}
              {dayAssignments.length > 0 && (
                <div className="text-center mt-1">
                  <span className="text-xs text-green-600 font-medium">
                    {dayAssignments.length}/2
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-600 flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
          <span>משובץ</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
          <span>פנוי</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 border-2 border-green-400 rounded"></div>
          <span>אזור שחרור</span>
        </div>
      </div>

      {/* Loading State */}
      {createAssignmentMutation.isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">משבץ...</div>
          </div>
        </div>
      )}
    </Card>
  );
}