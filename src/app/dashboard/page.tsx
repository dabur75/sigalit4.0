import { Suspense } from 'react';
import { DashboardContent } from './_components/DashboardContent';
import { DashboardSkeleton } from './_components/DashboardSkeleton';

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
