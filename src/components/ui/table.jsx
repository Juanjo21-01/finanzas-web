import { cn } from '@/lib/utils';

// Estos wrappers conservan la semántica de la tabla y comparten los estilos de shadcn/ui.
function Table({ className, ...props }) {
  return (
    <div data-slot="table-container" className="ui-table-container">
      <table data-slot="table" className={cn('ui-table', className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }) {
  return <thead data-slot="table-header" className={cn('ui-table-header', className)} {...props} />;
}

function TableBody({ className, ...props }) {
  return <tbody data-slot="table-body" className={cn('ui-table-body', className)} {...props} />;
}

function TableRow({ className, ...props }) {
  return <tr data-slot="table-row" className={cn('ui-table-row', className)} {...props} />;
}

function TableHead({ className, ...props }) {
  return <th data-slot="table-head" className={cn('ui-table-head', className)} {...props} />;
}

function TableCell({ className, ...props }) {
  return <td data-slot="table-cell" className={cn('ui-table-cell', className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
