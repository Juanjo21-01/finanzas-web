import { cn } from '@/lib/utils';

function Table({ className, ...props }) {
  return (
    <div data-slot="table-container" className="w-full overflow-x-auto">
      <table data-slot="table" className={cn('w-full min-w-[860px] border-collapse text-left', className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }) {
  return <thead data-slot="table-header" className={cn(className)} {...props} />;
}

function TableBody({ className, ...props }) {
  return <tbody data-slot="table-body" className={cn('[&>tr:not(:last-child)>td]:border-b [&>tr:not(:last-child)>td]:border-[#edeee8]', className)} {...props} />;
}

function TableRow({ className, ...props }) {
  return <tr data-slot="table-row" className={cn('hover:bg-[#fbfcf8]', className)} {...props} />;
}

function TableHead({ className, ...props }) {
  return <th data-slot="table-head" className={cn('h-[42px] border-b border-[#e9eae3] bg-[#fafaf6] px-[15px] text-left text-[9px] font-bold tracking-[0.06em] text-[#7a867d] uppercase', className)} {...props} />;
}

function TableCell({ className, ...props }) {
  return <td data-slot="table-cell" className={cn('h-[59px] px-[15px] py-[9px] align-middle text-[11px] text-[#405047]', className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
