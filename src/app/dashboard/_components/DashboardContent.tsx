'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { DashboardOverview } from './DashboardOverview';
import { RecentShifts } from './RecentShifts';
import { QuickActions } from './QuickActions';
import { HouseSelector } from './HouseSelector';
import { useState } from 'react';

export function DashboardContent() {
  const { data: session, status } = useSession();
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);

  if (status === 'loading') {
    return <div>טוען...</div>;
  }

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const userRole = session.user.role;
  const userHouseId = session.user.houseId;

  // Set default house selection based on user role
  if (!selectedHouseId && userRole === 'GUIDE') {
    setSelectedHouseId(userHouseId ?? null);
  }

  return (
    <div className="min-h-screen" style={{background: '#fafafa'}}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl text-white font-bold">ס</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Sigalit
                </h1>
                <p className="text-gray-500 text-sm">עמוד מערכת</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  שלום, {session.user.name ?? session.user.email}
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {userRole === 'ADMIN' ? 'מנהל מערכת' : 
                   userRole === 'COORDINATOR' ? 'רכז' : 'מדריך'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* House Selector for Coordinators and Admins */}
      {(userRole === 'COORDINATOR' || userRole === 'ADMIN') && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <HouseSelector 
              selectedHouseId={selectedHouseId}
              onHouseChange={setSelectedHouseId}
              userRole={userRole}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Overview */}
          <div className="lg:col-span-2 space-y-8">
            <DashboardOverview 
              selectedHouseId={selectedHouseId}
              userRole={userRole}
              userHouseId={userHouseId ?? null}
            />
            <RecentShifts 
              selectedHouseId={selectedHouseId}
              userRole={userRole}
              userHouseId={userHouseId ?? null}
            />
          </div>

          {/* Right Column - Quick Actions */}
          <div className="lg:col-span-1">
            <QuickActions 
              userRole={userRole} 
              selectedHouseId={selectedHouseId}
              userHouseId={userHouseId ?? null}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
