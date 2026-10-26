import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Activity, ChartLine, ChevronDown, ChevronRight, CircleCheck, Clock, FileCheck, FileX2, GraduationCap, RotateCcw, type LucideIcon } from 'lucide-react';
import { ds } from './designTokens';
import { MODULE_ROWS, type ModuleRow } from './scheduleModuleData';

// ── Donut geometry (from the design team's build) ────────────────────────────
const G = { vbW: 320, vbH: 280, cx: 148, cy: 132, r: 88 };
interface Slice { label: string; value: number; color: string }

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function sector(cx: number, cy: number, r: number, start: number, end: number) {
  const a = polar(cx, cy, r, end);
  const b = polar(cx, cy, r, start);
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${end - start <= 180 ? 0 : 1} 0 ${b.x} ${b.y} Z`;
}
function Pie({ slices, gap = 1.5, r = G.r, separation = 0 }: { slices: Slice[]; gap?: number; r?: number; separation?: number }) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  let acc = 0;
  return (
    <g>
      {slices.map((s) => {
        if (s.value <= 0) return null;
        const span = (s.value / total) * 360 - gap;
        const start = acc + gap / 2;
        const end = start + span;
        acc += (s.value / total) * 360;
        const mid = ((start + end) / 2 - 90) * (Math.PI / 180);
        return <path key={s.label} d={sector(G.cx + separation * Math.cos(mid), G.cy + separation * Math.sin(mid), r, start, end)} fill={s.color} stroke="#ffffff" strokeWidth="1.5" />;
      })}
    </g>
  );
}

const CHART_BOX = 'flex min-h-[320px] w-full flex-col items-center px-5 py-6';
const SVG_BOX = 'mx-auto w-full max-w-[min(100%,340px)] aspect-square min-h-[210px] max-h-[268px]';

function EmptyDonut({ title }: { title: string }) {
  const slices: Slice[] = [
    { value: 1, color: '#e5e7eb', label: 'a' }, { value: 1, color: '#d1d5db', label: 'b' }, { value: 1, color: '#eceef1', label: 'c' },
  ];
  return (
    <div className={CHART_BOX}>
      <p className="w-full text-center text-[15px] font-semibold leading-6 text-[#212121]">{title}</p>
      <svg viewBox={`0 0 ${G.vbW} ${G.vbH}`} className={`${SVG_BOX} mt-4`} aria-hidden><Pie slices={slices} gap={2} /></svg>
      <p className="mt-4 text-[14px] font-medium text-[#424242]">No data available</p>
      <p className="mt-1 text-[12px] leading-4 text-[#757575]">Try selecting a different timeframe</p>
    </div>
  );
}

function ScheduleDonut({ slices }: { slices: Slice[] }) {
  return (
    <div className={`${CHART_BOX} items-stretch`}>
      <div className="w-full text-center">
        <p className="text-[15px] font-semibold leading-6 text-[#212121]">Schedules Overview</p>
        <p className="mt-0.5 text-[12px] leading-4 text-[#757575]">Status of schedules.</p>
      </div>
      <svg viewBox={`-22 0 ${G.vbW + 38} ${G.vbH + 8}`} className={`${SVG_BOX} mt-2 overflow-visible`} aria-hidden><Pie slices={slices} gap={1.2} /></svg>
      <ul className="mt-1 flex w-full flex-wrap justify-start gap-x-5 gap-y-1.5 px-1 text-[11px] text-[#424242]">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
            {s.label} ({s.value})
          </li>
        ))}
      </ul>
    </div>
  );
}

function OnboardingDonut({ slices }: { slices: Slice[] }) {
  return (
    <div className={`${CHART_BOX} items-stretch`}>
      <p className="w-full text-center text-[15px] font-semibold leading-6 text-[#212121]">Student Onboarding Overview</p>
      <svg viewBox={`0 0 ${G.vbW} ${G.vbH}`} className={`${SVG_BOX} mt-4`} aria-hidden><Pie slices={slices} gap={3} r={G.r - 8} separation={8} /></svg>
      <ul className="mt-1 flex w-full flex-wrap justify-start gap-x-5 gap-y-1.5 px-1 text-[11px] text-[#424242]">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
            {s.label} ({s.value})
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Bar chart: approved / confirmed / compliant by start month ───────────────
const BAR_COLORS = { approved: '#f59e0b', confirmed: '#3f51b5', compliant: '#22c55e' };

function monthKey(iso: string) { return iso.slice(0, 7); }

function monthSeries(rows: ModuleRow[]) {
  const start = new Date();
  start.setDate(1);
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) };
  });
  const series = months.map((m) => {
    const inMonth = rows.filter((r) => monthKey(r.startDate) === m.key);
    return [
      inMonth.filter((r) => r.scheduleStatus === 'Confirmed' || r.scheduleStatus === 'Pending Confirmation').length,
      inMonth.filter((r) => r.scheduleStatus === 'Confirmed').length,
      inMonth.filter((r) => r.onboardingStatus === 'Compliant').length,
    ];
  });
  return { months: months.map((m) => m.label), series };
}

function BarChart({ rows }: { rows: ModuleRow[] }) {
  const { months, series } = useMemo(() => monthSeries(rows), [rows]);
  const top = Math.max(6, ...series.flat());
  const H = 236;
  return (
    <div className="px-5 pb-5 pt-2">
      <svg viewBox="0 0 902 400" className="h-auto w-full max-w-full" role="img" aria-label="Slot approvals and confirmation bar chart by start month">
        <text x="12" y="196" className="fill-[#757575] text-[11px]">Count</text>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const y = 57 + ((6 - i) / 6) * H;
          return (
            <g key={i}>
              <line x1="59" y1={y} x2="892" y2={y} stroke="#eceef1" strokeWidth="1" />
              <text x="48" y={y + 4} textAnchor="end" className="fill-[#757575] text-[10px]">{Math.round((i / 6) * top)}</text>
            </g>
          );
        })}
        {months.map((label, a) => {
          const slot = 772 / months.length;
          const x0 = 74 + a * slot + slot * 0.15;
          const w = slot * 0.22;
          const vals = [
            { v: series[a][0], c: BAR_COLORS.approved, o: 0 },
            { v: series[a][1], c: BAR_COLORS.confirmed, o: 1 },
            { v: series[a][2], c: BAR_COLORS.compliant, o: 2 },
          ];
          return (
            <g key={label}>
              {vals.map(({ v, c, o }) => {
                if (v <= 0) return null;
                const h = (v / top) * H;
                return <rect key={o} x={x0 + o * (w + 2)} y={57 + H - h} width={w} height={h} fill={c} rx="1" />;
              })}
              <text x={74 + a * slot + slot / 2} y="320" textAnchor="middle" className="fill-[#424242] text-[9px]">{label.replace(' ', ' ')}</text>
            </g>
          );
        })}
        <line x1="59" y1="293" x2="892" y2="293" stroke="#d1d5db" strokeWidth="1" />
        <g transform="translate(212, 348)">
          <circle cx="0" cy="0" r="4" fill={BAR_COLORS.approved} /><text x="10" y="4" className="fill-[#424242] text-[11px]">Schedules Approved</text>
          <circle cx="160" cy="0" r="4" fill={BAR_COLORS.confirmed} /><text x="170" y="4" className="fill-[#424242] text-[11px]">Schedules Confirmed</text>
          <circle cx="320" cy="0" r="4" fill={BAR_COLORS.compliant} /><text x="330" y="4" className="fill-[#424242] text-[11px]">Students Fully Compliant</text>
        </g>
      </svg>
    </div>
  );
}

// ── KPI + activities ─────────────────────────────────────────────────────────
function Kpi({ icon: Icon, tone, title, value, sub, href }: { icon: LucideIcon; tone: string; title: string; value: number; sub: string; href: string }) {
  return (
    <div className={ds.kpiCard}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <Icon className={`mt-0.5 size-5 shrink-0 ${tone}`} strokeWidth={1.75} aria-hidden />
          <p className={ds.kpiTitle}>{title}</p>
        </div>
        <Link to={href} className={ds.kpiCta}>View<ChevronRight className="size-3.5" strokeWidth={2} aria-hidden /></Link>
      </div>
      <p className={`${ds.kpiValue} mt-3`}>{value}</p>
      <p className={ds.kpiSub}>{sub}</p>
    </div>
  );
}

function MoreLink({ value }: { value: string }) {
  const m = value.match(/^(.+?)(\s+\+\d+\s+more)$/i);
  return m ? <>{m[1]}<span className="font-normal text-[#2563eb]">{m[2]}</span></> : <>{value}</>;
}

function acrossSchools(rows: ModuleRow[]) {
  const n = new Set(rows.map((r) => r.schoolName)).size;
  return `Across ${n} ${n === 1 ? 'School' : 'Schools'}`;
}

export function SchedulesOverview() {
  const { siteId } = useParams();
  const [range, setRange] = useState<'next-30' | 'all-upcoming'>('next-30');
  const all = `/site/${siteId}/schedules/list/all`;

  const ongoing = MODULE_ROWS.filter((r) => r.scheduleStatus === 'Ongoing');
  const upConfirmed = MODULE_ROWS.filter((r) => r.timeline === 'upcoming' && r.scheduleStatus === 'Confirmed');
  const upNon = MODULE_ROWS.filter((r) => r.timeline === 'upcoming' && r.scheduleStatus !== 'Confirmed');

  const count = (f: (r: ModuleRow) => boolean) => MODULE_ROWS.filter(f).length;
  const scheduleSlices: Slice[] = [
    { label: 'Confirmed', value: count((r) => r.scheduleStatus === 'Confirmed'), color: '#22c55e' },
    { label: 'Not Confirmed', value: count((r) => r.scheduleStatus === 'Pending Confirmation'), color: '#eab308' },
    { label: 'To Be Scheduled', value: count((r) => r.scheduleStatus === 'To be Scheduled'), color: '#64748b' },
    { label: 'Cancelled', value: count((r) => r.scheduleStatus === 'Canceled'), color: '#ef4444' },
  ];
  const onboardingSlices: Slice[] = [
    { label: 'Compliant', value: count((r) => r.onboardingStatus === 'Compliant'), color: '#22c55e' },
    { label: 'In Progress', value: count((r) => r.onboardingStatus === 'In Progress'), color: '#3f51b5' },
    { label: 'Not Compliant', value: count((r) => r.onboardingStatus === 'Not Compliant'), color: '#ef4444' },
    { label: 'Not Started', value: count((r) => r.onboardingStatus === 'Not Started'), color: '#94a3b8' },
  ];

  const activities = useMemo(() => {
    const pick = MODULE_ROWS.slice(0, 5);
    return pick.map((r, i) => {
      const cancelled = i === 2 || i === 3;
      const more = r.members.length > 1 ? ` +${r.members.length - 1} more` : '';
      const kindLabel = r.kind === 'group' ? 'Group' : 'Individual';
      return {
        id: r.id,
        cancelled,
        text: `${kindLabel} schedule ${cancelled ? 'cancelled' : 'updated'} for ${r.schoolName} for ${r.durationLabel.replace(' – ', ' - ')}. (${kindLabel})`,
        discipline: r.disciplineBase + (r.kind === 'group' ? ' +3 more' : ''),
        location: r.location + more,
        updatedOn: 'Oct 23, 2026',
        updatedBy: cancelled ? 'Exxat Super Admin' : 'Snehal Gajbhiye',
      };
    });
  }, []);

  const toggle = (id: 'next-30' | 'all-upcoming', label: string) => (
    <button type="button" onClick={() => setRange(id)} className={`rounded-md px-3 py-2 text-[14px] leading-5 ${range === id ? 'bg-[#3f51b5] font-medium text-white' : 'bg-transparent font-normal text-[#111827] hover:bg-[#f9fafb]'}`}>{label}</button>
  );

  return (
    <div className={`${ds.contentInset} pb-8 pt-4`}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex w-full flex-wrap items-center gap-2 rounded-lg border border-[#eceef1] bg-white px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <span className="text-[13px] font-medium text-[#757575]">Filters:</span>
            <button type="button" className="flex h-[34px] items-center gap-2 rounded border border-[#d1d5db] bg-white px-2.5 text-[13px] text-[#111827]">
              <GraduationCap className="size-4 shrink-0 text-[#6b7280]" strokeWidth={1.75} aria-hidden />
              Discipline
              <ChevronDown className="size-3 text-[#6b7280]" aria-hidden />
            </button>
            <button type="button" aria-label="Reset filters" className="flex h-[34px] w-[34px] items-center justify-center rounded-md border border-transparent bg-white text-[#6b7280] hover:bg-[#f9fafb]">
              <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Kpi icon={Activity} tone="text-[#3f51b5]" title="Ongoing Schedules" value={ongoing.length} sub={acrossSchools(ongoing)} href={all} />
            <Kpi icon={CircleCheck} tone="text-[#2e7d32]" title="Upcoming Confirmed Schedules" value={upConfirmed.length} sub={acrossSchools(upConfirmed)} href={all} />
            <Kpi icon={Clock} tone="text-[#ef6c00]" title="Upcoming Non-Confirmed Schedules" value={upNon.length} sub={acrossSchools(upNon)} href={all} />
          </div>

          <section className={`${ds.card} overflow-hidden p-0`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eceef1] px-5 py-4">
              <h2 className={ds.sectionTitle}>Upcoming Schedules Overview</h2>
              <div className="flex items-center gap-2">{toggle('next-30', 'Next 30 Days')}{toggle('all-upcoming', 'All Upcoming')}</div>
            </div>
            <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:items-stretch">
              {range === 'all-upcoming' ? <ScheduleDonut slices={scheduleSlices} /> : <EmptyDonut title="Schedules Overview" />}
              {range === 'all-upcoming' ? <OnboardingDonut slices={onboardingSlices} /> : <EmptyDonut title="Student Onboarding Overview" />}
            </div>
          </section>

          <section className={`${ds.card} overflow-hidden p-0`}>
            <div className="border-b border-[#eceef1] px-5 py-4">
              <div className="flex items-start gap-2">
                <ChartLine className="mt-0.5 size-5 shrink-0 text-[#3f51b5]" strokeWidth={1.75} aria-hidden />
                <div>
                  <h2 className={ds.sectionTitle}>Slot Approvals and Confirmation (Based on start month)</h2>
                  <p className={ds.sectionSubtitle}>Overview of 12 months based on available data: approved schedules, confirmed schedules, and those compliant to start</p>
                </div>
              </div>
            </div>
            <BarChart rows={MODULE_ROWS} />
          </section>
        </div>

        <aside className={`${ds.card} self-start p-0`}>
          <div className="border-b border-[#eceef1] px-4 py-3"><h2 className={ds.sectionTitle}>Recent Activities</h2></div>
          <ul className="space-y-4 px-4 py-3">
            {activities.map((a) => (
              <li key={a.id}>
                <div className="flex gap-3">
                  {a.cancelled
                    ? <FileX2 className="mt-0.5 size-5 shrink-0 text-[#ef4444]" strokeWidth={1.75} aria-hidden />
                    : <FileCheck className="mt-0.5 size-5 shrink-0 text-[#2e7d32]" strokeWidth={1.75} aria-hidden />}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-5 text-[#212121]">{a.text}</p>
                    <p className="mt-1 text-[12px] leading-4 text-[#212121]"><span className="font-semibold text-[#424242]">Discipline:</span> <MoreLink value={a.discipline} /></p>
                    <p className="mt-1 break-words text-[12px] leading-4 text-[#212121]"><span className="font-semibold text-[#424242]">Location:</span> <MoreLink value={a.location} /></p>
                    <p className={`${ds.activityMeta} mt-1`}>Updated on {a.updatedOn} by {a.updatedBy}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

