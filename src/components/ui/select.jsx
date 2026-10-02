import { cn } from '@/lib/utils';

function Select({ className, ...props }) {
  return (
    <select
      data-slot="select"
      className={cn('block h-[38px] min-w-0 rounded-[2px] border border-line bg-[#fffefa] px-[10px] text-[12px] text-ink hover:border-[#b8c2b3] focus:border-[#77934a] focus:outline-[3px] focus:outline-[rgb(132_169_58_/_13%)] aria-[invalid=true]:border-error-copy', className)}
      {...props}
    />
  );
}

export { Select };
