"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";

export function RecentShifts() {
  // Mock data - in real app this would come from tRPC
  const recentShifts = [
    {
      id: "1",
      date: "2024-08-26",
      guideName: "מדריך ראשון",
      role: "מדריך קבוצה",
      type: "MORNING",
      houseName: "בית ראשון",
      status: "confirmed"
    },
    {
      id: "2",
      date: "2024-08-26",
      guideName: "מדריך שני",
      role: "מדריך פעילות",
      type: "AFTERNOON",
      houseName: "בית ראשון",
      status: "confirmed"
    },
    {
      id: "3",
      date: "2024-08-27",
      guideName: "מדריך ראשון",
      role: "מדריך קבוצה",
      type: "MORNING",
      houseName: "בית ראשון",
      status: "pending"
    },
    {
      id: "4",
      date: "2024-08-27",
      guideName: "מדריך שלישי",
      role: "מדריך פעילות",
      type: "AFTERNOON",
      houseName: "בית שני",
      status: "confirmed"
    }
  ];

  const getShiftTypeText = (type: string) => {
    switch (type) {
      case "MORNING": return "בוקר";
      case "AFTERNOON": return "צהריים";
      case "EVENING": return "ערב";
      case "NIGHT": return "לילה";
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "confirmed") {
      return (
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
          מאושר
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
        ממתין לאישור
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "היום";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "מחר";
    } else {
      return date.toLocaleDateString('he-IL', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-sigalit-900 dark:text-white">
          שיבוצים קרובים
        </h2>
        <Button className="bg-sigalit-500 hover:bg-sigalit-600">
          צפה בכל השיבוצים
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-sigalit-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-sigalit-900 dark:text-white">
            השבוע הקרוב
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            שיבוצים מתוכננים לימים הקרובים
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentShifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-12 h-12 bg-gradient-to-br from-sigalit-500 to-sigalit-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {getShiftTypeText(shift.type).charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-sigalit-900 dark:text-white">
                      {shift.guideName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {shift.role} • {shift.houseName}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium text-sigalit-900 dark:text-white">
                    {formatDate(shift.date)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getShiftTypeText(shift.type)}
                  </div>
                  <div className="mt-1">
                    {getStatusBadge(shift.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
