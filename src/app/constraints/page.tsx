// @ts-nocheck
'use client';

import { useSession } from 'next-auth/react';
import { useState, useTransition } from 'react';
import { Button } from '~/app/_components/ui/button';
import { Card } from '~/app/_components/ui/card';
import { Input } from '~/app/_components/ui/input';
import { Badge } from '~/app/_components/ui/badge';
import { api } from '~/trpc/react';
import { cn } from '~/lib/utils';
import { InteractiveConstraintCalendar } from './_components/InteractiveConstraintCalendar';
import { WeeklyConstraintsTab } from './_components/WeeklyConstraintsTab';
import { VacationTab } from './_components/VacationTab';
import { AlertDescription, AlertTitle, InlineAlert } from '~/app/_components/ui/alert';
import { Calendar, Clock, Plane, UserPlus, Search, Save, X, ArrowRightLeft, UserCog, AlertCircle } from 'lucide-react';

export default function ConstraintsPage() {
  const { data: session } = useSession();
  
  // State management
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isRangeMode, setIsRangeMode] = useState<boolean>(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [batchReason, setBatchReason] = useState<string>('');
  const [currentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'monthly' | 'weekly' | 'vacation'>('monthly');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Determine user role early for hook conditions
  const userRole = session?.user?.role;
  const isCoordinatorOrAdmin = userRole === 'COORDINATOR' || userRole === 'ADMIN';

  // API queries
  const { data: guides = [], refetch: refetchGuides } = api.sigalit.getUsersByHouse.useQuery({
    houseId: session?.user?.houseId ?? '',
    role: 'GUIDE',
  }, {
    enabled: isCoordinatorOrAdmin && !!session?.user?.houseId,
  });

  const { data: constraintCounts = {} } = api.scheduling.getGuideConstraintCounts.useQuery({
    month: currentMonth,
    year: currentYear,
    houseId: session?.user?.houseId ?? '',
  }, {
    enabled: isCoordinatorOrAdmin && !!session?.user?.houseId,
  });

  const utils = api.useUtils();

  const handleMutationSuccess = async (message: string) => {
    await utils.scheduling.getMonthlyConstraints.invalidate();
    await utils.scheduling.getGuideConstraintCounts.invalidate();
    await utils.scheduling.getWeeklyConstraints.invalidate();
    await utils.scheduling.getVacationRequests.invalidate();
    await refetchGuides();
    setSuccess(message);
    setError(null);
    setSelectedDates([]);
    setBatchReason('');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleMutationError = (error: { message: string }, defaultMessage: string) => {
    setError(error.message ?? defaultMessage);
    setSuccess(null);
    setTimeout(() => setError(null), 5000);
  };

  // Mutations
  const createConstraintForGuideMutation = api.scheduling.createConstraintForGuide.useMutation({
    onSuccess: () => handleMutationSuccess(`${selectedDates.length} אילוצים נוספו בהצלחה`),
    onError: (error) => handleMutationError(error, 'שגיאה בהוספת אילוץ'),
  });

  const removeConstraintMutation = api.scheduling.deleteMonthlyConstraint.useMutation({
    onSuccess: () => handleMutationSuccess('האילוץ הוסר בהצלחה'),
    onError: (error) => handleMutationError(error, 'שגיאה בהסרת אילוץ'),
  });

  // Auth checks
  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <AlertTitle className="mt-4 text-xl font-semibold">נדרש אימות</AlertTitle>
          <AlertDescription className="mt-2 text-gray-600 dark:text-gray-400">אנא התחבר כדי לצפות בעמוד זה.</AlertDescription>
        </Card>
      </div>
    );
  }

  if (!isCoordinatorOrAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Card className="p-8 text-center">
          <UserCog className="mx-auto h-12 w-12 text-gray-400" />
          <AlertTitle className="mt-4 text-xl font-semibold">גישה מוגבלת</AlertTitle>
          <AlertDescription className="mt-2 text-gray-600 dark:text-gray-400">עמוד זה מיועד לרכזים ומנהלים בלבד.</AlertDescription>
        </Card>
      </div>
    );
  }

  // Helper functions
  const isSameDay = (date1: Date, date2: Date) => date1.toDateString() === date2.toDateString();

  const getDateRange = (start: Date, end: Date): Date[] => {
    const dates = [];
    let currentDate = new Date(start);
    let endDate = new Date(end);
    if (currentDate > endDate) [currentDate, endDate] = [endDate, currentDate];
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  // Event handlers
  const handleDateClick = (date: Date) => {
    if (!selectedGuide) return;
    if (isRangeMode) {
      if (!rangeStart) {
        setRangeStart(date);
      } else {
        const dates = getDateRange(rangeStart, date);
        setSelectedDates(prev => {
          const newDates = [...prev];
          dates.forEach(d => {
            if (!newDates.some(existing => isSameDay(existing, d))) newDates.push(d);
          });
          return newDates;
        });
        setRangeStart(null);
      }
    } else {
      setSelectedDates(prev => 
        prev.some(d => isSameDay(d, date))
          ? prev.filter(d => !isSameDay(d, date))
          : [...prev, date]
      );
    }
  };

  const clearSelection = () => {
    setSelectedDates([]);
    setRangeStart(null);
    setBatchReason('');
  };

  const saveConstraints = () => {
    if (!selectedGuide || selectedDates.length === 0) {
      setError('נא לבחור מדריך ותאריכים');
      setTimeout(() => setError(null), 3000);
      return;
    }
    startTransition(() => {
      createConstraintForGuideMutation.mutate({
        guideId: selectedGuide.id,
        dates: selectedDates,
        reason: batchReason || 'אילוץ מרכז',
        constraintType: 'MONTHLY',
      });
    });
  };

  const handleConstraintRemove = (constraintId: string) => {
    startTransition(() => {
      removeConstraintMutation.mutate({ constraintId });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir="rtl">
      <main className="mx-auto max-w-screen-2xl p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            ניהול אילוצים
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            בחר מדריך ונהל את האילוצים שלו באופן חזותי ונוח.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <Card className="p-4 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-xl text-gray-800 dark:text-gray-200">מדריכים</h3>
                <Badge variant="secondary">{guides.length} סה״כ</Badge>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input placeholder="חיפוש מדריך..." className="pl-10" />
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {guides.map(guide => (
                  <button 
                    key={guide.id}
                    className={cn(
                      "w-full text-right p-3 rounded-lg transition-all duration-200 flex items-center justify-between",
                      selectedGuide?.id === guide.id 
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                    )}
                    onClick={() => {
                      setSelectedGuide(guide);
                      clearSelection();
                    }}
                  >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400">
                            {guide.name?.charAt(0)}
                        </div>
                        <span>{guide.name}</span>
                    </div>
                    <Badge variant={selectedGuide?.id === guide.id ? 'default' : 'outline'} className="bg-blue-500 text-white">
                      {constraintCounts[guide.id] ?? 0}
                    </Badge>
                  </button>
                ))}
                {guides.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UserPlus className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2">אין מדריכים להצגה</p>
                  </div>
                )}
              </div>
            </Card>
          </aside>

          <div className="lg:col-span-9">
            {selectedGuide ? (
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-300">
                        {selectedGuide.name?.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">אילוצים - {selectedGuide.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400">ניהול אילוצים חודשיים, שבועיים וחופשות</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsRangeMode(!isRangeMode);
                        clearSelection();
                      }}
                      className="flex items-center gap-2"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      <span>{isRangeMode ? 'טווח תאריכים' : 'יום בודד'}</span>
                    </Button>
                  </div>
                </div>

                <div className="mb-6">
                  <nav className="flex space-x-2 sm:space-x-4 border-b border-gray-200 dark:border-gray-700" dir="ltr">
                    {[ { id: 'monthly', label: 'אילוצים חודשיים', icon: Calendar },
                       { id: 'weekly', label: 'אילוצים שבועיים', icon: Clock },
                       { id: 'vacation', label: 'חופשות', icon: Plane } ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'monthly' | 'weekly' | 'vacation')}
                        className={cn(
                          "flex items-center gap-2 pb-3 px-2 sm:px-4 border-b-2 font-medium text-sm transition-colors",
                          activeTab === tab.id
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                        dir="rtl"
                      >
                        <tab.icon className="h-5 w-5" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                <div>
                  {activeTab === 'monthly' && (
                    <InteractiveConstraintCalendar 
                      guideId={selectedGuide.id}
                      selectedDates={selectedDates}
                      onDateClick={handleDateClick}
                      onConstraintRemove={handleConstraintRemove}
                      isRangeMode={isRangeMode}
                      rangeStart={rangeStart}
                      currentMonth={currentMonth}
                      currentYear={currentYear}
                      houseId={session.user.houseId ?? ''}
                    />
                  )}
                  {activeTab === 'weekly' && <WeeklyConstraintsTab guideId={selectedGuide.id} houseId={session.user.houseId ?? ''} />}
                  {activeTab === 'vacation' && <VacationTab guideId={selectedGuide.id} houseId={session.user.houseId ?? ''} />}
                </div>

                {activeTab === 'monthly' && selectedDates.length > 0 && (
                  <div className="mt-6 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium">שמירת אילוצים חדשים</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                          type="text"
                          value={batchReason}
                          onChange={(e) => setBatchReason(e.target.value)}
                          placeholder="סיבה לאילוץ (אופציונלי)"
                          className="flex-1"
                        />
                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-center">
                            נבחרו <strong className="mx-1">{selectedDates.length}</strong> תאריכים
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-3">
                      <Button variant="ghost" onClick={clearSelection} disabled={isPending}><X className="w-4 h-4 mr-2"/>נקה בחירה</Button>
                      <Button onClick={saveConstraints} disabled={isPending} className="min-w-[120px]">
                        {isPending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <><Save className="w-4 h-4 mr-2"/>שמור אילוצים</>}
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 h-10">
                    {error && <InlineAlert message={error} variant="destructive" onClose={() => setError(null)} />}
                    {success && <InlineAlert message={success} variant="success" onClose={() => setSuccess(null)} />}
                </div>

              </Card>
            ) : (
              <Card className="p-20 text-center flex flex-col items-center justify-center min-h-[70vh]">
                <UserPlus className="text-gray-300 dark:text-gray-600 h-24 w-24 mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  בחר מדריך מהרשימה
                </h3>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  לחץ על שם המדריך כדי להתחיל לנהל את האילוצים שלו.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}