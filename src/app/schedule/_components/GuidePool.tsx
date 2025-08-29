'use client';

import { useState, useMemo } from 'react';
import { AssignmentRole } from '@prisma/client';
import { api } from '~/trpc/react';
import { Card } from '~/app/_components/ui/card';
import { Button } from '~/app/_components/ui/button';

interface GuidePoolProps {
  guides: any[];
  selectedDay: Date | null;
  houseId: string;
  scheduleId: string;
  onAssignmentSuccess: () => void;
}

interface GuideWithAvailability {
  guide: any;
  status: 'available' | 'warning' | 'blocked';
  reason?: string;
  shiftCount: number;
  totalAssignments: number;
}

export default function GuidePool({ 
  guides, 
  selectedDay, 
  houseId, 
  scheduleId,
  onAssignmentSuccess 
}: GuidePoolProps) {
  const [draggedGuide, setDraggedGuide] = useState<any>(null);

  // Get available guides data if day is selected
  const { data: availabilityData, isLoading: availabilityLoading } = api.scheduling.getAvailableGuides.useQuery({
    date: selectedDay || new Date(),
    scheduleId,
  }, {
    enabled: !!selectedDay && !!scheduleId,
  });

  // Get monthly assignment counts for fairness display
  const currentMonth = selectedDay?.getMonth() + 1 || new Date().getMonth() + 1;
  const currentYear = selectedDay?.getFullYear() || new Date().getFullYear();

  const { data: monthlyStats } = api.scheduling.getGuideMonthlyStats.useQuery({
    month: currentMonth,
    year: currentYear,
    houseId,
  }, {
    enabled: !!houseId,
  });

  // Process guides with availability status
  const guidesWithAvailability = useMemo((): GuideWithAvailability[] => {
    if (!selectedDay) {
      // If no day selected, show all guides as available
      return guides.map(guide => ({
        guide,
        status: 'available' as const,
        reason: undefined,
        shiftCount: monthlyStats?.find(stat => stat.guideId === guide.id)?.totalAssignments || 0,
        totalAssignments: monthlyStats?.find(stat => stat.guideId === guide.id)?.totalAssignments || 0,
      }));
    }

    if (availabilityLoading) {
      return guides.map(guide => ({
        guide,
        status: 'blocked' as const,
        reason: 'טוען זמינות...',
        shiftCount: monthlyStats?.find(stat => stat.guideId === guide.id)?.totalAssignments || 0,
        totalAssignments: monthlyStats?.find(stat => stat.guideId === guide.id)?.totalAssignments || 0,
      }));
    }

    if (!availabilityData) {
      return guides.map(guide => ({
        guide,
        status: 'available' as const,
        reason: 'ממתין לנתונים',
        shiftCount: monthlyStats?.find(stat => stat.guideId === guide.id)?.totalAssignments || 0,
        totalAssignments: monthlyStats?.find(stat => stat.guideId === guide.id)?.totalAssignments || 0,
      }));
    }

    return guides.map(guide => {
      const availability = availabilityData.find(g => g.id === guide.id);
      const stats = monthlyStats?.find(stat => stat.guideId === guide.id);
      
      if (!availability) {
        return {
          guide,
          status: 'blocked' as const,
          reason: 'לא זמין',
          shiftCount: stats?.totalAssignments || 0,
          totalAssignments: stats?.totalAssignments || 0,
        };
      }

      let status: 'available' | 'warning' | 'blocked' = 'available';
      let reason: string | undefined;

      if (!availability.isAvailable) {
        status = 'blocked';
        reason = availability.blockedBy || 'חסום';
      } else if (availability.warning) {
        status = 'warning';
        reason = availability.warning;
      }

      return {
        guide,
        status,
        reason,
        shiftCount: stats?.totalAssignments || 0,
        totalAssignments: availability.monthlyAssignments || 0,
      };
    });
  }, [guides, selectedDay, availabilityData, availabilityLoading, monthlyStats]);

  // Group guides by availability status
  const groupedGuides = useMemo(() => {
    const available = guidesWithAvailability.filter(g => g.status === 'available');
    const warning = guidesWithAvailability.filter(g => g.status === 'warning');
    const blocked = guidesWithAvailability.filter(g => g.status === 'blocked');

    return { available, warning, blocked };
  }, [guidesWithAvailability]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, guide: any) => {
    setDraggedGuide(guide);
    e.dataTransfer.setData('text/plain', JSON.stringify({
      guideId: guide.guide.id,
      guideName: guide.guide.name,
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setDraggedGuide(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'blocked': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return '✅';
      case 'warning': return '⚠️';
      case 'blocked': return '❌';
      default: return '○';
    }
  };

  const renderGuideGroup = (title: string, guides: GuideWithAvailability[], icon: string) => {
    if (guides.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2 text-sm flex items-center gap-2">
          <span>{icon}</span>
          {title} ({guides.length})
        </h4>
        <div className="space-y-2">
          {guides.map(({ guide, status, reason, shiftCount, totalAssignments }) => (
            <div
              key={guide.id}
              draggable={status !== 'blocked'}
              onDragStart={(e) => handleDragStart(e, { guide, status, reason, shiftCount })}
              onDragEnd={handleDragEnd}
              className={`
                p-3 rounded-md border-2 transition-all cursor-grab active:cursor-grabbing
                ${getStatusColor(status)}
                ${status === 'blocked' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                ${draggedGuide?.guide.id === guide.id ? 'opacity-50 transform scale-95' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900 text-sm">
                  {guide.name}
                </span>
                <span className="text-xs text-gray-500">
                  {getStatusIcon(status)}
                </span>
              </div>
              
              <div className="text-xs text-gray-600">
                <div>משמרות: {shiftCount}/8</div>
                {reason && (
                  <div className="text-gray-500 mt-1">{reason}</div>
                )}
              </div>
              
              {/* Progress bar for fairness */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min((shiftCount / 8) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          צוות המדריכים
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

      {!selectedDay && (
        <div className="text-center py-6 text-gray-500 text-sm">
          <div className="text-2xl mb-2">📅</div>
          <p>בחר יום בלוח השנה</p>
          <p>כדי לראות זמינות מדריכים</p>
        </div>
      )}

      {selectedDay && (
        <div>
          <div className="mb-4 text-center">
            <div className="text-sm font-medium text-gray-700">
              {new Intl.DateTimeFormat('he-IL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              }).format(selectedDay)}
            </div>
            {availabilityLoading && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                <span className="text-xs text-blue-600">טוען זמינות...</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mb-4 p-2 bg-blue-50 rounded text-xs text-blue-800">
            גרור מדריכים ללוח השנה כדי לשבץ משמרות
          </div>

          {/* Available Guides */}
          {renderGuideGroup('זמינים', groupedGuides.available, '✅')}
          
          {/* Warning Guides */}
          {renderGuideGroup('עם העדפות', groupedGuides.warning, '⚠️')}
          
          {/* Blocked Guides */}
          {renderGuideGroup('חסומים', groupedGuides.blocked, '❌')}

          {guides.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              אין מדריכים רשומים לבית זה
            </div>
          )}
        </div>
      )}
    </Card>
  );
}