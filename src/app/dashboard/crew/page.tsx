import { Suspense } from 'react';
import { CrewManagement } from './_components/CrewManagement';
import { DashboardSkeleton } from '../_components/DashboardSkeleton';

export default function CrewPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <CrewManagement />
    </Suspense>
  );
}