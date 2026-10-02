import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, ChartLineUp, Wallet } from '@phosphor-icons/react';

const brandClasses = 'inline-flex w-fit items-center gap-[10px] text-[21px] font-bold tracking-[-1.3px] text-ink no-underline';
const brandMarkClasses = 'grid size-8 place-items-center rounded-[10px_10px_10px_2px] bg-leaf text-[19px] text-forest';
const eyebrowClasses = 'm-0 flex items-center gap-[9px] font-mono text-[10px] leading-[1.6] font-semibold tracking-[0.085em] uppercase';
const dotClasses = 'inline-block size-[7px] shrink-0 rounded-full bg-leaf shadow-[0_0_0_4px_rgb(201_237_119_/_12%)]';

export function AuthLayout({ mode, title, description, children }) {
  const isLogin = mode === 'login';

  return (
    <main className="grid min-h-screen grid-cols-[minmax(360px,0.94fr)_minmax(450px,1.06fr)] bg-paper min-h-svh max-[880px]:grid-cols-[minmax(300px,0.84fr)_minmax(420px,1.16fr)] max-[700px]:block">
      <aside className="isolate relative flex min-h-full flex-col overflow-hidden bg-forest p-[clamp(32px,5.2vw,76px)] text-[#f5f6eb] max-[880px]:p-[30px] max-[700px]:hidden" aria-label="Finanzas personales con claridad">
        <span className="pointer-events-none absolute -z-10 top-[21%] right-[-24%] aspect-square w-[min(43vw,560px)] rounded-full border border-[rgb(201_237_119_/_15%)] shadow-[0_0_0_45px_rgb(201_237_119_/_3%),0_0_0_90px_rgb(201_237_119_/_2%)]" />
        <span className="pointer-events-none absolute -z-10 inset-x-0 bottom-0 h-[35%] opacity-25 bg-[linear-gradient(rgb(217_231_198_/_8%)_1px,transparent_1px),linear-gradient(90deg,rgb(217_231_198_/_8%)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:linear-gradient(transparent,black)]" />

        <Link className={`${brandClasses} text-[#f6f7ec]`} to={isLogin ? '/login' : '/register'}>
          <span className={brandMarkClasses}><ChartLineUp weight="bold" /></span>
          <span>saldo<span className="text-[#94bb46]">.</span></span>
        </Link>

        <div className="mt-[clamp(72px,11vh,132px)] max-w-[520px] max-[880px]:mt-[90px]">
          <p className={`${eyebrowClasses} text-[#f5f6eb]`}><span className={dotClasses} /> Finanzas personales, a tu ritmo</p>
          <h2 className="mt-[28px] mb-[18px] font-[Georgia,Times_New_Roman,serif] text-[clamp(43px,5.4vw,72px)] leading-[0.99] font-normal tracking-[-0.055em] max-[880px]:text-[clamp(41px,5vw,56px)]">
            Que tus números<br />cuenten <em className="font-normal text-leaf">tu historia.</em>
          </h2>
          <p className="m-0 max-w-[360px] text-[14px] leading-[1.75] text-[#bdcbc0]">
            Un espacio sencillo para entender tus hábitos y decidir con más calma.
          </p>
        </div>

        <div className="relative my-auto mt-auto mb-6 ml-[10%] w-[min(100%,420px)] rotate-[-1.2deg] rounded-[3px] border border-[rgb(232_237_221_/_17%)] bg-[rgb(248_250_239_/_8%)] px-[23px] pt-[22px] pb-[18px] text-[#e8eddd] shadow-[0_20px_50px_rgb(7_26_21_/_14%)] backdrop-blur-[12px] max-[880px]:ml-0" aria-hidden="true">
          <div className="flex items-center justify-between">
            <span className="grid size-[30px] place-items-center text-[18px] text-leaf"><Wallet weight="duotone" /></span>
            <span className="ml-[10px] flex-1 font-mono text-[9px] font-medium tracking-[0.08em] text-[#bdcbc0]">TU MES, EN PERSPECTIVA</span>
            <span className="grid size-[30px] place-items-center text-[16px] text-leaf"><ArrowUpRight /></span>
          </div>
          <div className="mt-[17px] mb-[13px] text-[clamp(27px,3vw,34px)] font-medium tracking-[-0.06em]">Q 8,420<span className="text-[0.62em] text-[#aab8aa]">.50</span></div>
          <div className="flex items-center justify-between text-[10px] text-[#bdcbc0]">
            <span className="flex items-center gap-[7px]"><i className="size-[6px] rounded-full bg-[#f0bd63]" /> Balance disponible</span>
            <span className="flex items-center gap-1 text-leaf"><Check weight="bold" /> al día</span>
          </div>
          <div className="mt-5 flex h-[47px] items-end justify-between border-b border-[rgb(232_237_221_/_17%)]">
            {[34, 48, 40, 66, 54, 76, 62, 90, 69, 82, 58, 72].map((height, index) => (
              <span
                key={index}
                className={`h-[var(--bar-height)] w-[5.5%] rounded-t-[2px] bg-leaf opacity-70 ${index % 3 === 2 ? 'opacity-[0.37]' : ''} ${index === 7 ? 'bg-[#f0bd63] opacity-100' : ''}`}
                style={{ '--bar-height': `${height}%` }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 font-mono text-[8px] font-medium tracking-[0.08em] text-[#99aa9e]"><span>JUN</span><span>JUL</span><span>AGO</span><span>SEP</span></div>
        </div>

        <p className="mt-[18px] mb-0 font-mono text-[9px] font-medium tracking-[0.08em] text-[#aebdb1]">CLARIDAD PARA CADA DECISIÓN</p>
      </aside>

      <section className="flex min-h-full flex-col px-[clamp(28px,5vw,72px)] pt-8 pb-[25px] max-[880px]:px-[34px] max-[700px]:min-h-screen max-[700px]:px-6 max-[700px]:pt-[22px] max-[700px]:pb-5 max-[700px]:min-h-svh max-[430px]:px-[19px]">
        <div className="flex min-h-[34px] items-center justify-end max-[700px]:justify-between">
          <span className={`${brandClasses} hidden max-[700px]:inline-flex max-[430px]:gap-[7px] max-[430px]:text-[19px]`}>
            <span className={`${brandMarkClasses} max-[430px]:size-[29px]`}><ChartLineUp weight="bold" /></span>
            <span>saldo<span className="text-[#94bb46]">.</span></span>
          </span>
          <p className="m-0 text-[12px] text-muted-copy max-[700px]:text-[11px] max-[430px]:text-[10px]">
            {isLogin ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?'}{' '}
            <Link className="ml-1 inline-flex items-center gap-0.5 font-bold text-forest no-underline" to={isLogin ? '/register' : '/login'}>
              {isLogin ? 'Regístrate' : 'Inicia sesión'}
              <ArrowUpRight className="text-[13px]" weight="bold" />
            </Link>
          </p>
        </div>

        <div className="m-auto w-full max-w-[420px] pt-[52px] pb-[42px] max-[700px]:max-w-[430px] max-[700px]:pt-[56px] max-[700px]:pb-[42px] max-[430px]:pt-12">
          <div className="mb-[31px]">
            <p className={`${eyebrowClasses} text-[#64796a]`}>{isLogin ? 'BIENVENIDO DE VUELTA' : 'EMPIEZA POR AQUÍ'}</p>
            <h1 className="mt-[17px] mb-[9px] font-[Georgia,Times_New_Roman,serif] text-[clamp(35px,4vw,46px)] leading-[1.08] font-normal tracking-[-0.052em] text-ink max-[700px]:text-[41px]">{title}</h1>
            <p className="m-0 text-[13px] leading-[1.65] text-muted-copy">{description}</p>
          </div>
          {children}
          <p className={`${isLogin ? 'mt-[25px]' : 'mt-[17px]'} mb-0 flex items-center justify-center gap-[9px] text-[10px] text-[#8c958e] max-[430px]:items-start max-[430px]:text-center max-[430px]:leading-[1.5]`}><span className={`${dotClasses} size-[6px] bg-[#86a74d] shadow-[0_0_0_3px_rgb(134_167_77_/_12%)]`} /> Tu espacio financiero queda vinculado a esta cuenta.</p>
        </div>

        <div className="flex justify-between gap-[15px] font-mono text-[8px] tracking-[0.08em] text-[#9ba19a] max-[700px]:text-[7px]">
          <span>© 2026 SALDO</span>
          <span>HECHO PARA VERLO CLARO</span>
        </div>
      </section>
    </main>
  );
}
