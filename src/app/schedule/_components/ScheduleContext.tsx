'use client';

import { useState } from 'react';
import { AssignmentRole } from '@prisma/client';
import { api } from '~/trpc/react';
import { Card } from '~/app/_components/ui/card';
import { Button } from '~/app/_components/ui/button';

interface ScheduleContextProps {
  selectedDay: Date | null;
  assignments: any[];
  availableGuides: any;
  houseId: string;
  scheduleId: string;
  onAssignmentSuccess: () => void;
}

export default function ScheduleContext({
  selectedDay,
  assignments,
  availableGuides,
  houseId,
  scheduleId,
  onAssignmentSuccess,
}: ScheduleContextProps) {
  const [loadingAssignment, setLoadingAssignment] = useState<string | null>(null);

  const createAssignmentMutation = api.scheduling.createAssignment.useMutation({
    onSuccess: () => {
      onAssignmentSuccess();
      setLoadingAssignment(null);
    },
    onError: (error) => {
      alert(`שגיאה בשיבוץ: ${error.message}`);
      setLoadingAssignment(null);
    },
  });

  const deleteAssignmentMutation = api.scheduling.deleteAssignment.useMutation({
    onSuccess: () => {
      onAssignmentSuccess();
    },
    onError: (error) => {
      alert(`שגיאה במחיקת שיבוץ: ${error.message}`);
    },
  });

  // Quick assign handler
  const handleQuickAssign = async (guideId: string, guideName: string, role: AssignmentRole) => {
    if (!selectedDay) return;
    
    setLoadingAssignment(`${guideId}-${role}`);
    
    try {
      await createAssignmentMutation.mutateAsync({
        scheduleId,
        guideId,
        date: selectedDay,
        role,
        shiftType: 'WEEKDAY',
        isManual: true,
        isLocked: false,
      });
    } catch (error) {
      console.error('Quick assign error:', error);
    }
  };

  // Remove assignment handler
  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('האם אתה בטוח שברצונך להסיר שיבוץ זה?')) return;
    
    try {
      await deleteAssignmentMutation.mutateAsync({ assignmentId });
    } catch (error) {
      console.error('Remove assignment error:', error);
    }
  };

  // Clear all assignments for the day
  const handleClearDay = async () => {
    if (!selectedDay || assignments.length === 0) return;
    if (!confirm(`האם אתה בטוח שברצונך לנקות את כל השיבוצים ליום ${selectedDay.toLocaleDateString('he-IL')}?`)) return;

    try {
      await Promise.all(
        assignments.map(assignment =>
          deleteAssignmentMutation.mutateAsync({ assignmentId: assignment.id })
        )
      );
    } catch (error) {
      console.error('Clear day error:', error);
    }
  };

  // Get available slots
  const getAvailableSlots = () => {
    const regularAssignment = assignments.find(a => a.role === AssignmentRole.REGULAR);
    const backupAssignment = assignments.find(a => a.role === AssignmentRole.BACKUP);
    
    return {
      regular: !regularAssignment,
      backup: !backupAssignment,
    };
  };

  if (!selectedDay) {
    return (
      <Card className="p-4 h-fit">
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="font-medium mb-2">בחר יום</h3>
          <p className="text-sm">
            לחץ על יום בלוח השנה כדי לראות פרטים ואפשרויות שיבוץ
          </p>
        </div>
      </Card>
    );
  }

  const availableSlots = getAvailableSlots();

  return (
    <Card className="p-4 space-y-4 h-fit">
      <div className="border-b pb-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          פרטי יום
        </h3>
        <p className="text-sm text-gray-600">
          {new Intl.DateTimeFormat('he-IL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).format(selectedDay)}
        </p>
      </div>

      {/* Current Assignments */}
      <div>
        <h4 className="font-medium text-gray-800 mb-2 text-sm">
          שיבוצים נוכחיים
        </h4>
        
        {assignments.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            <div className="text-2xl mb-1">📭</div>
            <p>אין שיבוצים ליום זה</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                <div className="flex-1">
                  <div className="font-medium text-blue-900 text-sm">
                    {assignment.guide.name}
                  </div>
                  <div className="text-xs text-blue-700">
                    {assignment.role === AssignmentRole.REGULAR ? 'משמרת רגילה' : 'משמרת חפיפה'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveAssignment(assignment.id)}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={deleteAssignmentMutation.isLoading}
                >
                  הסר
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {assignments.length > 0 && (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearDay}
            disabled={deleteAssignmentMutation.isLoading}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            נקה את היום
          </Button>
        </div>
      )}

      {/* Suggestions */}
      {availableGuides && availableGuides.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-2 text-sm">
            הצעות שיבוץ
          </h4>
          <p className="text-xs text-gray-600 mb-3">
            המדריכים המומלצים ביותר לפי הוגנות וזמינות
          </p>
          
          <div className="space-y-2">
            {availableGuides.filter(g => g.isAvailable).slice(0, 3).map((suggestion: any, index: number) => (
              <div key={suggestion.id} className="p-2 border border-gray-200 rounded bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`
                      text-xs px-1.5 py-0.5 rounded
                      ${index === 0 ? 'bg-green-100 text-green-800' : 
                        index === 1 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'}
                    `}>
                      #{index + 1}
                    </span>
                    <span className="font-medium text-sm">{suggestion.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    משמרות: {suggestion.monthlyAssignments || 0}/8
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 mb-2">
                  זמין ללא הגבלות
                </div>
                
                {/* Quick Assign Buttons */}
                <div className="flex gap-1">
                  {availableSlots.regular && (
                    <Button
                      size="sm"
                      onClick={() => handleQuickAssign(suggestion.id, suggestion.name, AssignmentRole.REGULAR)}
                      disabled={loadingAssignment === `${suggestion.id}-${AssignmentRole.REGULAR}`}
                      className="flex-1 text-xs h-7"
                    >
                      {loadingAssignment === `${suggestion.id}-${AssignmentRole.REGULAR}` ? 
                        'משבץ...' : 'רגיל'}
                    </Button>
                  )}
                  
                  {availableSlots.backup && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAssign(suggestion.id, suggestion.name, AssignmentRole.BACKUP)}
                      disabled={loadingAssignment === `${suggestion.id}-${AssignmentRole.BACKUP}`}
                      className="flex-1 text-xs h-7"
                    >
                      {loadingAssignment === `${suggestion.id}-${AssignmentRole.BACKUP}` ? 
                        'משבץ...' : 'חפיפה'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Info */}
      <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
        <div className="flex items-center justify-between">
          <span>משמרת רגילה:</span>
          <span className={availableSlots.regular ? 'text-red-600' : 'text-green-600'}>
            {availableSlots.regular ? 'פנוי' : 'משובץ'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>משמרת חפיפה:</span>
          <span className={availableSlots.backup ? 'text-red-600' : 'text-green-600'}>
            {availableSlots.backup ? 'פנוי' : 'משובץ'}
          </span>
        </div>
      </div>
    </Card>
  );
}