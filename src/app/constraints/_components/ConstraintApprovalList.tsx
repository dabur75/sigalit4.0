'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '~/trpc/react';
import { Button } from '~/app/_components/ui/button';
import { Card } from '~/app/_components/ui/card';
import { Input } from '~/app/_components/ui/input';

export function ConstraintApprovalList() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState<'all' | 'weekly' | 'vacation'>('all');
  const [processingConstraints, setProcessingConstraints] = useState<Set<string>>(new Set());
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  const userRole = session?.user?.role;
  const isCoordinatorOrAdmin = userRole === 'COORDINATOR' || userRole === 'ADMIN';

  // Fetch constraints pending approval
  const { data: approvalQueue, refetch } = api.scheduling.getConstraintsForApproval.useQuery(
    { houseId: session?.user?.houseId || '' },
    { enabled: !!session?.user?.houseId && isCoordinatorOrAdmin }
  );

  // Approval mutations
  const approveWeeklyConstraint = api.scheduling.approveWeeklyConstraint.useMutation({
    onSuccess: () => {
      refetch();
    },
    onSettled: (_, __, variables) => {
      setProcessingConstraints(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.constraintId);
        return newSet;
      });
    },
  });

  const rejectWeeklyConstraint = api.scheduling.rejectWeeklyConstraint.useMutation({
    onSuccess: () => {
      refetch();
    },
    onSettled: (_, __, variables) => {
      setProcessingConstraints(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.constraintId);
        return newSet;
      });
    },
  });

  const approveVacationRequest = api.scheduling.approveVacationRequest.useMutation({
    onSuccess: () => {
      refetch();
    },
    onSettled: (_, __, variables) => {
      setProcessingConstraints(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.requestId);
        return newSet;
      });
    },
  });

  const rejectVacationRequest = api.scheduling.rejectVacationRequest.useMutation({
    onSuccess: () => {
      refetch();
    },
    onSettled: (_, __, variables) => {
      setProcessingConstraints(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.requestId);
        return newSet;
      });
    },
  });

  const handleApproveWeekly = async (constraintId: string) => {
    setProcessingConstraints(prev => new Set(prev).add(constraintId));
    await approveWeeklyConstraint.mutateAsync({ constraintId });
  };

  const handleRejectWeekly = async (constraintId: string) => {
    const reason = rejectionReasons[constraintId];
    if (!reason) return;

    setProcessingConstraints(prev => new Set(prev).add(constraintId));
    await rejectWeeklyConstraint.mutateAsync({ 
      constraintId, 
      rejectionReason: reason 
    });

    // Clear the rejection reason
    setRejectionReasons(prev => {
      const newReasons = { ...prev };
      delete newReasons[constraintId];
      return newReasons;
    });
  };

  const handleApproveVacation = async (requestId: string) => {
    if (!session?.user?.id) return;
    
    setProcessingConstraints(prev => new Set(prev).add(requestId));
    await approveVacationRequest.mutateAsync({ 
      requestId, 
      approvedBy: session.user.id 
    });
  };

  const handleRejectVacation = async (requestId: string) => {
    const reason = rejectionReasons[requestId];
    if (!reason) return;

    setProcessingConstraints(prev => new Set(prev).add(requestId));
    await rejectVacationRequest.mutateAsync({ 
      requestId, 
      rejectionReason: reason 
    });

    // Clear the rejection reason
    setRejectionReasons(prev => {
      const newReasons = { ...prev };
      delete newReasons[requestId];
      return newReasons;
    });
  };

  const handleReasonChange = (id: string, reason: string) => {
    setRejectionReasons(prev => ({
      ...prev,
      [id]: reason,
    }));
  };

  if (!isCoordinatorOrAdmin) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl text-gray-300 mb-2">🔒</div>
        <p className="text-gray-500 text-sm">רק רכזים ומנהלים יכולים לגשת לתור האישורים</p>
      </div>
    );
  }

  if (!approvalQueue || approvalQueue.totalPending === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl text-gray-300 mb-2">✅</div>
        <p className="text-gray-500 text-sm">אין בקשות הממתינות לאישור</p>
        <p className="text-gray-400 text-xs mt-1">
          כל הבקשות נבדקו ואושרו
        </p>
      </div>
    );
  }

  const weeklyCount = approvalQueue?.weeklyConstraints?.length || 0;
  const vacationCount = approvalQueue?.vacationRequests?.length || 0;
  const totalCount = weeklyCount + vacationCount;

  const getFilteredData = () => {
    if (filter === 'weekly') {
      return { 
        items: approvalQueue?.weeklyConstraints || [], 
        type: 'weekly' 
      };
    } else if (filter === 'vacation') {
      return { 
        items: approvalQueue?.vacationRequests || [], 
        type: 'vacation' 
      };
    }
    
    // 'all' filter - combine both types
    const allItems = [
      ...(approvalQueue?.weeklyConstraints || []).map(item => ({ ...item, _type: 'weekly' })),
      ...(approvalQueue?.vacationRequests || []).map(item => ({ ...item, _type: 'vacation' }))
    ].sort((a, b) => new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime());
    
    return { items: allItems, type: 'mixed' };
  };

  const { items: filteredItems, type: filterType } = getFilteredData();


  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  return (
    <div className="w-full space-y-6">
      {/* Summary */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              בקשות ממתינות לאישור
            </h3>
            <p className="text-xs text-yellow-700 mt-1">
              סה״כ {totalCount} בקשות דורשות את תשומת לבך
            </p>
          </div>
          <div className="text-2xl">⏳</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-purple-600' : ''}
        >
          הכל ({totalCount})
        </Button>
        <Button
          size="sm"
          variant={filter === 'weekly' ? 'default' : 'outline'}
          onClick={() => setFilter('weekly')}
          className={filter === 'weekly' ? 'bg-purple-600' : ''}
        >
          🔄 שבועי ({weeklyCount})
        </Button>
        <Button
          size="sm"
          variant={filter === 'vacation' ? 'default' : 'outline'}
          onClick={() => setFilter('vacation')}
          className={filter === 'vacation' ? 'bg-purple-600' : ''}
        >
          ✈️ חופשות ({vacationCount})
        </Button>
      </div>

      {/* Approval List */}
      <div className="space-y-4">
        {filteredItems.map((item: any) => {
          const itemType = item._type || filterType;
          const isWeekly = itemType === 'weekly';
          const itemId = item.id;
          const isProcessing = processingConstraints.has(itemId);

          return (
            <Card key={itemId} className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {item.user.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {isWeekly 
                        ? `יום ${dayNames[item.dayOfWeek]}`
                        : new Date(item.date).toLocaleDateString('he-IL', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })
                      }
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    isWeekly 
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}>
                    {isWeekly ? 'אילוץ שבועי' : 'בקשת חופשה'}
                  </span>
                </div>

                {/* Details */}
                {(item.reason || item.description) && (
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                    <strong>{isWeekly ? 'סיבה:' : 'פרטים:'}</strong> {item.reason || item.description}
                  </p>
                )}

                {/* Request Date */}
                <p className="text-xs text-gray-500">
                  נשלח: {new Date(item.createdAt || item.date).toLocaleDateString('he-IL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2 border-t">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => isWeekly ? handleApproveWeekly(itemId) : handleApproveVacation(itemId)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'מאשר...' : isWeekly ? 'אשר' : 'אשר חופשה'}
                  </Button>

                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      size="sm"
                      placeholder={`סיבה לדחיית ${isWeekly ? 'האילוץ' : 'החופשה'}...`}
                      value={rejectionReasons[itemId] || ''}
                      onChange={(e) => handleReasonChange(itemId, e.target.value)}
                      className="text-sm"
                      dir="rtl"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => isWeekly ? handleRejectWeekly(itemId) : handleRejectVacation(itemId)}
                      disabled={!rejectionReasons[itemId] || isProcessing}
                    >
                      {isProcessing ? 'דוחה...' : 'דחה'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400">👨‍💼</span>
          </div>
          <div className="mr-3">
            <h3 className="text-sm font-medium text-blue-800">
              הנחיות לרכז
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>בדוק זמינות מדריכים אחרים לפני אישור</li>
                <li>אילוצים שבועיים משפיעים על כל השיבוצים החודשיים</li>
                <li>בקשות חופשה דורשות תכנון מוקדם</li>
                <li>הסבר תמיד את הסיבה לדחיית בקשה</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}