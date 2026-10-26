/**
 * Exxat One wordmark — matches the product header chrome.
 * `sites` / `schools` add the small product sublabel seen in the live headers.
 */
interface ExxatOneLogoProps {
  variant?: 'sites' | 'schools' | 'plain' | 'network' | 'mark';
  className?: string;
}

const SUBLABEL: Partial<Record<NonNullable<ExxatOneLogoProps['variant']>, string>> = {
  sites: 'FOR SITES',
  schools: 'FOR SCHOOLS',
};

export function ExxatOneLogo({ variant = 'plain', className = '' }: ExxatOneLogoProps) {
  if (variant === 'mark') {
    return (
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-magenta text-neutral-0 text-[11px] font-bold ${className}`}
        aria-hidden
      >
        E
      </span>
    );
  }

  const sublabel = SUBLABEL[variant];

  return (
    <div className={`flex flex-col leading-none ${className}`}>
      <div className="flex items-baseline gap-0.5">
        <span className="text-[15px] font-semibold text-neutral-850 tracking-tight">Exxat</span>
        <span className="text-[15px] font-semibold text-brand-magenta tracking-tight">One</span>
      </div>
      {sublabel && (
        <span className="text-[8px] font-semibold uppercase tracking-[0.08em] text-neutral-700 mt-0.5 pl-[0.5px]">
          {sublabel}
        </span>
      )}
    </div>
  );
}
