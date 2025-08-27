'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ShiftDashboard } from './_components/ShiftDashboard';
import { useState } from 'react';

export default function ShiftPage() {
  const { data: session, status } = useSession();
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sigalit-50 to-sigalit-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-2xl text-sigalit-600 dark:text-sigalit-400">טוען...</div>
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-sigalit-50 to-sigalit-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-sigalit-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-br from-sigalit-500 to-sigalit-600 rounded-full flex items-center justify-center">
                <span className="text-2xl text-white font-bold">ס</span>
              </div>
              <h1 className="text-2xl font-bold text-sigalit-900 dark:text-white">
                עמוד משמרת - Sigalit
              </h1>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                שלום, {session.user.name ?? session.user.email}
              </span>
              <span className="px-3 py-1 bg-sigalit-100 dark:bg-sigalit-900/30 text-sigalit-700 dark:text-sigalit-300 rounded-full text-sm font-medium">
                {userRole === 'ADMIN' ? 'מנהל' : 
                 userRole === 'COORDINATOR' ? 'רכז' : 'מדריך'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <ShiftDashboard 
          selectedHouseId={selectedHouseId}
          onHouseChange={setSelectedHouseId}
          userRole={userRole}
          userHouseId={userHouseId ?? null}
        />
      </main>
    </div>
  );
}
