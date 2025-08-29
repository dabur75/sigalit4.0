// @ts-nocheck
'use client';

import { useState, useTransition } from 'react';
import { api } from '~/trpc/react';
import { Card } from '~/app/_components/ui/card';
import { Button } from '~/app/_components/ui/button';
import { Input } from '~/app/_components/ui/input';
import { Badge } from '~/app/_components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/app/_components/ui/select';
import { ConstraintStatus } from '@prisma/client';
import { PlusCircle, Trash2, CalendarOff, Loader2, Power, PowerOff } from 'lucide-react';
import { InlineAlert } from '~/app/_components/ui/alert';

interface Props {
  guideId: string;
  houseId: string;
}

export function WeeklyConstraintsTab({ guideId, houseId }: Props) {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const utils = api.useUtils();

  const handleMutationSuccess = async (message: string) => {
    await utils.scheduling.getWeeklyConstraints.invalidate();
    setSuccess(message);
    setError(null);
    setSelectedDay('');
    setReason('');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleMutationError = (error: { message: string }, defaultMessage: string) => {
    setError(error.message ?? defaultMessage);
    setSuccess(null);
    setTimeout(() => setError(null), 5000);
  };

  const { data: weeklyConstraints = [], isLoading } = api.scheduling.getWeeklyConstraints.useQuery({
    userId: guideId,
    houseId: houseId,
  }, { enabled: !!guideId && !!houseId });

  const createWeeklyConstraintMutation = api.scheduling.createWeeklyConstraint.useMutation({
    onSuccess: () => handleMutationSuccess('אילוץ שבועי נוצר בהצלחה'),
    onError: (err) => handleMutationError(err, 'שגיאה ביצירת אילוץ שבועי'),
  });

  const deleteWeeklyConstraintMutation = api.scheduling.deleteGuideConstraint.useMutation({
    onSuccess: () => handleMutationSuccess('אילוץ שבועי נמחק בהצלחה'),
    onError: (err) => handleMutationError(err, 'שגיאה במחיקת אילוץ שבועי'),
  });

  const updateWeeklyConstraintMutation = api.scheduling.updateWeeklyConstraint.useMutation({
    onSuccess: () => handleMutationSuccess('סטטוס אילוץ שבועי עודכן'),
    onError: (err) => handleMutationError(err, 'שגיאה בעדכון סטטוס אילוץ שבועי'),
  });

  const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  const handleCreateWeeklyConstraint = () => {
    if (selectedDay === '') {
      setError('נא לבחור יום בשבוע');
      return;
    }
    startTransition(() => {
        createWeeklyConstraintMutation.mutate({
            userId: guideId,
            dayOfWeek: parseInt(selectedDay),
            reason: reason || 'אילוץ שבועי',
            status: ConstraintStatus.ACTIVE,
        });
    });
  };

  const handleDeleteWeeklyConstraint = (constraintId: string) => {
    startTransition(() => {
        deleteWeeklyConstraintMutation.mutate({ constraintId, constraintType: 'WEEKLY' });
    });
  };

  const handleDeactivateWeeklyConstraint = (constraintId: string) => {
    startTransition(() => {
      updateWeeklyConstraintMutation.mutate({ constraintId, status: ConstraintStatus.INACTIVE });
    });
  };

  const handleReactivateWeeklyConstraint = (constraintId: string) => {
    startTransition(() => {
      updateWeeklyConstraintMutation.mutate({ constraintId, status: ConstraintStatus.ACTIVE });
    });
  };

  const getStatusBadge = (status: ConstraintStatus) => {
    switch (status) {
      case ConstraintStatus.ACTIVE:
        return <Badge variant="secondary">פעיל</Badge>;
      case ConstraintStatus.INACTIVE:
        return <Badge variant="outline">לא פעיל</Badge>;
      case ConstraintStatus.PENDING_APPROVAL:
        return <Badge variant="outline">ממתין לאישור</Badge>;
      case ConstraintStatus.DELETED:
        return <Badge variant="destructive">נדחה</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white dark:bg-gray-800/50 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200"><PlusCircle className="w-6 h-6 text-blue-500"/>הוסף אילוץ שבועי חדש</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">יום בשבוע</label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="בחר יום..." />
                </SelectTrigger>
                <SelectContent>
                    {hebrewDays.map((day, index) => (
                        <SelectItem key={index} value={index.toString()}>יום {day}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">סיבה (אופציונלי)</label>
              <Input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="למשל: לימודים, עבודה אחרת"
              />
            </div>
          </div>
          
          <Button onClick={handleCreateWeeklyConstraint} disabled={isPending} className="w-full sm:w-auto">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4"/>}
            הוסף אילוץ
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-white dark:bg-gray-800/50 shadow-sm">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">אילוצים שבועיים קיימים</h3>
        {isLoading ? (
            <div className="text-center py-8 text-gray-500"><Loader2 className="mx-auto h-8 w-8 animate-spin"/></div>
        ) : weeklyConstraints.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CalendarOff className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg">אין אילוצים שבועיים עדיין</p>
          </div>
        ) : (
          <div className="space-y-3">
            {weeklyConstraints.map((constraint) => (
              <div key={constraint.id} className="border dark:border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl text-blue-500">📅</div>
                  <div>
                    <div className="font-bold text-lg text-gray-800 dark:text-gray-200">יום {hebrewDays[constraint.dayOfWeek]}</div>
                    {constraint.reason && <p className="text-sm text-gray-600 dark:text-gray-400">{constraint.reason}</p>}
                    {constraint.approver && <p className="text-xs text-gray-500 dark:text-gray-500">אושר על ידי: {constraint.approver.name}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {getStatusBadge(constraint.status)}
                  {constraint.status === 'ACTIVE' && (
                    <Button variant="ghost" size="icon" onClick={() => handleDeactivateWeeklyConstraint(constraint.id)} disabled={isPending} className="text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/50">
                      <PowerOff className="h-5 w-5" />
                    </Button>
                  )}
                  {constraint.status === 'INACTIVE' && (
                    <Button variant="ghost" size="icon" onClick={() => handleReactivateWeeklyConstraint(constraint.id)} disabled={isPending} className="text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/50">
                      <Power className="h-5 w-5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteWeeklyConstraint(constraint.id)} disabled={isPending} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50">
                    <Trash2 className="h-5 w-5" />
                  </Button>
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
