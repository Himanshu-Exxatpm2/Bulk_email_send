/**
 * Network Overview dashboard body — Toolbar + KPI Grid + Funnel + charts.
 * Figma: 370:1135 Toolbar, 370:1145 KPI Grid.
 */

import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import {
  Building2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileDown,
  FileUser,
  GraduationCap,
  MonitorCheck,
  PlusCircle,
  RotateCcw,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { PlacementFunnelHero } from '../../components/network/PlacementFunnelHero';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  networkKpiTiles,
  networkDashboardCopy,
  academicYearOptions,
  placementsBySpecialty,
  upcomingPlacements,
  upcomingPeriodOptions,
  cancellationReasons,
  ytdSummary,
  chartTitles,
} from '../../config/networkDashboard';
import { tokenColor } from '../../data/mockData';

const KPI_ICONS: Record<string, LucideIcon> = {
  hospital: Building2,
  school: GraduationCap,
  fileUser: FileUser,
  userGroup: Users,
  clipboardCheck: ClipboardCheck,
  checkToSlot: MonitorCheck,
  building: Building2,
  graduationCap: GraduationCap,
  calendar: CheckSquare,
  users: Users,
  check: ClipboardCheck,
  clock: MonitorCheck,
};

export function NetworkDashboard() {
  const [ay, setAy] = useState(academicYearOptions[0].id);
  const [upcomingPeriod, setUpcomingPeriod] = useState<string>('30d');
  const blue = tokenColor('blue-500');
  const warn = tokenColor('negative-default');
  const selectedYear =
    academicYearOptions.find((o) => o.id === ay) ?? academicYearOptions[0];

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 px-6 py-4">
      {/* Toolbar — sticky within NetworkShell main scroll */}
      <div className="sticky top-0 z-20 -mx-6 border-b border-[#e5e7eb]/80 bg-neutral-50/95 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between overflow-hidden rounded-lg bg-white py-2 pr-2 pl-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium text-[#6b7280] whitespace-nowrap">
              Calendar Year (CY):
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-[29px] items-center gap-1.5 rounded-md bg-[#e0e7ff] px-3 text-sm font-medium text-[#4338ca] shadow-sm"
                >
                  {selectedYear.shortYear}
                  <ChevronDown className="h-3.5 w-3.5 opacity-80" strokeWidth={2} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[120px]">
                <DropdownMenuRadioGroup value={ay} onValueChange={setAy}>
                  {academicYearOptions.map((opt) => (
                    <DropdownMenuRadioItem key={opt.id} value={opt.id}>
                      {opt.shortYear}
                      <span className="ml-2 text-xs text-[#9ca3af]">({opt.label})</span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              className="flex h-[29px] items-center gap-1.5 rounded-md border border-[#d1d5db] bg-white px-2 text-sm text-[#374151] shadow-sm"
            >
              <PlusCircle className="h-4 w-4 shrink-0 text-[#6b7280]" strokeWidth={1.75} />
              Add Filters
            </button>
            <button
              type="button"
              aria-label="Reset filters"
              className="flex h-[29px] w-[29px] items-center justify-center rounded-md text-[#6b7280] hover:bg-neutral-50"
            >
              <RotateCcw className="h-4 w-4 -scale-x-100" strokeWidth={1.75} />
            </button>
          </div>
          <button
            type="button"
            className="flex h-[29px] items-center gap-1.5 rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-[#374151] shadow-sm"
          >
            <FileDown className="h-4 w-4 shrink-0 text-[#6b7280]" strokeWidth={1.75} />
            {networkDashboardCopy.exportLabel}
          </button>
        </div>
      </div>

      {/* KPI Grid — Figma 370:1145 */}
      <div className="flex flex-wrap gap-x-7 gap-y-4 p-2">
        {networkKpiTiles.map((tile) => {
          const Icon = KPI_ICONS[tile.icon] ?? Building2;
          return (
            <button
              key={tile.id}
              type="button"
              className="flex w-full max-w-[440px] flex-1 basis-[min(100%,400px)] flex-col gap-4 rounded-[10px] border border-[#e5e7eb] bg-white p-4 text-left shadow-sm transition-colors hover:border-[#c7d2fe] xl:max-w-[calc(33.333%-19px)]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold tracking-[0.4px] text-[#6b7280] uppercase">
                  {tile.label}
                </p>
                <Icon className="h-5 w-5 shrink-0 text-[#9ca3af]" strokeWidth={1.5} />
              </div>
              <div className="flex items-end gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[26px] font-bold leading-none text-[#111827]">
                    {tile.primaryValue}
                  </p>
                  <p className="mt-[5px] text-xs text-[#6b7280]">{tile.primaryLabel}</p>
                </div>
                <div className="min-w-0 flex-1 border-l border-[#e5e7eb] pl-3">
                  <p className="text-lg font-bold leading-none text-[#3f51b5]">
                    {tile.secondaryValue}
                  </p>
                  <p className="mt-[5px] text-xs text-[#6b7280]">{tile.secondaryLabel}</p>
                </div>
                {tile.tertiaryValue && (
                  <div className="min-w-0 flex-1 border-l border-[#e5e7eb] pl-3">
                    <p className="text-lg font-bold leading-none text-[#3f51b5]">
                      {tile.tertiaryValue}
                    </p>
                    <p className="mt-[5px] text-xs text-[#6b7280]">{tile.tertiaryLabel}</p>
                  </div>
                )}
                <ChevronRight
                  className="mb-1 h-4 w-4 shrink-0 text-[#9ca3af]"
                  strokeWidth={2}
                />
              </div>
            </button>
          );
        })}
      </div>

      <PlacementFunnelHero />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard
          title={chartTitles.upcoming}
          actions={
            <div className="flex overflow-hidden rounded-md border border-[#e5e7eb]">
              {upcomingPeriodOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setUpcomingPeriod(opt.id)}
                  className={`px-2.5 py-1 text-xs font-medium ${
                    upcomingPeriod === opt.id
                      ? 'bg-[#3f51b5] text-white'
                      : 'bg-white text-[#374151]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          }
        >
          <p className="mb-2 text-xs text-[#6b7280]">372 total</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={upcomingPlacements}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="nursing" name="Nursing" stackId="a" fill={blue} />
              <Bar dataKey="allied" name="Allied Health" stackId="a" fill={tokenColor('informative-strong')} />
              <Bar dataKey="medical" name="Medical Ed" stackId="a" fill={tokenColor('accent-500')} />
              <Bar dataKey="other" name="Other" stackId="a" fill={tokenColor('positive-subtle')} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={chartTitles.bySpecialty}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={placementsBySpecialty} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" name="Placements" fill={blue} radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title={chartTitles.cancellations}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cancellationReasons} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" name="Count" radius={[0, 2, 2, 0]}>
                {cancellationReasons.map((_, i) => (
                  <Cell key={i} fill={warn} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={chartTitles.ytd}>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 py-2 sm:grid-cols-2">
            {ytdSummary.map((stat) => (
              <div key={stat.id} className="border-b border-[#e5e7eb] pb-3">
                <dt className="text-xs text-[#6b7280]">{stat.label}</dt>
                <dd className="mt-0.5 text-lg font-bold text-[#111827]">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
        {actions}
      </div>
      {children}
    </section>
  );
}
