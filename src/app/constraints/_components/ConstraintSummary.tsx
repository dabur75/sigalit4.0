'use client';

import { useSession } from 'next-auth/react';
import { api } from '~/trpc/react';
import { Card } from '~/app/_components/ui/card';

interface ConstraintStat {
  label: string;
  count: number;
  color: string;
  icon: string;
}

export function ConstraintSummary() {
  const { data: session } = useSession();
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Fetch current month constraints
  const { data: monthlyConstraints } = api.scheduling.getMonthlyConstraints.useQuery({
    month: currentMonth,
    year: currentYear,
    houseId: session?.user?.houseId || '',
    userId: session?.user?.role === 'GUIDE' ? session.user.id : undefined,
  }, { enabled: !!session?.user?.houseId });

  // Fetch weekly constraints
  const { data: weeklyConstraints } = api.scheduling.getWeeklyConstraints.useQuery({
    userId: session?.user?.role === 'GUIDE' ? session?.user?.id : undefined,
    houseId: session?.user?.houseId || '',
  }, { enabled: !!session?.user?.houseId });

  // Calculate statistics
  const stats: ConstraintStat[] = [
    {
      label: 'אילוצים חד פעמיים החודש',
      count: (monthlyConstraints || []).filter(c => c.type === 'UNAVAILABLE').length,
      color: 'text-red-600 bg-red-100',
      icon: '📅'
    },
    {
      label: 'אילוצים שבועיים פעילים',
      count: (weeklyConstraints || []).filter((c: any) => c.status === 'ACTIVE').length,
      color: 'text-blue-600 bg-blue-100',
      icon: '🔄'
    },
    {
      label: 'בקשות ממתינות לאישור',
      count: (weeklyConstraints || []).filter((c: any) => c.status === 'ACTIVE' && !c.approvedBy).length,
      color: 'text-yellow-600 bg-yellow-100',
      icon: '⏳'
    },
  ];

  // Get upcoming constraints (next 7 days)
  const upcomingConstraints = (monthlyConstraints || [])
    .filter(c => {
      const constraintDate = new Date(c.date);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return constraintDate >= currentDate && constraintDate <= weekFromNow;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5); // Show max 5 upcoming

  // Get weekly constraints by day
  const weeklyConstraintsByDay = (weeklyConstraints || [])
    .filter((c: any) => c.status === 'ACTIVE')
    .reduce((acc: Record<number, any>, constraint: any) => {
      acc[constraint.dayOfWeek] = constraint;
      return acc;
    }, {});

  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <span className="text-lg">{stat.icon}</span>
              <span className="text-sm font-medium text-gray-700">{stat.label}</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${stat.color}`}>
              {stat.count}
            </span>
          </div>
        ))}
      </div>

      {/* Weekly Constraints Overview */}
      {Object.keys(weeklyConstraintsByDay).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">אילוצים שבועיים</h4>
          <div className="space-y-2">
            {Object.entries(weeklyConstraintsByDay).map(([dayOfWeek, constraint]: [string, any]) => (
              <div key={dayOfWeek} className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                <span className="text-sm font-medium text-blue-800">
                  {dayNames[parseInt(dayOfWeek)]}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    constraint.approvedBy 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {constraint.approvedBy ? 'אושר' : 'ממתין'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Constraints */}
      {upcomingConstraints.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">אילוצים קרובים</h4>
          <div className="space-y-2">
            {upcomingConstraints.map((constraint) => (
              <div key={constraint.id} className="flex items-center justify-between p-2 bg-red-50 rounded-md">
                <span className="text-sm text-red-800">
                  {new Date(constraint.date).toLocaleDateString('he-IL', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
                {constraint.description && (
                  <span className="text-xs text-red-600 max-w-20 truncate">
                    {constraint.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role-specific information */}
      {session?.user?.role === 'GUIDE' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-start">
            <span className="text-green-500 text-lg ml-3">✅</span>
            <div>
              <h4 className="text-sm font-medium text-green-800 mb-1">
                סטטוס שלך
              </h4>
              <p className="text-xs text-green-700">
                {(stats[0]?.count || 0) + (stats[1]?.count || 0) === 0 
                  ? 'אין לך אילוצים פעילים כרגע'
                  : `יש לך ${(stats[0]?.count || 0) + (stats[1]?.count || 0)} אילוצים פעילים`
                }
              </p>
              {(stats[2]?.count || 0) > 0 && (
                <p className="text-xs text-green-700 mt-1">
                  {stats[2]?.count || 0} בקשות ממתינות לאישור רכז
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {(session?.user?.role === 'COORDINATOR' || session?.user?.role === 'ADMIN') && (
        <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
          <div className="flex items-start">
            <span className="text-purple-500 text-lg ml-3">👨‍💼</span>
            <div>
              <h4 className="text-sm font-medium text-purple-800 mb-1">
                מבט כללי
              </h4>
              <p className="text-xs text-purple-700">
                {session?.user?.role === 'COORDINATOR' 
                  ? 'ניהול אילוצים עבור המדריכים בבית שלך'
                  : 'ניהול אילוצים עבור כל הבתים'
                }
              </p>
              {(stats[2]?.count || 0) > 0 && (
                <p className="text-xs text-purple-700 mt-1 font-medium">
                  יש {stats[2]?.count || 0} בקשות הממתינות לאישור שלך
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats.every(stat => stat.count === 0) && (
        <div className="text-center py-8">
          <div className="text-4xl text-gray-300 mb-2">📋</div>
          <p className="text-gray-500 text-sm">אין אילוצים פעילים</p>
          <p className="text-gray-400 text-xs mt-1">
            התחל בהוספת אילוצים בכרטיסיות למעלה
          </p>
        </div>
      )}
    </div>
  );
}