import { useMemo, useRef, useState } from 'react';
import { NavLink, Navigate, useParams } from 'react-router';
import { toast } from 'sonner';
import {
  ArrowRightToLine, BookOpen, Building2, CalendarClock, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsLeft,
  ChevronsRight, CircleCheck, CirclePlus, CircleX, Ellipsis, FileOutput, FileText, Grid3x3, History, ListChecks, ListTodo, Mail,
  Map, MapPin, Pencil, PencilLine, RotateCcw, Search, TriangleAlert, Users, Wrench, X,
  type LucideIcon,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { type PersonaOption, type RecipientRow } from '../email/ComposeEmailWizard';
import { BulkEmailFlow } from '../email/BulkEmailFlow';
import { EmailHistoryPanel } from '../email/EmailHistoryPanel';
import { preceptorsForPicked, personnelForPicked, schoolContactsForPicked, facultyForPicked } from '../email/boltOnRecipients';
import { DsCheckbox } from './DsCheckbox';
import { groupVariant } from '../../data/surfaceMergeFields';
import { COL, FONT, MUTED_ICON, RIGHT_ONBOARDING_PX, RIGHT_STATUS_PX, SELECT_COL, TABLE_WIDTH, colStyle, ds, tbl } from './designTokens';
import { needsAttention, rowsFor, type ListKind, type ModuleRow, type Timeline } from './scheduleModuleData';

// ── Facets ───────────────────────────────────────────────────────────────────
type FacetId =
  | 'scheduleType' | 'schools' | 'discipline' | 'dates' | 'locations' | 'locationGroups'
  | 'scheduleStatus' | 'onboardingStatus' | 'groupOnboardingStatus';

const FACETS: Record<FacetId, { label: string; icon: LucideIcon }> = {
  scheduleType: { label: 'Schedule Type', icon: Users },
  schools: { label: 'Schools', icon: Building2 },
  discipline: { label: 'Discipline / Specialization', icon: BookOpen },
  dates: { label: 'Start & End Date', icon: CalendarClock },
  locations: { label: 'Locations', icon: MapPin },
  locationGroups: { label: 'Location Groups', icon: Map },
  scheduleStatus: { label: 'Schedule Status', icon: ListChecks },
  onboardingStatus: { label: 'Onboarding Status', icon: ListTodo },
  groupOnboardingStatus: { label: 'Group Onboarding Status', icon: ListTodo },
};

const BAR: Record<ListKind, { inline: FacetId[]; overflow: FacetId[] }> = {
  group: { inline: ['schools', 'discipline', 'dates', 'locationGroups'], overflow: ['groupOnboardingStatus'] },
  all: { inline: ['scheduleType', 'discipline', 'schools', 'dates', 'locations'], overflow: ['scheduleStatus', 'onboardingStatus'] },
  individual: { inline: ['discipline', 'schools', 'dates', 'locations'], overflow: ['scheduleStatus', 'onboardingStatus'] },
};

interface Filters {
  values: Partial<Record<FacetId, string[]>>;
  from: string;
  to: string;
}
const EMPTY: Filters = { values: {}, from: '', to: '' };

function facetValue(r: ModuleRow, id: Exclude<FacetId, 'dates'>): string {
  switch (id) {
    case 'scheduleType': return r.kind === 'group' ? 'Group' : 'Individual';
    case 'schools': return r.schoolName;
    case 'discipline': return r.discipline;
    case 'locations': return r.location;
    case 'locationGroups': return r.locationGroup;
    case 'scheduleStatus': return r.scheduleStatus;
    case 'onboardingStatus': return r.onboardingStatus;
    case 'groupOnboardingStatus': return r.groupOnboardingStatus;
  }
}

// ── Search ───────────────────────────────────────────────────────────────────
type ScopeId = 'scheduleId' | 'name' | 'school' | 'availability';
interface Scope { id: ScopeId; label: string; placeholder: string }

function scopesFor(kind: ListKind): Scope[] {
  return [
    { id: 'scheduleId', label: 'Schedule ID', placeholder: 'Search by Schedule ID' },
    { id: 'name', label: kind === 'group' ? 'Group Name' : kind === 'individual' ? 'Student Name' : 'Student / Group', placeholder: `Search by ${kind === 'group' ? 'Group Name' : kind === 'individual' ? 'Student Name' : 'Student or Group'}` },
    { id: 'school', label: 'School Name', placeholder: 'Search by School Name' },
    { id: 'availability', label: kind === 'group' ? 'Availability…' : 'Availability', placeholder: kind === 'group' ? 'Search by Availability N…' : 'Search by Availability Name' },
  ];
}

function matchesQuery(r: ModuleRow, scope: ScopeId, q: string): boolean {
  if (!q) return true;
  switch (scope) {
    case 'scheduleId': return r.scheduleId.includes(q) || r.assignmentLabel.toLowerCase().includes(q);
    case 'name': return r.primaryName.toLowerCase().includes(q) || (r.primarySubline ?? '').toLowerCase().includes(q);
    case 'school': return r.schoolName.toLowerCase().includes(q);
    case 'availability': return r.availability.toLowerCase().includes(q);
  }
}

// ── Small pieces ─────────────────────────────────────────────────────────────
const TIMELINES: { id: 'all' | Timeline; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'All', icon: Grid3x3 },
  { id: 'upcoming', label: 'Upcoming', icon: ArrowRightToLine },
  { id: 'current', label: 'Current', icon: RotateCcw },
  { id: 'completed', label: 'Completed', icon: CircleCheck },
];

