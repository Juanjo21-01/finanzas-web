import { cn } from '@/lib/utils';

function Card({ className, ...props }) {
  return <section data-slot="card" className={cn('overflow-hidden border border-line bg-[#fffefa] shadow-[0_16px_40px_rgb(25_40_34_/_4%)]', className)} {...props} />;
}

function CardHeader({ className, ...props }) {
  return <div data-slot="card-header" className={cn(className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn('min-w-0 p-0', className)} {...props} />;
}

export { Card, CardHeader, CardContent };
