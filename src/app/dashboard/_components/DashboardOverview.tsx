'use client';

import { api } from '~/trpc/react';
import { Card } from '~/app/_components/ui/card';

interface DashboardOverviewProps {
  selectedHouseId: string | null;
  userRole: string;
  userHouseId: string | null;
}

export function DashboardOverview({ selectedHouseId, userRole, userHouseId }: DashboardOverviewProps) {
  const { data: stats, isLoading } = api.sigalit.getDashboardStats.useQuery({
    houseId: selectedHouseId || undefined
  });

  const { data: houses } = api.sigalit.getAllHouses.useQuery();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const getHouseColor = (houseCode: string) => {
    switch (houseCode) {
      case 'dor':
        return 'from-blue-500 to-blue-600';
      case 'chabatzelet':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getHouseBorderColor = (houseCode: string) => {
    switch (houseCode) {
      case 'dor':
        return 'border-blue-200';
      case 'chabatzelet':
        return 'border-green-200';
      default:
        return 'border-gray-200';
    }
  };

  const getHouseTextColor = (houseCode: string) => {
    switch (houseCode) {
      case 'dor':
        return 'text-blue-700';
      case 'chabatzelet':
        return 'text-green-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          סקירה כללית
          {selectedHouseId && houses && (
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getHouseColor(houses.find(h => h.id === selectedHouseId)?.code ?? '')} text-white`}>
              {houses.find(h => h.id === selectedHouseId)?.name}
            </span>
          )}
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-sigalit-500 to-sigalit-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">משתמשים</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
            <div className="mt-2 text-xs opacity-75">
              {selectedHouseId ? 'בבית זה' : 'סה"כ במערכת'}
            </div>
          </div>

          {/* Total Shifts */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">שיבוצים</p>
                <p className="text-2xl font-bold">{stats?.totalShifts || 0}</p>
              </div>
              <div className="text-3xl">📅</div>
            </div>
            <div className="mt-2 text-xs opacity-75">
              {selectedHouseId ? 'בבית זה' : 'סה"כ במערכת'}
            </div>
          </div>

          {/* Total Houses */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">בתים</p>
                <p className="text-2xl font-bold">{stats?.totalHouses || 0}</p>
              </div>
              <div className="text-3xl">🏠</div>
            </div>
            <div className="mt-2 text-xs opacity-75">פעילים</div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">ממתין לאישור</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
            <div className="mt-2 text-xs opacity-75">הכל מאושר</div>
          </div>
        </div>
      </Card>

      {/* House Distribution */}
      {!selectedHouseId && houses && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            התפלגות מדריכים לפי בתים
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {houses.map((house) => (
              <div
                key={house.id}
                className={`p-4 rounded-lg border-2 ${getHouseBorderColor(house.code)} bg-gradient-to-r ${getHouseColor(house.code)} bg-opacity-10`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${getHouseTextColor(house.code)}`}>
                      {house.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {house.description}
                    </p>
                  </div>
                  <div className={`text-2xl font-bold ${getHouseTextColor(house.code)}`}>
                    0
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Shifts by Type */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          שיבוצים לפי סוג
          {selectedHouseId && houses && (
            <span className={`ml-2 px-2 py-1 rounded text-sm font-medium bg-gradient-to-r ${getHouseColor(houses.find(h => h.id === selectedHouseId)?.code || '')} text-white`}>
              {houses.find(h => h.id === selectedHouseId)?.name}
            </span>
          )}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🌅</div>
            <div className="font-semibold text-amber-700">בוקר</div>
            <div className="text-2xl font-bold text-amber-800">5</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">☀️</div>
            <div className="font-semibold text-orange-700">צהריים</div>
            <div className="text-2xl font-bold text-orange-800">5</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🌆</div>
            <div className="font-semibold text-purple-700">ערב</div>
            <div className="text-2xl font-bold text-purple-800">0</div>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🌙</div>
            <div className="font-semibold text-indigo-700">לילה</div>
            <div className="text-2xl font-bold text-indigo-800">0</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
