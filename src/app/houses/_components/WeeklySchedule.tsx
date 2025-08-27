"use client";



interface WeeklyScheduleProps {
  houseId: string;
  houseName: string;
}

export function WeeklySchedule({ houseName }: WeeklyScheduleProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        לו&ldquo;ז שבועי גמיש - {houseName}
      </h3>
      
      <div className="text-center text-gray-600 dark:text-gray-400">
        <p>לוח זמנים שבועי עבור {houseName}</p>
        <p className="mt-2">כאן יוצג הלו&ldquo;ז השבועי המלא</p>
      </div>
    </div>
  );
}
