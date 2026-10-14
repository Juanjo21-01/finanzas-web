import { lazy, Suspense, useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

const DashboardExpensesByCategory = lazy(() => import('@/components/DashboardExpensesByCategory')
  .then((module) => ({ default: module.DashboardExpensesByCategory })));

export function HomePage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState(() => {
    const today = new Date();
    return {
      year: String(today.getFullYear()),
      month: String(today.getMonth() + 1),
    };
  });

  return (
    <section className="mx-auto w-full max-w-[1120px] pt-[70px] pb-[56px] max-[760px]:pt-[42px] max-[560px]:pt-[34px]" aria-labelledby="dashboard-title">
      <DashboardHeader
        name={user?.name?.split(' ')[0]}
        period={period}
        onPeriodChange={setPeriod}
      />
      <Suspense fallback={<Skeleton className="mt-6 h-[300px] w-full" />}>
        <DashboardExpensesByCategory key={`${period.year}-${period.month}`} period={period} />
      </Suspense>
    </section>
  );
}
