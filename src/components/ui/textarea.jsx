import { cn } from '@/lib/utils';

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn('block min-h-20 min-w-0 resize-y rounded-[2px] border border-line bg-[#fffefa] p-[10px] text-[12px] leading-[1.55] text-ink placeholder:text-[#a4aaa4] focus:border-[#77934a] focus:outline-[3px] focus:outline-[rgb(132_169_58_/_13%)] aria-[invalid=true]:border-error-copy', className)}
      {...props}
    />
  );
}

export { Textarea };
