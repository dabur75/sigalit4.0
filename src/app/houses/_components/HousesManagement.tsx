"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { WeeklySchedule } from "./WeeklySchedule";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";

interface House {
  id: string;
  code: string;
  name: string;
  description: string;
  color: string;
  borderColor: string;
  headerGradient: string;
}

const houses: House[] = [
  {
    id: "dor",
    code: "dor",
    name: "בית דרור",
    description: "מרכז פעילות בית דרור - ניהול לוח זמנים שבועי",
    color: "blue",
    borderColor: "border-blue-200 dark:border-blue-800",
    headerGradient: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
  },
  {
    id: "chabatzelet",
    code: "chabatzelet",
    name: "בית חבצלת",
    description: "מרכז פעילות בית חבצלת - ניהול לוח זמנים שבועי",
    color: "green",
    borderColor: "border-green-200 dark:border-green-800",
    headerGradient: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
  }
];

export function HousesManagement() {
  const { data: session } = useSession();
  const [selectedHouse, setSelectedHouse] = useState<House>(houses[0]);

  // Check if user has permission to view houses
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'COORDINATOR')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sigalit-50 to-sigalit-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="container mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-sigalit-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-sigalit-900 dark:text-white mb-4">
              אין לך הרשאה לצפות בעמוד זה
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              רק מנהלים ורכזים יכולים לגשת לניהול בתים
            </p>
            <Button asChild>
              <a href="/dashboard">חזרה ללוח הבקרה</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sigalit-50 to-sigalit-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-sigalit-900 dark:text-white mb-4">
            ניהול בתים
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            ניהול לוחות זמנים שבועיים ופעילויות לכל בית
          </p>
        </div>

        {/* House Selector */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-sigalit-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                בחר בית:
              </span>
              <select 
                value={selectedHouse.id} 
                onChange={(e) => {
                  const house = houses.find(h => h.id === e.target.value);
                  if (house) setSelectedHouse(house);
                }}
                className="w-48 h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sigalit-500"
              >
                {houses.map((house) => (
                  <option key={house.id} value={house.id}>
                    {house.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Selected House */}
        <Card className={`border-2 ${selectedHouse.borderColor}`}>
          <CardHeader className={`bg-gradient-to-r ${selectedHouse.headerGradient}`}>
            <CardTitle className={`text-2xl font-bold text-${selectedHouse.color}-900 dark:text-${selectedHouse.color}-100`}>
              {selectedHouse.name}
            </CardTitle>
            <CardDescription className={`text-${selectedHouse.color}-700 dark:text-${selectedHouse.color}-300`}>
              {selectedHouse.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <WeeklySchedule houseId={selectedHouse.code} houseName={selectedHouse.name} />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex justify-center space-x-4 space-x-reverse">
          <Button 
            variant="outline" 
            size="lg"
            className="border-sigalit-500 text-sigalit-700 hover:bg-sigalit-50 dark:border-sigalit-400 dark:text-sigalit-300 dark:hover:bg-sigalit-900/20"
            asChild
          >
            <a href="/dashboard">חזרה ללוח הבקרה</a>
          </Button>
          
          {session.user.role === 'ADMIN' && (
            <Button 
              size="lg"
              className="bg-gold-500 hover:bg-gold-600 text-white"
              asChild
            >
              <a href="/dashboard/crew">ניהול צוות</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

