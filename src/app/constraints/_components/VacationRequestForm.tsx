'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '~/trpc/react';
import { Button } from '~/app/_components/ui/button';
import { Card } from '~/app/_components/ui/card';
import { Input } from '~/app/_components/ui/input';

interface VacationRequest {
  id: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  createdAt: Date;
}

export function VacationRequestForm() {
  const { data: session } = useSession();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRole = session?.user?.role;
  const isGuide = userRole === 'GUIDE';

  // Fetch vacation requests
  const { data: vacationRequests, refetch } = api.scheduling.getVacationRequests.useQuery(
    { houseId: session?.user?.houseId || '', userId: session?.user?.id },
    { enabled: !!session?.user?.houseId && !!session?.user?.id }
  );

  // Create vacation request mutation
  const createVacationRequest = api.scheduling.createVacationRequest.useMutation({
    onSuccess: () => {
      refetch();
      setStartDate('');
      setEndDate('');
      setReason('');
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error('Error creating vacation request:', error);
      alert(`שגיאה ביצירת בקשת החופשה: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  // Cancel vacation request mutation
  const cancelVacationRequest = api.scheduling.cancelVacationRequest.useMutation({
    onSuccess: (data) => {
      refetch();
      alert(`בקשת החופשה בוטלה בהצלחה (${data.canceledDays} ימים)`);
    },
    onError: (error) => {
      console.error('Error canceling vacation request:', error);
      alert(`שגיאה בביטול בקשת החופשה: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || !session?.user?.id || !session?.user?.houseId) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      alert('תאריך התחלה חייב להיות לפני תאריך הסיום');
      return;
    }

    if (start < new Date()) {
      alert('לא ניתן להגיש בקשת חופשה לתאריכים שעברו');
      return;
    }

    setIsSubmitting(true);

    try {
      await createVacationRequest.mutateAsync({
        userId: session.user.id,
        houseId: session.user.houseId,
        startDate: start,
        endDate: end,
        reason: reason || undefined,
      });
      
    } catch (error) {
      // Error handling is done in the mutation onError callback
    }
  };

  const handleCancelVacation = async (request: any) => {
    if (!session?.user?.id) return;

    const confirmed = window.confirm(
      `האם אתה בטוח שברצונך לבטל את בקשת החופשה?\n` +
      `תאריכים: ${formatDateRange(request.startDate, request.endDate)}\n` +
      `פעולה זו אינה ניתנת לביטול.`
    );

    if (!confirmed) return;

    try {
      await cancelVacationRequest.mutateAsync({
        startDate: request.startDate,
        endDate: request.endDate,
        userId: session.user.id,
      });
    } catch (error) {
      // Error handling is done in the mutation onError callback
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'אושרה';
      case 'REJECTED': return 'נדחתה';
      default: return 'ממתינה לאישור';
    }
  };

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('he-IL');
    const endStr = end.toLocaleDateString('he-IL');
    return `${startStr} - ${endStr}`;
  };

  const calculateDays = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return diffDays;
  };

  // Group vacation constraints by continuous date ranges
  const groupVacationRequests = (constraints: any[]) => {
    if (!constraints?.length) return [];

    // Sort by date
    const sorted = constraints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const groups: any[] = [];
    let currentGroup: any = null;

    sorted.forEach((constraint) => {
      const currentDate = new Date(constraint.date);
      
      if (!currentGroup) {
        // Start new group
        currentGroup = {
          id: constraint.id,
          startDate: currentDate,
          endDate: currentDate,
          reason: constraint.description?.replace('חופשה: ', '') || 'חופשה',
          status: constraint.description?.includes('אושר') ? 'APPROVED' : 'PENDING',
          constraints: [constraint],
          createdAt: constraint.createdAt,
        };
      } else {
        // Check if this date continues the current group (next day)
        const prevDate = new Date(currentGroup.endDate);
        prevDate.setDate(prevDate.getDate() + 1);
        
        if (currentDate.getTime() === prevDate.getTime()) {
          // Continue current group
          currentGroup.endDate = currentDate;
          currentGroup.constraints.push(constraint);
        } else {
          // End current group and start new one
          groups.push(currentGroup);
          currentGroup = {
            id: constraint.id,
            startDate: currentDate,
            endDate: currentDate,
            reason: constraint.description?.replace('חופשה: ', '') || 'חופשה',
            status: constraint.description?.includes('אושר') ? 'APPROVED' : 'PENDING',
            constraints: [constraint],
            createdAt: constraint.createdAt,
          };
        }
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const vacationGroups = groupVacationRequests(vacationRequests || []);

  return (
    <div className="w-full space-y-6">
      {/* Existing Vacation Requests */}
      {vacationGroups && vacationGroups.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">
            בקשות חופשה קיימות
          </h3>
          <div className="space-y-3">
            {vacationGroups.map((request: any) => (
              <Card key={request.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900">
                        {formatDateRange(request.startDate, request.endDate)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({calculateDays(request.startDate, request.endDate)} ימים)
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    
                    {request.reason && request.reason !== 'חופשה' && (
                      <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      הוגשה: {new Date(request.createdAt).toLocaleDateString('he-IL')}
                      {request.status === 'APPROVED' && (
                        <span> • אושרה על ידי רכז</span>
                      )}
                    </p>
                  </div>
                  
                  {request.status === 'PENDING' && isGuide && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50 border-red-200"
                      onClick={() => handleCancelVacation(request)}
                      disabled={cancelVacationRequest.isPending}
                    >
                      {cancelVacationRequest.isPending ? 'מבטל...' : 'ביטול בקשה'}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* New Vacation Request Form */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-3">
          בקשת חופשה חדשה
        </h3>
        
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
                  תאריך התחלה *
                </label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
                  תאריך סיום *
                </label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  required
                  className="w-full"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                סיבה / הערות
              </label>
              <Input
                id="reason"
                type="text"
                placeholder="למשל: חופשה משפחתית, נסיעה לחו״ל..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full"
                dir="rtl"
              />
            </div>

            {/* Duration Display */}
            {startDate && endDate && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">משך החופשה:</span>{' '}
                  {calculateDays(new Date(startDate), new Date(endDate))} ימים
                  <span className="text-gray-500 mr-2">
                    ({new Date(startDate).toLocaleDateString('he-IL')} - {new Date(endDate).toLocaleDateString('he-IL')})
                  </span>
                </p>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !startDate || !endDate || createVacationRequest.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? 'שולח בקשה...' : 'שלח בקשת חופשה'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Information Box */}
      <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-amber-400">✈️</span>
          </div>
          <div className="mr-3">
            <h3 className="text-sm font-medium text-amber-800">
              חשוב לדעת על בקשות חופשה
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <ul className="list-disc list-inside space-y-1">
                <li>יש להגיש בקשות חופשה מראש ככל הניתן</li>
                {isGuide && <li>בקשות חופשה דורשות אישור רכז</li>}
                <li>חופשות מאושרות יחסמו אותך מהשיבוץ החודשי</li>
                <li>ניתן לבטל בקשה כל עוד היא לא אושרה</li>
                <li>לחופשות דחופות, צור קשר ישיר עם הרכז</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}