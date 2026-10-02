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
      className="fixed inset-0 m-auto w-[min(640px,calc(100vw-32px))] max-h-[calc(100vh-32px)] max-w-none overflow-visible border-0 bg-transparent p-0 backdrop:bg-[rgb(14_31_24_/_58%)] backdrop:backdrop-blur-[2px]"
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
  return <div data-slot="dialog-content" className={cn('max-h-[calc(100svh-32px)] overflow-y-auto border border-white/55 bg-[#fffefa] px-[27px] pt-[25px] pb-[23px] shadow-[0_28px_90px_rgb(5_20_14_/_28%)] max-[560px]:px-[18px] max-[560px]:pt-[21px] max-[560px]:pb-[18px]', className)} {...props} />;
}

function DialogHeader({ className, ...props }) {
  return <div data-slot="dialog-header" className={cn(className)} {...props} />;
}

function DialogTitle({ className, ...props }) {
  return <h2 data-slot="dialog-title" className={cn('m-0 font-[Georgia,Times_New_Roman,serif] text-[29px] font-normal tracking-[-0.04em] text-[#24382e]', className)} {...props} />;
}

function DialogDescription({ className, ...props }) {
  return <p data-slot="dialog-description" className={cn('mt-[6px] mb-0 text-[11px] leading-[1.5] text-muted-copy', className)} {...props} />;
}

function DialogFooter({ className, ...props }) {
  return <div data-slot="dialog-footer" className={cn(className)} {...props} />;
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
