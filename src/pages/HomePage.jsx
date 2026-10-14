import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/context/AuthContext';

export function HomePage() {
  const { user } = useAuth();

  return (
    <section className="mx-auto w-full max-w-[1120px] pt-[70px] pb-[56px] max-[760px]:pt-[42px] max-[560px]:pt-[34px]" aria-labelledby="dashboard-title">
      <DashboardHeader name={user?.name?.split(' ')[0]} />
    </section>
  );
}
