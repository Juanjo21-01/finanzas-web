import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-renglon/60 motion-reduce:animate-none', className)}
      {...props}
    />
  );
}

export { Skeleton };
