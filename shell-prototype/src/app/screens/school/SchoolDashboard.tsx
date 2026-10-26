import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { FontAwesomeIcon } from '../../components/font-awesome-icon';
import { AvailabilityMap } from '../../components/charts/AvailabilityMap';
import {
  schoolDashboardCopy as copy,
  discoverFilters,
  journeySteps,
} from '../../config/schoolDashboard';
import { useSession } from '../../data/SessionContext';

interface SchoolOutletContext {
  schoolName?: string;
}

const CARD = 'bg-card rounded-xl border border-neutral-200/70 shadow-[0_1px_2px_rgba(16,24,40,0.05)]';

export function SchoolDashboard() {
  const { session } = useSession();
  useOutletContext<SchoolOutletContext | undefined>();
  const firstName = session.userDisplayName.split(' ')[0];
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [year] = useState('2026');

  return (
    <div className="min-h-full bg-[#f6f5fb] p-6">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-6 xl:grid-cols-[1fr_360px] items-start">
        {/* Main column */}
        <div className="space-y-6">
          <h1 className="text-lg font-semibold text-neutral-900">
            {copy.greetingPrefix}, {firstName}.
          </h1>

          {/* Your Tasks */}
          <section className={`${CARD} p-5`}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-base font-semibold text-neutral-900">{copy.tasksTitle}</h2>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-sm text-blue-500">
                  <FontAwesomeIcon name="comments" className="w-4 h-4" />
                  {copy.tasksNewMessages}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-blue-500">
                  <FontAwesomeIcon name="chartBar" className="w-4 h-4" />
                  {copy.tasksActivityDashboard}
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-neutral-50 px-4 py-5">
              <span className="flex size-9 items-center justify-center rounded-full bg-purple-100 text-purple-600 shrink-0">
                <FontAwesomeIcon name="mapPin" className="w-4 h-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{copy.tasksEmptyTitle}</p>
                <p className="text-xs text-neutral-600 mt-0.5">{copy.tasksEmptyBody}</p>
              </div>
            </div>
          </section>

          {/* Discover Availabilities */}
          <section className={`${CARD} p-5`}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-base font-semibold text-neutral-900">{copy.discoverTitle}</h2>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-sm text-blue-500">
                  <FontAwesomeIcon name="bookmark" className="w-4 h-4" />
                  {copy.discoverBookmarks}{' '}
                  <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-100 px-1 text-[11px] font-semibold text-neutral-700">
                    0
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-blue-500">
                  <FontAwesomeIcon name="mapLocationDot" className="w-4 h-4" />
                  {copy.discoverExploreMap}
                </span>
              </div>
            </div>

            {/* Filter row */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {discoverFilters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-neutral-200 bg-card px-3 text-sm text-neutral-700 hover:bg-neutral-50"
                >
                  <FontAwesomeIcon name={f.icon} className="w-4 h-4 text-neutral-500" />
                  {f.label}
                  <FontAwesomeIcon name="chevronDown" className="w-3 h-3 text-neutral-400" />
                </button>
              ))}
              <button
                type="button"
                aria-label="Search availabilities"
                className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-card text-neutral-600 hover:bg-neutral-50"
              >
                <FontAwesomeIcon name="search" className="w-4 h-4" />
              </button>
            </div>

            {/* Availability landscape map */}
            <div className="mt-4 rounded-xl border border-neutral-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">{copy.landscapeTitle}</h3>
                  <p className="text-xs text-neutral-600 mt-0.5 max-w-xl">{copy.landscapeSubtitle}</p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-2 rounded-md border border-neutral-200 px-3 text-sm text-neutral-700"
                >
                  {year}
                  <FontAwesomeIcon name="chevronDown" className="w-3 h-3 text-neutral-400" />
                </button>
              </div>
              <AvailabilityMap />
            </div>
          </section>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          {/* Promo */}
          <section className="rounded-xl bg-[linear-gradient(160deg,#efe8fb_0%,#f6eefc_55%,#fdeef6_100%)] border border-purple-200/60 p-5">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-positive-strong text-neutral-0">
              {copy.promoBadge}
            </span>
            <h3 className="mt-3 text-base font-bold text-neutral-900 leading-snug">
              {copy.promoTitle}
            </h3>
            <p className="mt-1 text-sm text-neutral-700">{copy.promoBody}</p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 h-9 px-4 rounded-md bg-purple-600 text-neutral-0 text-sm font-medium hover:bg-purple-700"
            >
              <FontAwesomeIcon name="briefcase" className="w-4 h-4" />
              {copy.promoCta}
            </button>
          </section>

          {/* Journey stepper */}
          <section className="rounded-xl bg-[linear-gradient(180deg,#eef1fb_0%,#ffffff_30%)] border border-neutral-200 p-5">
            <h3 className="text-base font-bold text-neutral-900">{copy.journeyTitle}</h3>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600">
              <FontAwesomeIcon name="sparkles" className="w-3.5 h-3.5" />
              {copy.journeyKicker}
            </p>

            <ul className="mt-4 space-y-2">
              {journeySteps.map((step) => {
                const open = openStep === step.id;
                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenStep(open ? null : step.id)}
                      className="flex w-full items-center gap-3 rounded-lg border border-neutral-200 bg-card px-3 py-2.5 text-left hover:bg-neutral-50"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[12px] font-semibold text-blue-700">
                        {step.id}
                      </span>
                      <span className="flex-1 text-sm text-neutral-800">{step.label}</span>
                      <FontAwesomeIcon
                        name="chevronDown"
                        className={`w-3 h-3 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex flex-col items-center gap-1 text-center">
              <p className="text-xs text-neutral-600">
                {copy.journeyConnect.replace('Connect with us', '')}
                <button type="button" className="font-medium text-blue-500 hover:underline">
                  Connect with us
                </button>
              </p>
              <button type="button" className="text-xs font-medium text-blue-500 hover:underline">
                {copy.journeyHide}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
