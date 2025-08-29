import { auth } from '~/server/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { api } from '~/trpc/server';
import ScheduleManagement from './_components/ScheduleManagement';

export default async function SchedulePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Only coordinators and admins can access the manual scheduler
  if (session.user.role === UserRole.GUIDE) {
    redirect('/constraints?message=scheduler-access-denied');
  }

  const user = session.user;
  
  // Get current month to check/create schedule
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
  const currentYear = now.getFullYear();
  
  try {
    // Check if schedule exists for current month, create if not
    let schedule = await api.scheduling.getScheduleByMonth({
      month: currentMonth,
      year: currentYear,
      houseId: user.houseId || '',
    });

    // If no schedule exists, create one
    if (!schedule) {
      schedule = await api.scheduling.createSchedule({
        month: currentMonth,
        year: currentYear,
        houseId: user.houseId || '',
        createdBy: user.id,
      });
    }

    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              מערכת שיבוץ משמרות
            </h1>
            <p className="text-gray-600">
              {new Intl.DateTimeFormat('he-IL', { 
                month: 'long', 
                year: 'numeric' 
              }).format(new Date(currentYear, currentMonth - 1))}
            </p>
          </div>
          
          <ScheduleManagement 
            schedule={schedule} 
            user={user}
            currentMonth={currentMonth}
            currentYear={currentYear}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading schedule:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            שגיאה בטעינת המערכת
          </h2>
          <p className="text-gray-600">
            אירעה שגיאה בטעינת מערכת השיבוץ. אנא נסה שוב מאוחר יותר.
          </p>
        </div>
      </div>
    );
  }
}