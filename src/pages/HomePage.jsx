import { useAuth } from '@/context/AuthContext';

export function HomePage() {
  const { user } = useAuth();

  return (
    <section className="mx-auto mt-[clamp(32px,6vh,55px)] max-w-[760px] border border-line border-t-[3px] border-t-leaf bg-[#fffefa] px-[clamp(26px,6vw,76px)] py-[50px] shadow-[0_22px_60px_rgb(25_40_34_/_5%)] min-[761px]:mt-[clamp(72px,12vh,128px)] max-[430px]:px-[25px] max-[430px]:py-[38px]">
      <p className="m-0 flex items-center gap-[9px] font-mono text-[10px] leading-[1.6] font-semibold tracking-[0.085em] text-[#64796a] uppercase">TU ESPACIO FINANCIERO</p>
      <h1 className="mt-[23px] mb-[9px] font-[Georgia,Times_New_Roman,serif] text-[clamp(42px,6vw,64px)] leading-[1.08] font-normal tracking-[-0.052em] text-ink">Hola, {user?.name?.split(' ')[0]}.</h1>
      <p className="mt-[11px] mb-0 text-[14px] leading-[1.7] text-muted-copy">Tu sesión está activa. Aquí podrás consultar y organizar tus finanzas.</p>
      <div className="mt-[35px] flex items-center gap-[9px] border-t border-[#e8e9e2] pt-[18px] font-mono text-[10px] tracking-[0.04em] text-[#66766c]"><span className="size-[6px] rounded-full bg-[#8fb650] shadow-[0_0_0_3px_rgb(143_182_80_/_12%)]" /> Sesión segura y activa</div>
    </section>
  );
}
