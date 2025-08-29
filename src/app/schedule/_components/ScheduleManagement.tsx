'use client';

import { useState, useMemo } from 'react';
import { User } from 'next-auth';
import { UserRole } from '@prisma/client';
import { api } from '~/trpc/react';
import { Card } from '~/app/_components/ui/card';
import { Select } from '~/app/_components/ui/select';
import GuidePool from './GuidePool';
import ScheduleCalendar from './ScheduleCalendar';
import ScheduleContext from './ScheduleContext';

interface ScheduleManagementProps {
  schedule: any;
  user: User;
  currentMonth: number;
  currentYear: number;
}

export default function ScheduleManagement({ 
  schedule, 
  user, 
  currentMonth, 
  currentYear 
}: ScheduleManagementProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedHouseId, setSelectedHouseId] = useState<string>(user.houseId || '');

  // Get available houses for admin users
  const { data: houses = [] } = api.sigalit.getAllHouses.useQuery(
    undefined,
    { enabled: user.role === UserRole.ADMIN }
  );

  // Get schedule assignments for the month
  const { data: assignments = [], refetch: refetchAssignments } = api.scheduling.getAssignmentsBySchedule.useQuery({
    scheduleId: schedule.id,
  });

  // Get available guides for selected day (used for suggestions)
  const { data: availableGuides, refetch: refetchAvailableGuides } = api.scheduling.getAvailableGuides.useQuery({
    date: selectedDay || new Date(),
    scheduleId: schedule.id,
  }, {
    enabled: !!selectedDay && !!schedule.id,
  });

  // Get all guides for the selected house (for guide pool)
  const { data: allGuides = [], refetch: refetchAllGuides } = api.sigalit.getUsersByHouse.useQuery({
    houseId: selectedHouseId,
    role: UserRole.GUIDE,
  }, {
    enabled: !!selectedHouseId,
  });

  // Handle house selection (for admin users)
  const handleHouseChange = (houseId: string) => {
    setSelectedHouseId(houseId);
    setSelectedDay(null); // Reset selected day when changing house
  };

  // Handle day selection
  const handleDaySelect = (date: Date) => {
    setSelectedDay(date);
  };

  // Handle successful assignment
  const handleAssignmentSuccess = () => {
    refetchAssignments();
    refetchAvailableGuides();
    refetchAllGuides();
  };

  // Get assignments for selected day
  const selectedDayAssignments = useMemo(() => {
    if (!selectedDay) return [];
    
    const dateStr = selectedDay.toISOString().split('T')[0];
    return assignments.filter(assignment => 
      assignment.date.toISOString().split('T')[0] === dateStr
    );
  }, [assignments, selectedDay]);

  return (
    <div className="space-y-6">
      {/* House Selector (for admin users) */}
      {user.role === UserRole.ADMIN && houses.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <label htmlFor="house-select" className="font-medium text-gray-700">
              בחר בית:
            </label>
            <Select
              id="house-select"
              value={selectedHouseId}
              onValueChange={handleHouseChange}
            >
              <option value="">-- בחר בית --</option>
              {houses.map((house: any) => (
                <option key={house.id} value={house.id}>
                  {house.name}
                </option>
              ))}
            </Select>
          </div>
        </Card>
      )}

      {/* Main 3-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Guide Pool - Left Panel */}
        <div className="lg:col-span-1">
          <GuidePool
            guides={allGuides}
            selectedDay={selectedDay}
            houseId={selectedHouseId}
            scheduleId={schedule.id}
            onAssignmentSuccess={handleAssignmentSuccess}
          />
        </div>

        {/* Schedule Calendar - Center Panel */}
        <div className="lg:col-span-2">
          <ScheduleCalendar
            schedule={schedule}
            assignments={assignments}
            selectedDay={selectedDay}
            onDaySelect={handleDaySelect}
            onAssignmentSuccess={handleAssignmentSuccess}
            currentMonth={currentMonth}
            currentYear={currentYear}
          />
        </div>

        {/* Schedule Context - Right Panel */}
        <div className="lg:col-span-1">
          <ScheduleContext
            selectedDay={selectedDay}
            assignments={selectedDayAssignments}
            availableGuides={availableGuides}
            houseId={selectedHouseId}
            scheduleId={schedule.id}
            onAssignmentSuccess={handleAssignmentSuccess}
          />
        </div>
      </div>
    </div>
  );
}