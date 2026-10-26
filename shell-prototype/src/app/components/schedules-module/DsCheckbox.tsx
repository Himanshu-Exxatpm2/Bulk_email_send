import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import { cn } from '../ui/utils';

/** The design team's checkbox: indigo (#3f51b5) when checked or indeterminate. */
export function DsCheckbox({ className, checked, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={checked}
      className={cn(
        'peer size-4 shrink-0 rounded-[4px] border border-[#888888] bg-white shadow-xs outline-none transition-shadow focus-visible:ring-[3px] focus-visible:ring-[#3f51b5]/40 disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-[#3f51b5] data-[state=checked]:bg-[#3f51b5] data-[state=checked]:text-white data-[state=indeterminate]:border-[#3f51b5] data-[state=indeterminate]:bg-[#3f51b5] data-[state=indeterminate]:text-white',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current transition-none">
        {checked === 'indeterminate' ? <Minus className="size-3.5" strokeWidth={3} /> : <Check className="size-3.5" strokeWidth={3} />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
