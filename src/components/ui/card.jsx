import { cn } from '@/lib/utils';

function Card({ className, ...props }) {
  return <section data-slot="card" className={cn('ui-card', className)} {...props} />;
}

function CardHeader({ className, ...props }) {
  return <div data-slot="card-header" className={cn('ui-card-header', className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn('ui-card-content', className)} {...props} />;
}

export { Card, CardHeader, CardContent };
