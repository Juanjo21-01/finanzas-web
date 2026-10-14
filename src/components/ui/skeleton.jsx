import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('animate-pulse bg-line/70 motion-reduce:animate-none', className)}
      {...props}
    />
  );
}

export { Skeleton };
