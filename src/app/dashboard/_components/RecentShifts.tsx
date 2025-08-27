'use client';

import { api } from '~/trpc/react';
import { Card } from '~/app/_components/ui/card';
import { Button } from '~/app/_components/ui/button';

interface RecentShiftsProps {
  selectedHouseId: string | null;
  userRole: string;
  userHouseId: string | null;
}

export function RecentShifts({ selectedHouseId, userRole, userHouseId }: RecentShiftsProps) {
  const { data: shifts, isLoading } = api.sigalit.getShiftsByDateRange.useQuery({
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
    houseId: selectedHouseId ?? undefined
  });

  const { data: houses } = api.sigalit.getAllHouses.useQuery();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const getHouseColor = (houseCode: string) => {
    switch (houseCode) {
      case 'dor':
        return 'border-blue-200 bg-blue-50';
      case 'chabatzelet':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
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

  const getShiftTypeIcon = (type: string) => {
    switch (type) {
      case 'MORNING':
        return '🌅';
      case 'AFTERNOON':
        return '☀️';
      case 'EVENING':
        return '🌆';
      case 'NIGHT':
        return '🌙';
      default:
        return '📅';
    }
  };

  const getShiftTypeText = (type: string) => {
    switch (type) {
      case 'MORNING':
        return 'בוקר';
      case 'AFTERNOON':
        return 'צהריים';
      case 'EVENING':
        return 'ערב';
      case 'NIGHT':
        return 'לילה';
      default:
        return type;
    }
  };

  const formatDate = (date: Date) => {
    const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
    
    const day = hebrewDays[date.getDay()];
    const month = hebrewMonths[date.getMonth()];
    const dayOfMonth = date.getDate();
    
    return `יום ${day}, ${dayOfMonth} ב${month}`;
  };

  const filteredShifts = shifts?.slice(0, 5) || [];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          שיבוצים קרובים
          {selectedHouseId && houses && (
            <span className={`ml-2 px-2 py-1 rounded text-sm font-medium bg-gradient-to-r ${getHouseColor(houses.find(h => h.id === selectedHouseId)?.code || '').split(' ')[0]} text-white`}>
              {houses.find(h => h.id === selectedHouseId)?.name}
            </span>
          )}
        </h2>
        <Button variant="outline" className="text-sigalit-600 border-sigalit-300 hover:bg-sigalit-50">
          צפה בכל השיבוצים
        </Button>
      </div>

      {filteredShifts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📅</div>
          <p>אין שיבוצים קרובים</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredShifts.map((shift) => {
            const house = houses?.find(h => h.id === shift.houseId);
            return (
              <div
                key={shift.id}
                className={`p-4 rounded-lg border-2 ${getHouseColor(house?.code || '')} transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="text-2xl">
                      {getShiftTypeIcon(shift.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {shift.guide.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {shift.role} • {house?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {formatDate(new Date(shift.date))}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {getShiftTypeText(shift.type)}
                    </p>
                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      מאושר
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add Shift Button */}
      {(userRole === 'COORDINATOR' || userRole === 'ADMIN') && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
            ➕ הוסף שיבוץ חדש
          </Button>
        </div>
      )}
    </Card>
  );
}
