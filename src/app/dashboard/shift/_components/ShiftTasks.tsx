'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';
import { Button } from '~/app/_components/ui/button';
import { Input } from '~/app/_components/ui/input';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface ShiftTasksProps {
  houseId: string;
  selectedDate: Date;
}

const TASK_STATUSES = [
  { value: 'PENDING', label: 'ממתין', icon: Clock, color: 'text-yellow-600' },
  { value: 'IN_PROGRESS', label: 'בביצוע', icon: AlertCircle, color: 'text-blue-600' },
  { value: 'COMPLETED', label: 'הושלם', icon: CheckCircle, color: 'text-green-600' },
  { value: 'CANCELLED', label: 'בוטל', icon: XCircle, color: 'text-red-600' },
];

const TASK_PRIORITIES = [
  { value: 'LOW', label: 'נמוכה', color: 'bg-gray-100 text-gray-700' },
  { value: 'MEDIUM', label: 'בינונית', color: 'bg-blue-100 text-blue-700' },
  { value: 'HIGH', label: 'גבוהה', color: 'bg-orange-100 text-orange-700' },
  { value: 'URGENT', label: 'דחופה', color: 'bg-red-100 text-red-700' },
];

export function ShiftTasks({ houseId, selectedDate }: ShiftTasksProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  const { data: tasks, refetch } = api.sigalit.getShiftTasks.useQuery({
    houseId,
    date: selectedDate,
  });

  const createTaskMutation = api.sigalit.createShiftTask.useMutation({
    onSuccess: () => {
      refetch();
      setNewTaskTitle('');
      setNewTaskDescription('');
    },
  });

  const updateTaskMutation = api.sigalit.updateShiftTask.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteTaskMutation = api.sigalit.deleteShiftTask.useMutation({
    onSuccess: () => refetch(),
  });

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;

    void createTaskMutation.mutate({
      houseId,
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      date: selectedDate,
      priority: 'MEDIUM',
    });
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    void updateTaskMutation.mutate({
      id: taskId,
      status: newStatus as "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
    });
  };

  const handleDeleteTask = (taskId: string) => {
    void deleteTaskMutation.mutate({ id: taskId });
  };

  const getStatusIcon = (status: string) => {
    const statusConfig = TASK_STATUSES.find(s => s.value === status);
    if (!statusConfig) return Clock;
    return statusConfig.icon;
  };

  const getStatusColor = (status: string) => {
    const statusConfig = TASK_STATUSES.find(s => s.value === status);
    if (!statusConfig) return 'text-gray-600';
    return statusConfig.color;
  };

  const getPriorityColor = (priority: string) => {
    const priorityConfig = TASK_PRIORITIES.find(p => p.value === priority);
    if (!priorityConfig) return 'bg-gray-100 text-gray-700';
    return priorityConfig.color;
  };

  return (
    <div className="space-y-4">
      {/* Create New Task */}
      <div className="space-y-3">
        <Input
          placeholder="כתוב משימה חדשה..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="text-right"
        />
        <Input
          placeholder="תיאור (אופציונלי)"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          className="text-right"
        />
        <div className="flex space-x-2 space-x-reverse">
          <Button
            onClick={handleCreateTask}
            disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
            className="bg-sigalit-500 hover:bg-sigalit-600 text-white"
          >
            הוסף
          </Button>
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700"
          >
            היסטוריה
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks?.map((task) => {
          const StatusIcon = getStatusIcon(task.status);
          
          return (
            <div
              key={task.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3"
            >
              {/* Task Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <StatusIcon className={`h-5 w-5 ${getStatusColor(task.status)}`} />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {task.title}
                  </h4>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {TASK_PRIORITIES.find(p => p.value === task.priority)?.label || task.priority}
                </span>
              </div>

              {/* Task Description */}
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {task.description}
                </p>
              )}

              {/* Task Actions */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2 space-x-reverse">
                  <Button
                    onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    בוצע
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                    size="sm"
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    העבר ליום אחר
                  </Button>
                  <Button
                    onClick={() => handleDeleteTask(task.id)}
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    ביטול
                  </Button>
                </div>
                
                <span className="text-xs text-gray-500">
                  {new Date(task.date ?? new Date()).toLocaleDateString('he-IL')}
                </span>
              </div>
            </div>
          );
        })}

        {(!tasks || tasks.length === 0) && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            אין משימות לתאריך זה
          </div>
        )}
      </div>
    </div>
  );
}
