import { useLayoutEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useParams } from 'react-router';
import { toast } from 'sonner';
import { FONT, ds } from './designTokens';

const TABS = [
  { to: 'overview', label: 'Overview' },
  { to: 'list/all', label: 'Schedules List' },
  { to: 'calendar', label: 'Calendar', badge: 'New' },
  { to: 'report', label: 'Report' },
];

function ModuleTabs() {
  const { pathname } = useLocation();
  const { siteId } = useParams();
  const base = `/site/${siteId}/schedules`;
  const isActive = (to: string) =>
    to === 'overview' ? pathname.endsWith('/schedules/overview')
      : to.startsWith('list') ? pathname.includes('/schedules/list')
      : to === 'calendar' ? pathname.endsWith('/schedules/calendar')
      : pathname.endsWith('/schedules/report');
  return (
    <nav className={ds.tabListOuter} aria-label="Schedules views">
      <div className={`${ds.tabListRow} ${FONT}`}>
        {TABS.map((t, i) => (
          <NavLink
            key={t.to}
            to={`${base}/${t.to}`}
            className={() => {
              if (isActive(t.to)) return `${ds.tabSegment} ${ds.tabSegmentActive}`;
              let c = `${ds.tabSegment} ${ds.tabSegmentIdle}`;
              if (i === 0) c += ` ${ds.tabSegmentFirst}`;
              if (i === TABS.length - 1) c += ` ${ds.tabSegmentLast}`;
              return c;
            }}
          >
            <span className="inline-flex items-center">
              {t.label}
              {t.badge && <span className={ds.tabNewBadge}>{t.badge}</span>}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

/**
 * Schedules and Onboarding module shell: a sticky title row with the view tabs and the Add Schedule button,
 * above whichever view the route renders. The measured height of the title row is exposed as a CSS
 * variable so the list's own toolbar can stick directly beneath it.
 */
export function SchedulesModule() {
  const chromeRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = chromeRef.current;
    if (!el) return;
    const apply = () => el.closest<HTMLElement>('[data-schedules-layout]')?.style.setProperty('--schedules-module-chrome-height', `${el.offsetHeight}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div data-schedules-layout className={`min-h-full ${ds.page} ${FONT}`}>
      <div ref={chromeRef} className={ds.moduleSticky}>
        <div className={ds.moduleHeaderInner}>
          <h1 className={ds.moduleTitle}>Schedules and Onboarding</h1>
          <div className={ds.tabPillWrap}><ModuleTabs /></div>
          <div className={ds.addBtnWrap}>
            <button type="button" className={ds.addBtn} onClick={() => toast.info("Adding a schedule isn't part of this prototype yet.")}>+ Add Schedule</button>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}

/** Calendar and Report are not built in the design team's build either. */
export function SchedulesPlaceholder({ title }: { title: string }) {
  return (
    <div className={`${ds.contentInset} py-8`}>
      <div className={`${ds.card} p-10 text-center`}>
        <h2 className="text-base font-semibold text-[#212121]">{title}</h2>
        <p className="mt-2 text-sm text-[#757575]">This view isn't built yet. Use Overview or Schedules List.</p>
      </div>
    </div>
  );
}
