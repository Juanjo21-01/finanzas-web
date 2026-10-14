import { cn } from '@/lib/utils';

function Table({ className, ...props }) {
  return (
    <div data-slot="table-container" className="w-full overflow-x-auto">
      <table data-slot="table" className={cn('w-full min-w-[640px] border-collapse text-left', className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }) {
  return <thead data-slot="table-header" className={cn(className)} {...props} />;
}

function TableBody({ className, ...props }) {
  return <tbody data-slot="table-body" className={cn('[&>tr:not(:last-child)>td]:renglon', className)} {...props} />;
}

function TableFooter({ className, ...props }) {
  return <tfoot data-slot="table-footer" className={cn('border-t-2 border-tinta bg-papel/60', className)} {...props} />;
}

function TableRow({ className, ...props }) {
  return <tr data-slot="table-row" className={cn('transition-colors hover:bg-papel/70', className)} {...props} />;
}

function TableHead({ className, ...props }) {
  return <th data-slot="table-head" className={cn('eyebrow h-11 border-b border-tinta/70 bg-papel/60 px-4 text-left', className)} {...props} />;
}

function TableCell({ className, ...props }) {
  return <td data-slot="table-cell" className={cn('h-14 px-4 py-2 align-middle text-sm text-foreground', className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell };
