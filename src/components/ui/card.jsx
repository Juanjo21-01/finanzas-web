import { cn } from '@/lib/utils';

function Card({ className, ...props }) {
  return <section data-slot="card" className={cn('overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-hoja', className)} {...props} />;
}

function CardHeader({ className, ...props }) {
  return <div data-slot="card-header" className={cn(className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn('min-w-0 p-0', className)} {...props} />;
}

export { Card, CardHeader, CardContent };
