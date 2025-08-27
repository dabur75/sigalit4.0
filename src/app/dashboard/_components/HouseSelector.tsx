'use client';

import { api } from '~/trpc/react';
import { Card } from '~/app/_components/ui/card';

interface HouseSelectorProps {
  selectedHouseId: string | null;
  onHouseChange: (houseId: string | null) => void;
  userRole: string;
}

export function HouseSelector({ selectedHouseId, onHouseChange, userRole }: HouseSelectorProps) {
  const { data: houses, isLoading } = api.sigalit.getAllHouses.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4 space-x-reverse">
        <span className="text-sm text-gray-600">טוען בתים...</span>
      </div>
    );
  }

  if (!houses || houses.length === 0) {
    return (
      <div className="flex items-center space-x-4 space-x-reverse">
        <span className="text-sm text-gray-600">אין בתים זמינים</span>
      </div>
    );
  }

  const getHouseColor = (houseCode: string) => {
    switch (houseCode) {
      case 'dor':
        return 'border-blue-500 bg-blue-50';
      case 'chabatzelet':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
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
    <div className="flex items-center space-x-4 space-x-reverse">
      <span className="text-sm font-medium text-gray-700">
        {userRole === 'ADMIN' ? 'בחר בית לצפייה:' : 'בחר בית לניהול:'}
      </span>
      
      <div className="flex space-x-3 space-x-reverse">
        {/* All Houses Option */}
        <button
          onClick={() => onHouseChange(null)}
          className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 shadow-sm ${
            selectedHouseId === null
              ? 'border-purple-500 bg-purple-100 text-purple-700 shadow-md'
              : 'border-gray-300 bg-white text-gray-600 hover:border-purple-300 hover:shadow-md'
          }`}
        >
          כל הבתים
        </button>

        {/* Individual Houses */}
        {houses.map((house) => (
          <button
            key={house.id}
            onClick={() => onHouseChange(house.id)}
            className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 shadow-sm ${
              selectedHouseId === house.id
                ? `${getHouseColor(house.code)} ${getHouseTextColor(house.code)} shadow-md`
                : `border-gray-300 bg-white text-gray-600 hover:${getHouseColor(house.code).split(' ')[0]} hover:shadow-md`
            }`}
          >
            {house.name}
          </button>
        ))}
      </div>

      {/* Selected House Info */}
      {selectedHouseId && (
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-sm text-gray-500">|</span>
          <span className="text-sm text-gray-600">
            בית נבחר: {houses.find(h => h.id === selectedHouseId)?.name}
          </span>
        </div>
      )}
    </div>
  );
}
