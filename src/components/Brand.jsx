import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/* Marca: el doble subrayado de un total de libro contable. `inverted` la
   adapta a fondos oscuros. */
export function BrandMark({ className, inverted = false }) {
  return (
    <span
      className={cn('grid size-8 shrink-0 place-items-center rounded-lg', inverted ? 'bg-marcador' : 'bg-tinta', className)}
      aria-hidden="true"
    >
      <span className="grid gap-[3px]">
        <span className={cn('h-[3px] w-4 rounded-full', inverted ? 'bg-tinta' : 'bg-marcador')} />
        <span className={cn('h-[3px] w-4 rounded-full', inverted ? 'bg-tinta' : 'bg-marcador')} />
      </span>
    </span>
  );
}

export function Brand({ to = '/', inverted = false, className, ...props }) {
  return (
    <Link
      to={to}
      className={cn('inline-flex w-fit items-center gap-2.5 rounded-md font-display text-xl font-bold tracking-tight no-underline', inverted ? 'text-hoja' : 'text-tinta', className)}
      {...props}
    >
      <BrandMark inverted={inverted} />
      <span>saldo</span>
    </Link>
  );
}
