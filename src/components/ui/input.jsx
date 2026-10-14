import { cn } from '@/lib/utils';

function Input({ className, type = 'text', ...props }) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn('block h-10 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm text-foreground transition-[border-color,box-shadow] duration-150 placeholder:text-tinta-suave/70 hover:border-tinta-suave focus:border-ring focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--color-ingreso),transparent_82%)] disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive', className)}
      {...props}
    />
  );
}

export { Input };
