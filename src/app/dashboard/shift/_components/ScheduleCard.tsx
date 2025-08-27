'use client';

import { Button } from '~/app/_components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface Activity {
  id: string;
  time: string;
  activityName: string;
  instructor: string;
  activityType: string;
  note?: string | null;
}

interface ScheduleCardProps {
  activity: Activity;
  isOverride: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function ScheduleCard({ activity, isOverride, onEdit, onDelete }: ScheduleCardProps) {
  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'טיפולית':
        return 'bg-blue-500 text-white';
      case 'אומנות':
        return 'bg-purple-500 text-white';
      case 'ספורט':
        return 'bg-green-500 text-white';
      case 'חינוכית':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getCardColor = () => {
    if (isOverride) {
      return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    }
    return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return time;
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getCardColor()} relative group`}>
      {/* Activity Content */}
      <div className="space-y-2">
        {/* Time and Name */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {formatTime(activity.time)} - {activity.activityName}
          </div>
          {isOverride && (
            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
              שינוי חד פעמי
            </span>
          )}
        </div>

        {/* Instructor */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {activity.instructor}
        </div>

        {/* Activity Type */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className={`text-xs px-2 py-1 rounded-full ${getActivityTypeColor(activity.activityType)}`}>
            {activity.activityType}
          </span>
        </div>

        {/* Note */}
        {activity.note && (
          <div className="text-xs text-gray-500 dark:text-gray-500 italic">
            {activity.note}
          </div>
        )}
      </div>

      {/* Action Buttons - Show on hover */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 space-x-reverse">
        <Button
          onClick={onEdit}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          onClick={onDelete}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
