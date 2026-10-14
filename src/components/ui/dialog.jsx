import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

function Dialog({ open, onOpenChange, children, ...props }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto w-[min(640px,calc(100vw-32px))] max-h-[calc(100vh-32px)] max-w-none overflow-visible border-0 bg-transparent p-0 backdrop:bg-tinta/55 backdrop:backdrop-blur-[2px]"
      {...props}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      {children}
    </dialog>
  );
}

function DialogContent({ className, ...props }) {
  return <div data-slot="dialog-content" className={cn('max-h-[calc(100svh-32px)] overflow-y-auto rounded-xl border border-border bg-card px-7 pt-7 pb-6 shadow-[0_28px_80px_-24px_rgb(23_33_59_/_45%)] max-sm:px-5 max-sm:pt-5 max-sm:pb-5', className)} {...props} />;
}

function DialogHeader({ className, ...props }) {
  return <div data-slot="dialog-header" className={cn(className)} {...props} />;
}

function DialogTitle({ className, ...props }) {
  return <h2 data-slot="dialog-title" className={cn('m-0 text-2xl font-semibold tracking-tight text-tinta', className)} {...props} />;
}

function DialogDescription({ className, ...props }) {
  return <p data-slot="dialog-description" className={cn('mt-1.5 mb-0 text-sm leading-normal text-muted-foreground', className)} {...props} />;
}

function DialogFooter({ className, ...props }) {
  return <div data-slot="dialog-footer" className={cn(className)} {...props} />;
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
