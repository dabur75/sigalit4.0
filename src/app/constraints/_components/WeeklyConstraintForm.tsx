'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '~/trpc/react';
import { Button } from '~/app/_components/ui/button';
import { Card } from '~/app/_components/ui/card';
import { Input } from '~/app/_components/ui/input';

interface DayConstraint {
  id?: string;
  dayOfWeek: number;
  isActive: boolean;
  reason: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED';
  approvedBy?: string;
}

export function WeeklyConstraintForm() {
  const { data: session } = useSession();
  const [selectedDays, setSelectedDays] = useState<Record<number, boolean>>({});
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRole = session?.user?.role;
  const isGuide = userRole === 'GUIDE';

  // Fetch existing weekly constraints
  const { data: weeklyConstraints, refetch } = api.scheduling.getWeeklyConstraints.useQuery(
    {
      userId: session?.user?.role === 'GUIDE' ? session.user.id : undefined,
      houseId: session?.user?.houseId || '',
    },
    { enabled: !!session?.user?.houseId }
  );

  // Create weekly constraint mutation
  const createWeeklyConstraint = api.scheduling.createWeeklyConstraint.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedDays({});
      setReasons({});
    },
  });

  // Update weekly constraint mutation  
  const updateWeeklyConstraint = api.scheduling.updateWeeklyConstraint.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const dayNames = [
    { name: 'ראשון', short: 'א' },
    { name: 'שני', short: 'ב' },
    { name: 'שלישי', short: 'ג' },
    { name: 'רביעי', short: 'ד' },
    { name: 'חמישי', short: 'ה' },
    { name: 'שישי', short: 'ו' },
    { name: 'שבת', short: 'ש' },
  ];

  // Get existing constraints by day
  const existingConstraints: Record<number, DayConstraint> = {};
  if (weeklyConstraints) {
    weeklyConstraints.forEach((constraint: any) => {
      existingConstraints[constraint.dayOfWeek] = {
        id: constraint.id,
        dayOfWeek: constraint.dayOfWeek,
        isActive: constraint.status === 'ACTIVE',
        reason: constraint.reason || '',
        status: constraint.status,
        approvedBy: constraint.approvedBy,
      };
    });
  }

  const handleDayToggle = (dayOfWeek: number) => {
    const existing = existingConstraints[dayOfWeek];
    
    if (existing && existing.id) {
      // Toggle existing constraint
      const newStatus = existing.isActive ? 'PAUSED' : 'ACTIVE';
      updateWeeklyConstraint.mutate({
        id: existing.id,
        status: newStatus as 'ACTIVE' | 'PAUSED',
      });
    } else {
      // Toggle selection for new constraint
      setSelectedDays(prev => ({
        ...prev,
        [dayOfWeek]: !prev[dayOfWeek],
      }));
    }
  };

  const handleReasonChange = (dayOfWeek: number, reason: string) => {
    setReasons(prev => ({
      ...prev,
      [dayOfWeek]: reason,
    }));
  };

  const handleSubmit = async () => {
    if (!session?.user?.id || !session?.user?.houseId) return;

    setIsSubmitting(true);
    
    try {
      const constraintsToCreate = Object.entries(selectedDays)
        .filter(([_, isSelected]) => isSelected)
        .map(([dayOfWeek]) => ({
          userId: session.user.id,
          dayOfWeek: parseInt(dayOfWeek),
          reason: reasons[parseInt(dayOfWeek)] || '',
          status: 'ACTIVE' as const,
        }));

      // Create constraints one by one (since we don't have batch create)
      for (const constraint of constraintsToCreate) {
        await createWeeklyConstraint.mutateAsync(constraint);
      }
    } catch (error) {
      console.error('Error creating weekly constraints:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string, isApproved: boolean) => {
    if (status === 'ACTIVE' && isApproved) return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'ACTIVE' && !isApproved) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (status === 'PAUSED') return 'bg-gray-100 text-gray-800 border-gray-200';
    if (status === 'DELETED') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusText = (status: string, isApproved: boolean) => {
    if (status === 'ACTIVE' && isApproved) return 'פעיל ואושר';
    if (status === 'ACTIVE' && !isApproved) return 'ממתין לאישור';
    if (status === 'PAUSED') return 'מושהה';
    if (status === 'DELETED') return 'נדחה';
    return 'לא ידוע';
  };

  return (
    <div className="w-full space-y-6">
      {/* Current Weekly Constraints */}
      {weeklyConstraints && weeklyConstraints.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">
            האילוצים השבועיים הנוכחיים
          </h3>
          <div className="space-y-2">
            {(weeklyConstraints || []).map((constraint: any) => (
              <Card key={constraint.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-gray-900">
                      {dayNames[constraint.dayOfWeek]?.name || 'יום לא ידוע'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(constraint.status, !!constraint.approvedBy)}`}>
                      {getStatusText(constraint.status, !!constraint.approvedBy)}
                    </span>
                  </div>
                  <div className="text-right">
                    {constraint.reason && (
                      <p className="text-sm text-gray-600 mb-1">{constraint.reason}</p>
                    )}
                    {isGuide && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDayToggle(constraint.dayOfWeek)}
                        disabled={updateWeeklyConstraint.isPending}
                      >
                        {constraint.status === 'ACTIVE' ? 'השהה' : 'הפעל'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add New Weekly Constraints */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-3">
          הוסף אילוצים שבועיים חדשים
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dayNames.map((day, index) => {
            const hasExisting = !!existingConstraints[index];
            const isSelected = selectedDays[index] || false;
            
            return (
              <Card 
                key={index} 
                className={`p-4 cursor-pointer transition-all ${
                  hasExisting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isSelected 
                      ? 'ring-2 ring-purple-500 bg-purple-50' 
                      : 'hover:bg-gray-50'
                }`}
                onClick={() => !hasExisting && handleDayToggle(index)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">{day.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{day.short}</span>
                    {hasExisting ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => !hasExisting && handleDayToggle(index)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </div>
                
                {hasExisting ? (
                  <p className="text-sm text-gray-500">כבר קיים אילוץ</p>
                ) : (
                  isSelected && (
                    <div>
                      <Input
                        placeholder="סיבה לאילוץ (אופציונלי)"
                        value={reasons[index] || ''}
                        onChange={(e) => handleReasonChange(index, e.target.value)}
                        className="text-sm"
                        dir="rtl"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )
                )}
              </Card>
            );
          })}
        </div>

        {Object.keys(selectedDays).some(day => selectedDays[parseInt(day)]) && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || createWeeklyConstraint.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? 'שולח בקשה...' : 'שלח בקשה לאישור'}
            </Button>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400">📋</span>
          </div>
          <div className="mr-3">
            <h3 className="text-sm font-medium text-blue-800">
              אילוצים שבועיים
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>אילוצים שבועיים חלים על כל שבוע בחודש</li>
                {isGuide && <li>בקשות אילוץ דורשות אישור רכז</li>}
                <li>ניתן להשהות אילוץ זמנית</li>
                <li>אילוצים פעילים ישפיעו על השיבוץ האוטומטי</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}