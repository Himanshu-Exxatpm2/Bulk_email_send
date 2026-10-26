/**
 * Network page header — Figma 370:1124.
 */

interface NetworkPageHeaderProps {
  initial: string;
  title: string;
  subtitle: string;
}

export function NetworkPageHeader({ initial, title, subtitle }: NetworkPageHeaderProps) {
  return (
    <div className="flex items-center gap-4 border-b border-[#e5e7eb] bg-white px-6 py-[18px]">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eeeffa]">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-[#3f51b5]">
          <span className="text-base font-bold leading-none text-[#f7f8f8]">{initial}</span>
        </div>
      </div>
      <div className="min-w-0">
        <h1 className="text-[22px] font-medium leading-tight text-[#111827]">{title}</h1>
        <p className="mt-0.5 text-sm text-[#6b7280]">{subtitle}</p>
      </div>
    </div>
  );
}
