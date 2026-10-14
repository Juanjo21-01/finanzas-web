import { lazy, Suspense, useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

const DashboardExpensesByCategory = lazy(() => import('@/components/DashboardExpensesByCategory')
  .then((module) => ({ default: module.DashboardExpensesByCategory })));

const DashboardAnnualEvolution = lazy(() => import('@/components/DashboardAnnualEvolution')
  .then((module) => ({ default: module.DashboardAnnualEvolution })));

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
    <section className="mx-auto w-full max-w-[1120px] pt-10 pb-14 md:pt-14" aria-labelledby="dashboard-title">
      <DashboardHeader
        name={user?.name?.split(' ')[0]}
        period={period}
        onPeriodChange={setPeriod}
      />
      <Suspense fallback={<Skeleton className="mt-6 h-[300px] w-full rounded-xl" />}>
        <DashboardExpensesByCategory key={`${period.year}-${period.month}`} period={period} />
      </Suspense>
      <Suspense fallback={<Skeleton className="mt-6 h-[300px] w-full rounded-xl" />}>
        <DashboardAnnualEvolution key={period.year} year={period.year} />
      </Suspense>
    </section>
  );
}
