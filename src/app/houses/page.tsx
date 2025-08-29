import { Suspense } from 'react';
import { HousesManagement } from './_components/HousesManagement';
import { HousesSkeleton } from './_components/HousesSkeleton';

export default function HousesPage() {
  return (
    <Suspense fallback={<HousesSkeleton />}>
      <HousesManagement />
    </Suspense>
  );
}


