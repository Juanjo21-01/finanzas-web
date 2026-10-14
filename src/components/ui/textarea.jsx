import { cn } from '@/lib/utils';

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn('block min-h-24 w-full resize-y py-2.5 leading-relaxed min-w-0 rounded-md border border-input bg-card px-3 text-sm text-foreground transition-[border-color,box-shadow] duration-150 placeholder:text-tinta-suave/70 hover:border-tinta-suave focus:border-ring focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--color-ingreso),transparent_82%)] disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive', className)}
      {...props}
    />
  );
}

export { Textarea };
