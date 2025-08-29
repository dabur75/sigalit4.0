// @ts-nocheck
'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '~/trpc/react';
import { Card } from '~/app/_components/ui/card';
import { Button } from '~/app/_components/ui/button';
import { Input } from '~/app/_components/ui/input';
import { Badge } from '~/app/_components/ui/badge';
import type { VacationRequestStatus } from '@prisma/client';
import { InlineAlert } from '~/app/_components/ui/alert';
import { Plane, Trash2, Send, Loader2, CalendarX2, Plus } from 'lucide-react';

interface Props {
  guideId: string;
  houseId: string;
}

export function VacationTab({ guideId, houseId }: Props) {
  const { data: session } = useSession();
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isCoordinatorOrAdmin = session?.user?.role === 'COORDINATOR' || session?.user?.role === 'ADMIN';

  const utils = api.useUtils();

  const handleMutationSuccess = async (message: string) => {
    await utils.scheduling.getVacationRequests.invalidate();
    await utils.scheduling.getMonthlyConstraints.invalidate();
    setSuccess(message);
    setError(null);
    setStartDate('');
    setEndDate('');
    setReason('');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleMutationError = (error: { message: string }, defaultMessage: string) => {
    setError(error.message ?? defaultMessage);
    setSuccess(null);
    setTimeout(() => setError(null), 5000);
  };

  const { data: vacationRequests = [], isLoading } = api.scheduling.getVacationRequests.useQuery(
    { userId: guideId, houseId: houseId },
    { enabled: !!guideId && !!houseId }
  );

  const createVacationRequestMutation = api.scheduling.createVacationRequest.useMutation({
    onSuccess: () => handleMutationSuccess(isCoordinatorOrAdmin ? 'חופשה נוספה בהצלחה' : 'בקשת חופשה נשלחה בהצלחה'),
    onError: (err) => handleMutationError(err, 'שגיאה ביצירת בקשת חופשה'),
  });

  const cancelVacationRequestMutation = api.scheduling.cancelVacationRequest.useMutation({
    onSuccess: () => handleMutationSuccess('החופשה הוסרה'),
    onError: (err) => handleMutationError(err, 'שגיאה בהסרת חופשה'),
  });

  const handleCreateVacationRequest = () => {
    if (!startDate || !endDate) {
      setError('נא למלא תאריכי התחלה וסיום');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      setError('תאריך התחלה חייב להיות לפני תאריך הסיום');
      return;
    }

    startTransition(() => {
      createVacationRequestMutation.mutate({
        userId: guideId,
        houseId: houseId,
        startDate: start,
        endDate: end,
        reason: reason || 'חופשה',
      });
    });
  };

  const handleCancelVacationRequest = (vacation: any) => {
    startTransition(() => {
      cancelVacationRequestMutation.mutate({ 
        startDate: new Date(vacation.date),
        endDate: new Date(vacation.date),  // For single day vacation constraints
        userId: vacation.user?.id || vacation.userId || guideId
      });
    });
  };

  const getStatusBadge = (status: VacationRequestStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">מאושר</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">ממתין</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">נדחה</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'תאריך לא זמין';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'תאריך לא תקין';
    return dateObj.toLocaleDateString('he-IL');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-gray-800/50 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          {isCoordinatorOrAdmin ? <Plus className="w-6 h-6 text-blue-500"/> : <Plane className="w-6 h-6 text-blue-500"/>}
          {isCoordinatorOrAdmin ? 'הוסף חופשה למדריך' : 'בקש חופשה חדשה'}
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">תאריך התחלה</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">תאריך סיום</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">סיבה (אופציונלי)</label>
            <Input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="למשל: חופשה משפחתית, טיול" />
          </div>
          <div className="flex justify-end pt-4 pb-4">
            <Button 
              onClick={handleCreateVacationRequest} 
              disabled={isPending} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              {isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : 
               isCoordinatorOrAdmin ? <Plus className="ml-2 h-4 w-4"/> : <Send className="ml-2 h-4 w-4"/>}
              {isCoordinatorOrAdmin ? 'הוסף חופשה' : 'שלח בקשה'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white dark:bg-gray-800/50 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          {isCoordinatorOrAdmin ? 'חופשות המדריך' : 'בקשות חופשה קיימות'}
        </h3>
        {isLoading ? (
            <div className="text-center py-8 text-gray-500"><Loader2 className="mx-auto h-8 w-8 animate-spin"/></div>
        ) : vacationRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CalendarX2 className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg">
              {isCoordinatorOrAdmin ? 'אין חופשות למדריך זה' : 'אין בקשות חופשה עדיין'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {vacationRequests.map((vacation) => (
              <div key={vacation.id} className="border dark:border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-3xl text-blue-500"><Plane/></div>
                    <div>
                        <div className="font-bold text-lg text-gray-800 dark:text-gray-200">
                            {vacation.startDate && vacation.endDate ? 
                              `${formatDate(vacation.startDate)} - ${formatDate(vacation.endDate)}` :
                              formatDate(vacation.date)
                            }
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{vacation.description || vacation.reason}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {getStatusBadge(vacation.status)}
                  {(isCoordinatorOrAdmin || vacation.status === 'PENDING') && (
                    <Button variant="ghost" size="icon" onClick={() => handleCancelVacationRequest(vacation)} disabled={isPending} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-4 h-10">
        {error && <InlineAlert message={error} variant="destructive" onClose={() => setError(null)} />}
        {success && <InlineAlert message={success} variant="success" onClose={() => setSuccess(null)} />}
      </div>

    </div>
  );
}