const KINDS: { id: ListKind; label: string }[] = [
  { id: 'all', label: 'All Schedules' },
  { id: 'group', label: 'Group' },
  { id: 'individual', label: 'Individual' },
];

function ListKindTabs({ base }: { base: string }) {
  return (
    <nav className={ds.listKindTabRow} aria-label="Schedule list type">
      {KINDS.map((k, i) => (
        <NavLink
          key={k.id}
          to={`${base}/${k.id}`}
          end
          className={({ isActive }) => `${ds.listKindTab} ${isActive ? ds.listKindActive : ds.listKindIdle} ${i === 0 ? 'rounded-l-lg' : ''} ${i === KINDS.length - 1 ? 'rounded-r-lg' : ''}`}
        >
          {k.label}
        </NavLink>
      ))}
    </nav>
  );
}

function NeedsAttention({ onView }: { onView: (id: 'toBeScheduled' | 'notCompliant' | 'canceled') => void }) {
  const n = needsAttention();
  const items = [
    { id: 'toBeScheduled' as const, count: n.toBeScheduled, label: 'To be Scheduled', wrap: 'bg-[#fef9c3]', icon: 'text-[#ca8a04]', Icon: Users },
    { id: 'notCompliant' as const, count: n.notCompliant, label: 'Not Compliant', wrap: 'bg-[#ffedd5]', icon: 'text-[#ea580c]', Icon: FileText },
    { id: 'canceled' as const, count: n.canceled, label: 'Canceled', wrap: 'bg-[#fee2e2]', icon: 'text-[#dc2626]', Icon: CircleX },
  ];
  return (
    <section className={ds.needsAttentionPanel} aria-label="Needs attention summary">
      <div className={ds.needsAttentionHeader}>
        <TriangleAlert className="size-3.5 shrink-0 text-[#ea580c]" strokeWidth={2} aria-hidden />
        <span>Needs Attention</span>
      </div>
      <div className={ds.needsAttentionMetrics}>
        {items.map(({ id, count, label, wrap, icon, Icon }) => (
          <div key={id} className={ds.needsAttentionMetric}>
            <div className={`${ds.needsAttentionIconWrap} ${wrap}`}>
              <Icon className={`size-4 ${icon}`} strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className={ds.needsAttentionMetricTitle}>
                <span className="font-semibold text-[#212121]">{count}</span> {label}
              </p>
              <button type="button" className={ds.needsAttentionViewLink} onClick={() => onView(id)}>View</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SearchCombo({ scope, scopes, onScope, value, onChange }: { scope: Scope; scopes: Scope[]; onScope: (s: ScopeId) => void; value: string; onChange: (v: string) => void }) {
  return (
    <div className={`${ds.searchComboOuter} ${FONT}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={ds.searchComboScopeBtn} aria-label="Search scope">
            <span className="truncate text-[14px] font-normal leading-5 text-[#111827]">{scope.label}</span>
            <ChevronDown className="size-4 shrink-0 text-[#111827]" strokeWidth={1.75} aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={`min-w-[180px] ${FONT}`}>
          {scopes.map((s) => (
            <DropdownMenuItem key={s.id} onSelect={() => onScope(s.id)} className="text-[14px]">{s.label.replace('…', '')}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className={ds.searchComboDivider} aria-hidden />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={scope.placeholder} aria-label={scope.placeholder} className={ds.searchComboInput} />
      {value ? (
        <button type="button" className={ds.searchComboClear} aria-label="Clear search" onClick={() => onChange('')}>
          <X className="size-4" strokeWidth={1.75} />
        </button>
      ) : (
        <span className={ds.searchComboClear} aria-hidden />
      )}
      <div className={ds.searchComboSearchIcon} aria-hidden>
        <Search className="size-4 text-[#888888]" strokeWidth={1.75} />
      </div>
    </div>
  );
}

function FacetButton({ id, rows, filters, onChange }: { id: FacetId; rows: ModuleRow[]; filters: Filters; onChange: (f: Filters) => void }) {
  const { label, icon: Icon } = FACETS[id];
  const [term, setTerm] = useState('');
  const isDates = id === 'dates';
  const options = useMemo(
    () => (isDates ? [] : Array.from(new Set(rows.map((r) => facetValue(r, id as Exclude<FacetId, 'dates'>)))).sort()),
    [rows, id, isDates],
  );
  const selected = filters.values[id] ?? [];
  const active = isDates ? !!(filters.from || filters.to) : selected.length > 0;
  const shown = options.filter((o) => o.toLowerCase().includes(term.trim().toLowerCase()));
  const text = isDates ? label : selected.length > 0 ? `${label}: ${selected.length === 1 ? selected[0] : `${selected.length} selected`}` : label;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={`${ds.facetBtn} ${active ? ds.facetBtnActive : ''}`}>
          <Icon className="h-4 w-4 shrink-0 text-[#6b7280]" strokeWidth={1.75} aria-hidden />
          <span className="max-w-[210px] truncate">{text}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={`w-[280px] p-0 ${FONT}`}>
        {isDates ? (
          <div className="space-y-3 p-3">
            <label className="block text-[12px] font-medium text-[#616161]">Starts on or after
              <input type="date" value={filters.from} onChange={(e) => onChange({ ...filters, from: e.target.value })} className="mt-1 h-[34px] w-full rounded-[4px] border border-[#888888] px-2 text-[14px] text-[#212121]" />
            </label>
            <label className="block text-[12px] font-medium text-[#616161]">Ends on or before
              <input type="date" value={filters.to} onChange={(e) => onChange({ ...filters, to: e.target.value })} className="mt-1 h-[34px] w-full rounded-[4px] border border-[#888888] px-2 text-[14px] text-[#212121]" />
            </label>
            {active && <button type="button" className="text-[13px] font-medium text-[#3f51b5] hover:underline" onClick={() => onChange({ ...filters, from: '', to: '' })}>Clear dates</button>}
          </div>
        ) : (
          <div>
            {options.length > 8 && (
              <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder={`Search ${label.toLowerCase()}…`} className="w-full border-0 border-b border-[#eceef1] px-3 py-2 text-[13px] outline-none placeholder:text-[#9e9e9e]" />
            )}
            <div className="max-h-[260px] overflow-y-auto py-1">
              {shown.map((o) => (
                <label key={o} className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-[13px] text-[#212121] hover:bg-[#f5f6fc]">
                  <DsCheckbox
                    checked={selected.includes(o)}
                    onCheckedChange={(v) => onChange({ ...filters, values: { ...filters.values, [id]: v ? [...selected, o] : selected.filter((x) => x !== o) } })}
                    aria-label={o}
                  />
                  <span className="min-w-0 flex-1 truncate">{o}</span>
                </label>
              ))}
              {shown.length === 0 && <p className="px-3 py-4 text-center text-[13px] text-[#757575]">No matches.</p>}
            </div>
            {selected.length > 0 && (
              <div className="border-t border-[#eceef1] px-3 py-2">
                <button type="button" className="text-[13px] font-medium text-[#3f51b5] hover:underline" onClick={() => onChange({ ...filters, values: { ...filters.values, [id]: [] } })}>Clear</button>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function ToolbarIconButton({ icon: Icon, label, onClick, bordered, expanded, flip }: { icon: LucideIcon; label: string; onClick?: () => void; bordered?: boolean; expanded?: boolean; flip?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} aria-expanded={expanded} onClick={onClick} className={`${ds.filterIconBtn} ${bordered ? ds.filterIconBtnBordered : ''}`}>
      <Icon className={`h-4 w-4 ${flip ? '-scale-x-100' : ''}`} strokeWidth={1.75} />
    </button>
  );
}

function BulkEmailMenu({ selectedCount, onCompose, onHistory }: { selectedCount: number; onCompose: () => void; onHistory: () => void }) {
  const has = selectedCount > 0;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={ds.bulkEmailBtn}>
          <Mail className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
          Bulk Email
          <ChevronDown className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`min-w-[220px] ${FONT}`}>
        <DropdownMenuItem disabled={!has} onSelect={() => has && onCompose()} className="gap-2 text-[14px]">
          <PencilLine className="size-4 text-[#6b7280]" strokeWidth={1.75} aria-hidden />
          <span className="flex min-w-0 flex-1 flex-col">
            Compose Email
            {!has && <span className="text-[11px] font-normal leading-4 text-[#9e9e9e]">Select at least one schedule</span>}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onHistory} className="gap-2 text-[14px]">
          <History className="size-4 text-[#6b7280]" strokeWidth={1.75} aria-hidden />
          Email History
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Table ────────────────────────────────────────────────────────────────────
function ScheduleStatusPill({ status }: { status: string }) {
  if (status === 'Confirmed' || status === 'Completed') return <span className={ds.statusPillGreen}>{status}</span>;
  if (status === 'Ongoing') return <span className={ds.statusPillAmber}>{status}</span>;
  return <span className={ds.statusPillGray}>{status}</span>;
}

function OnboardingPill({ status }: { status: string }) {
  if (status === 'Not Compliant' || status === 'Not Started') return <span className={ds.onboardingPillRed}>{status}</span>;
  if (status === 'In Progress') return <span className={ds.onboardingPillBlue}>{status}</span>;
  return <span className={ds.statusPillGreen}>{status}</span>;
}

const todo = (what: string) => toast.info(`${what} isn't part of this prototype yet.`);

function TableColGroup({ selectable }: { selectable: boolean }) {
  return (
    <colgroup>
      {selectable && <col style={{ width: SELECT_COL }} />}
      {(Object.keys(COL) as (keyof typeof COL)[]).map((k) => <col key={k} style={{ width: COL[k] }} />)}
    </colgroup>
  );
}

function HeadRow({ nameHeader, selectable, leftId, leftName, allSelected, onToggleAll }: { nameHeader: string; selectable: boolean; leftId: number; leftName: number; allSelected: boolean | 'indeterminate'; onToggleAll: () => void }) {
  const c = tbl.headCell;
  return (
    <tr>
      {selectable && (
        <th className={`${c} ${tbl.stickyHeadPinLeft}`} style={{ width: SELECT_COL, minWidth: SELECT_COL, left: 0 }}>
          <DsCheckbox checked={allSelected} onCheckedChange={onToggleAll} aria-label="Select all schedules on this page" />
        </th>
      )}
      <th className={`${c} ${tbl.stickyHeadPinLeft}`} style={{ ...colStyle('scheduleId'), left: leftId }}>Schedule ID</th>
      <th className={`${c} ${tbl.stickyHeadPinLeft}`} style={{ ...colStyle('student'), left: leftName }}>{nameHeader}</th>
      <th className={c} style={colStyle('schoolName')}>School name</th>
      <th className={c} style={colStyle('availability')}>Availability</th>
      <th className={c} style={colStyle('location')}>Location</th>
      <th className={c} style={colStyle('duration')}>Schedule duration</th>
      <th className={c} style={colStyle('discipline')}>Discipline / Specialization</th>
      <th className={c} style={colStyle('shift')}>Shift</th>
      <th className={c} style={colStyle('daysOfWeek')}>Days of week</th>
      <th className={c} style={colStyle('preceptor')}>Preceptor</th>
      <th className={c} style={colStyle('clinicalInstructor')}>Clinical instructor</th>
      <th className={c} style={colStyle('programType')}>Program type</th>
      <th className={`${c} ${tbl.stickyHeadPinRight}`} style={{ ...colStyle('scheduleStatus'), right: RIGHT_STATUS_PX }}>Schedule status</th>
      <th className={`${c} ${tbl.stickyHeadPinRight}`} style={{ ...colStyle('onboardingStatus'), right: RIGHT_ONBOARDING_PX }}>Onboarding status</th>
      <th className={`${c} ${tbl.stickyHeadPinActions} last:border-r-0`} style={{ ...colStyle('actions'), right: 0 }}>Actions</th>
    </tr>
  );
}

function BodyRow({ row, selectable, leftId, leftName, selected, onToggle }: { row: ModuleRow; selectable: boolean; leftId: number; leftName: number; selected: boolean; onToggle: () => void }) {
  const c = `${tbl.bodyCell} min-h-[81px]`;
  return (
    <tr className={`group ${tbl.bodyRow}`}>
      {selectable && (
        <td className={`${c} ${tbl.stickyBodyPinLeft} align-middle`} style={{ width: SELECT_COL, minWidth: SELECT_COL, left: 0 }}>
          <DsCheckbox checked={selected} onCheckedChange={onToggle} aria-label={`Select schedule ${row.scheduleId}`} />
        </td>
      )}
      <td className={`${c} ${tbl.stickyBodyPinLeft}`} style={{ ...colStyle('scheduleId'), left: leftId }}>
        <div className="flex items-start gap-1">
          <Users className={`mt-1 size-3 shrink-0 ${MUTED_ICON}`} aria-hidden />
          <div className="min-w-0">
            <p className="font-medium text-[#212121]">{row.scheduleId}</p>
            <button type="button" className={`text-left ${ds.link}`} onClick={() => todo('Schedule detail')}>{row.assignmentLabel}</button>
          </div>
        </div>
      </td>
      <td className={`${c} ${tbl.stickyBodyPinLeft}`} style={{ ...colStyle('student'), left: leftName }}>
        <button type="button" className={`block text-left ${ds.link}`} onClick={() => todo(row.kind === 'group' ? 'Group detail' : 'Student profile')}>{row.primaryName}</button>
        {row.primarySubline && <p className="mt-0.5 truncate text-[12px] text-[#757575]">{row.primarySubline}</p>}
      </td>
      <td className={c} style={colStyle('schoolName')}>{row.schoolName}</td>
      <td className={c} style={colStyle('availability')}>{row.availability}</td>
      <td className={c} style={colStyle('location')}>{row.location}</td>
      <td className={c} style={colStyle('duration')}>{row.durationLabel}</td>
      <td className={c} style={colStyle('discipline')}>{row.discipline}</td>
      <td className={c} style={colStyle('shift')}>{row.shift}</td>
      <td className={c} style={colStyle('daysOfWeek')}>{row.daysOfWeek}</td>
      <td className={c} style={colStyle('preceptor')}>{row.preceptor}</td>
      <td className={c} style={colStyle('clinicalInstructor')}>{row.clinicalInstructor}</td>
      <td className={c} style={colStyle('programType')}>{row.programType}</td>
      <td className={`${c} ${tbl.stickyBodyPinRight} align-middle`} style={{ ...colStyle('scheduleStatus'), right: RIGHT_STATUS_PX }}><ScheduleStatusPill status={row.scheduleStatus} /></td>
      <td className={`${c} ${tbl.stickyBodyPinRight} align-middle`} style={{ ...colStyle('onboardingStatus'), right: RIGHT_ONBOARDING_PX }}><OnboardingPill status={row.onboardingStatus} /></td>
      <td className={`${c} ${tbl.stickyBodyPinActions} align-middle last:border-r-0`} style={{ ...colStyle('actions'), right: 0 }}>
        <div className="flex items-center justify-center gap-1">
          <button type="button" aria-label={`Edit schedule ${row.scheduleId}`} className="rounded p-1 text-[#424242] hover:bg-neutral-100" onClick={() => todo('Editing a schedule')}>
            <Pencil className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
          <button type="button" aria-label={`More actions for ${row.scheduleId}`} className="rounded p-1 text-[#424242] hover:bg-neutral-100" onClick={() => todo('Schedule actions')}>
            <Ellipsis className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function PageButton({ children, onClick, disabled, active, label }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; active?: boolean; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded border px-2 text-sm disabled:opacity-40 ${active ? 'border-[#3f51b5] bg-[#3f51b5] text-white' : 'border-[#eceef1] bg-white text-[#374151]'}`}
    >
      {children}
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 50;

export function SchedulesListPage() {
  const { siteId, kind } = useParams<{ siteId: string; kind: string }>();
  const siteBase = `/site/${siteId}/schedules/list`;
  if (kind !== 'all' && kind !== 'group' && kind !== 'individual') return <Navigate to={`${siteBase}/all`} replace />;
  return <SchedulesList key={kind} kind={kind} base={siteBase} />;
}

function SchedulesList({ kind, base }: { kind: ListKind; base: string }) {
  const rows = useMemo(() => rowsFor(kind), [kind]);
  const scopes = scopesFor(kind);
  const [timeline, setTimeline] = useState<'all' | Timeline>('all');
  const [query, setQuery] = useState('');
  const [scopeId, setScopeId] = useState<ScopeId>(kind === 'group' ? 'availability' : 'scheduleId');
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [composeOpen, setComposeOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const bar = BAR[kind];
  const scope = scopes.find((s) => s.id === scopeId) ?? scopes[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (timeline !== 'all' && r.timeline !== timeline) return false;
      if (!matchesQuery(r, scopeId, q)) return false;
      for (const id of Object.keys(filters.values) as FacetId[]) {
        const v = filters.values[id] ?? [];
        if (v.length > 0 && id !== 'dates' && !v.includes(facetValue(r, id))) return false;
      }
      if (filters.from && r.endDate < filters.from) return false;
      if (filters.to && r.startDate > filters.to) return false;
      return true;
    });
  }, [rows, timeline, query, scopeId, filters]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const selectable = kind !== 'all';
  const leftId = selectable ? SELECT_COL : 0;
  const leftName = leftId + COL.scheduleId;
  const width = TABLE_WIDTH + (selectable ? SELECT_COL : 0);
  const tableStyle = { width, minWidth: width };
  const allSelected: boolean | 'indeterminate' =
    pageRows.length > 0 && pageRows.every((r) => selected.has(r.id)) ? true : pageRows.some((r) => selected.has(r.id)) ? 'indeterminate' : false;
  const selectedRows = useMemo(() => filtered.filter((r) => selected.has(r.id)), [filtered, selected]);

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected === true) pageRows.forEach((r) => next.delete(r.id));
      else pageRows.forEach((r) => next.add(r.id));
      return next;
    });
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function resetFilters() {
    setFilters(EMPTY);
    setQuery('');
    setPage(0);
  }
  function viewAttention(id: 'toBeScheduled' | 'notCompliant' | 'canceled') {
    const next: Filters = { values: {}, from: '', to: '' };
    if (id === 'toBeScheduled') next.values.scheduleStatus = ['To be Scheduled'];
    if (id === 'canceled') next.values.scheduleStatus = ['Canceled'];
    if (id === 'notCompliant') next.values[kind === 'group' ? 'groupOnboardingStatus' : 'onboardingStatus'] = ['Not Compliant'];
    setFilters(next);
    setExpanded(true);
    setPage(0);
  }

  // Everyone tied to the selected schedules, by persona. A Group row stands for every student in the cohort.
  const personas: PersonaOption[] = useMemo(() => {
    const members = selectedRows.flatMap((r) => r.members);
    const students: RecipientRow[] = members.map((m) => ({ id: m.studentId, name: m.studentName, email: m.studentEmail, meta: m.school }));
    return [
      { audience: 'Student', label: 'Students', description: 'The students on the selected schedules', recipients: students },
      { audience: 'Preceptor', label: 'Preceptors', description: 'Preceptors at the selected locations', recipients: preceptorsForPicked(members) },
      { audience: 'Staff-Personnel', label: 'Site Personnel', description: 'Site staff at the selected locations', recipients: personnelForPicked(members) },
      { audience: 'School Contact', label: 'Schools', description: "School contacts for the students’ schools", recipients: schoolContactsForPicked(members) },
      { audience: 'Placement Faculty/CI', label: 'Placement Faculty / CI', description: 'Faculty and clinical instructors at those schools', recipients: facultyForPicked(members) },
    ];
  }, [selectedRows]);

  const nameHeader = kind === 'group' ? 'Group' : 'Student';
  const kindLabel = kind === 'group' ? 'Group' : kind === 'individual' ? 'Individual' : 'All';
  const overflowCount = bar.overflow.length;

  return (
    <>
      <div className={ds.listStickyToolbar}>
        <div className={ds.contentInset}>
          <div className="mb-3 pt-3"><ListKindTabs base={base} /></div>
          <div className={ds.listTimelineRow}>
            <nav className={ds.timelineSubNav} aria-label="Schedule timeline">
              {TIMELINES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setTimeline(t.id); setPage(0); setSelected(new Set()); }}
                    className={timeline === t.id ? ds.timelineSubActive : ds.timelineSubIdle}
                  >
                    <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                    {t.label}
                  </button>
                );
              })}
            </nav>
            <NeedsAttention onView={viewAttention} />
          </div>

          <div className={ds.tableCardTop}>
            <div className={ds.filterBarInner}>
              <div className={ds.filterBarWrap}>
                <div className={ds.filterBarPrimaryRow}>
                  <div className={ds.filterBarFacetsLine}>
                    <SearchCombo scope={scope} scopes={scopes} onScope={(s) => { setScopeId(s); setPage(0); }} value={query} onChange={(v) => { setQuery(v); setPage(0); }} />
                    {bar.inline.map((id) => <FacetButton key={id} id={id} rows={rows} filters={filters} onChange={(f) => { setFilters(f); setPage(0); }} />)}
                    {!expanded && overflowCount > 0 && (
                      <button type="button" className={ds.filterMoreLink} onClick={() => setExpanded(true)}>+{overflowCount} more</button>
                    )}
                  </div>
                  <div className={ds.filterToolbarCluster}>
                    {selectable && <BulkEmailMenu selectedCount={selectedRows.length} onCompose={() => setComposeOpen(true)} onHistory={() => setHistoryOpen(true)} />}
                    <button type="button" className={ds.addFilterBtn} onClick={() => overflowCount > 0 ? setExpanded(true) : todo('More filters')}>
                      <CirclePlus className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      Add Filter
                    </button>
                    <ToolbarIconButton icon={RotateCcw} label="Refresh filters" flip onClick={resetFilters} />
                    <ToolbarIconButton icon={expanded ? ChevronUp : ChevronDown} label={expanded ? 'Collapse filters' : 'Expand filters'} expanded={expanded} onClick={overflowCount > 0 ? () => setExpanded((e) => !e) : undefined} />
                    <div className={ds.filterToolbarDivider} aria-hidden />
                    <ToolbarIconButton icon={FileOutput} label="Export" bordered onClick={() => toast.success(`Exported ${filtered.length} ${filtered.length === 1 ? 'schedule' : 'schedules'} (prototype).`)} />
                    <ToolbarIconButton icon={Wrench} label="Table settings" bordered onClick={() => todo('Table settings')} />
                  </div>
                </div>
                {expanded && overflowCount > 0 && (
                  <div className={ds.filterBarSecondaryRow}>
                    {bar.overflow.map((id) => <FacetButton key={id} id={id} rows={rows} filters={filters} onChange={(f) => { setFilters(f); setPage(0); }} />)}
                  </div>
                )}
              </div>
            </div>
            <div ref={headRef} className={ds.headScroll}>
              <table className={tbl.table} style={tableStyle}>
                <TableColGroup selectable={selectable} />
                <thead>
                  <HeadRow nameHeader={nameHeader} selectable={selectable} leftId={leftId} leftName={leftName} allSelected={allSelected} onToggleAll={toggleAll} />
                </thead>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className={`${ds.contentInset} pb-6`}>
        <div className={ds.tableCardBottom}>
          <div ref={bodyRef} className={ds.bodyScroll} onScroll={() => { if (headRef.current && bodyRef.current) headRef.current.scrollLeft = bodyRef.current.scrollLeft; }}>
            <table className={tbl.table} style={tableStyle}>
              <TableColGroup selectable={selectable} />
              <tbody>
                {pageRows.map((r) => (
                  <BodyRow key={r.id} row={r} selectable={selectable} leftId={leftId} leftName={leftName} selected={selected.has(r.id)} onToggle={() => toggleOne(r.id)} />
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={16} className="px-4 py-12 text-center text-[14px] text-[#757575]">
                      No schedules match your search or filters.{' '}
                      <button type="button" className="font-medium text-[#3f51b5] hover:underline" onClick={resetFilters}>Reset filters</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className={`flex flex-wrap items-center justify-between gap-3 ${tbl.footer}`}>
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <select className="h-8 rounded border border-[#eceef1] bg-white px-2" value={PAGE_SIZE} disabled aria-readonly><option value={50}>50</option></select>
            </div>
            <span>Page {safePage + 1} of {pages} ({filtered.length} {filtered.length === 1 ? 'item' : 'items'})</span>
            <div className="flex items-center gap-1">
              <PageButton label="First page" disabled={safePage === 0} onClick={() => setPage(0)}><ChevronsLeft className="h-4 w-4" /></PageButton>
              <PageButton label="Previous page" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}><ChevronLeft className="h-4 w-4" /></PageButton>
              <PageButton label={`Page ${safePage + 1}`} active>{safePage + 1}</PageButton>
              <PageButton label="Next page" disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)}><ChevronRight className="h-4 w-4" /></PageButton>
              <PageButton label="Last page" disabled={safePage >= pages - 1} onClick={() => setPage(pages - 1)}><ChevronsRight className="h-4 w-4" /></PageButton>
            </div>
          </div>
        </div>
      </div>

      <BulkEmailFlow
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        surface={kind === 'group' ? groupVariant('site.schedules') : 'site.schedules'}
        personas={personas}
        audienceType="Student"
        selectionSummary={`${selectedRows.length} ${selectedRows.length === 1 ? 'schedule' : 'schedules'} selected · ${kindLabel}`}
        sourceSurface="Schedules"
        sourceSurfaceCandidates={['Schedules', 'Onboarding']}
      />
      <EmailHistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}

