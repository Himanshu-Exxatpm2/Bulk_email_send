import { useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router';
import { FontAwesomeIcon } from '../../components/font-awesome-icon';
import {
  SchedulePieChart,
  RequestAgingChart,
  ChartLegend,
} from '../../components/charts/DashboardCharts';
import {
  siteHeroCopy,
  siteKpiTiles,
  siteSchedulesOverview,
  siteOnboardingOverview,
  siteRequestAging,
  siteQuickActions,
  siteRecentActivities,
  siteSchedulePeriodOptions,
  siteDashboardCopy,
} from '../../config/siteDashboard';
import heroIllustration from '../../../assets/dashboard/hero-jobs.png';

interface SiteOutletContext {
  siteName?: string;
}

const CARD = 'bg-card rounded-xl shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)]';

/**
 * Site-admin Home dashboard — hero, KPIs, schedules + onboarding pies,
 * request aging, quick actions, and the recent activities rail.
 */
export function SiteDashboard() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const ctx = useOutletContext<SiteOutletContext | undefined>();
  const siteName = ctx?.siteName ?? 'Bedlam-Hospital';
  const [period, setPeriod] = useState<string>(siteSchedulePeriodOptions[0].id);

  const go = (href: string) => navigate(`/site/${siteId}${href}`);

  return (
    <div className="bg-neutral-50 min-h-full">
      {/* Post Job hero — full-bleed across the content area */}
      <section className="relative overflow-hidden bg-[linear-gradient(90deg,#f7e9f8_0%,#efe8fb_38%,#f4f1fd_62%,#ffffff_100%)]">
        <div className="flex items-center justify-between gap-6 px-6 py-5 min-h-[132px]">
          <div className="max-w-xl">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm bg-purple-200 text-purple-700 mb-2">
              {siteHeroCopy.badge}
            </span>
            <h2 className="text-xl font-bold text-neutral-900 leading-7">
              {siteHeroCopy.title}
            </h2>
            <p className="text-sm text-neutral-700 mt-1 mb-3">{siteHeroCopy.subtitle}</p>
            <button
              type="button"
              onClick={() => go(siteHeroCopy.ctaHref)}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-blue-500 text-neutral-0 text-sm font-medium hover:bg-blue-600"
            >
              <FontAwesomeIcon name="briefcase" className="w-4 h-4" />
              {siteHeroCopy.ctaLabel}
            </button>
          </div>
          <img
            src={heroIllustration}
            alt=""
            aria-hidden
            className="hidden md:block h-[160px] w-[220px] object-contain shrink-0"
          />
        </div>
      </section>

      <div className="p-6 space-y-6">
        <h1 className="text-lg font-semibold text-neutral-900 leading-7">
          {siteDashboardCopy.greetingPrefix}, {siteName}
        </h1>

        {/* KPI tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {siteKpiTiles.map((tile) => (
            <div key={tile.id} className={`${CARD} p-4 flex gap-3`}>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-neutral-700 leading-5">{tile.label}</p>
                <p className="text-2xl font-bold text-neutral-900 leading-8 mt-1">{tile.value}</p>
                {tile.subtext && (
                  <p className="text-xs text-neutral-700 mt-1">{tile.subtext}</p>
                )}
              </div>
              <div className="flex flex-col items-end justify-between shrink-0">
                <span className="size-[18px] flex items-center justify-center overflow-clip">
                  <img src={tile.icon} alt="" aria-hidden className="size-full object-contain" />
                </span>
                <button
                  type="button"
                  onClick={() => go(tile.href)}
                  aria-label={`View ${tile.label}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-500 hover:underline"
                >
                  {siteDashboardCopy.viewLink}
                  <FontAwesomeIcon name="chevronRight" className="w-2.5 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Charts + activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming schedules overview */}
            <section className={`${CARD} p-6`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <h2 className="text-lg font-semibold text-neutral-900 leading-7">
                  {siteDashboardCopy.schedulesOverviewTitle}
                </h2>
                <div className="flex items-center gap-2">
                  {siteSchedulePeriodOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={period === opt.id}
                      onClick={() => setPeriod(opt.id)}
                      className={`h-8 px-4 rounded-md text-sm font-medium ${
                        period === opt.id
                          ? 'bg-blue-500 text-neutral-0'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-neutral-900 text-center">
                    {siteDashboardCopy.schedulesChartTitle}
                  </h3>
                  <p className="text-xs text-neutral-700 text-center mt-0.5">
                    {siteDashboardCopy.schedulesChartSubtitle}
                  </p>
                  <SchedulePieChart
                    data={siteSchedulesOverview}
                    ariaLabel="Schedules overview by status"
                  />
                  <ChartLegend items={siteSchedulesOverview} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-neutral-900 text-center">
                    {siteDashboardCopy.onboardingChartTitle}
                  </h3>
                  <p className="text-xs text-neutral-700 text-center mt-0.5">
                    {siteDashboardCopy.onboardingChartSubtitle}
                  </p>
                  <SchedulePieChart
                    data={siteOnboardingOverview}
                    ariaLabel="Student onboarding overview by status"
                  />
                  <ChartLegend items={siteOnboardingOverview} />
                </div>
              </div>
            </section>

            {/* Request aging */}
            <section className={`${CARD} p-6`}>
              <h2 className="text-lg font-semibold text-neutral-900 leading-7">
                {siteDashboardCopy.requestAgingTitle}
              </h2>
              <p className="text-sm text-neutral-700">{siteDashboardCopy.requestAgingSubtitle}</p>
              <div className="pt-4">
                <RequestAgingChart
                  categories={siteRequestAging.categories}
                  series={siteRequestAging.series}
                  xAxisTitle={siteRequestAging.xAxisTitle}
                  yAxisTitle={siteRequestAging.yAxisTitle}
                />
              </div>
            </section>

            {/* Quick actions */}
            <section className={`${CARD} p-6`}>
              <h2 className="text-lg font-semibold text-neutral-900 leading-7 mb-4">
                {siteDashboardCopy.quickActionsTitle}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                {siteQuickActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => go(action.href)}
                    className="border border-neutral-200 rounded-lg min-h-[120px] p-4 flex flex-col items-center justify-center text-center hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
                  >
                    <span className="size-10 rounded-full bg-card shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)] flex items-center justify-center mb-3">
                      <img
                        src={action.icon}
                        alt=""
                        aria-hidden
                        className="w-[17.5px] h-[14px] object-contain"
                      />
                    </span>
                    <span className="text-sm font-bold text-neutral-900 leading-5">
                      {action.label}
                    </span>
                    <span className="text-xs text-neutral-700 leading-4 mt-1">
                      {action.description}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Recent activities rail */}
          <section className={`${CARD} p-6 lg:sticky lg:top-6`}>
            <h2 className="text-lg font-semibold text-neutral-900 leading-7 mb-4">
              {siteDashboardCopy.recentActivitiesTitle}
            </h2>
            <ul className="space-y-5 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto pr-1">
              {siteRecentActivities.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span className="size-5 rounded bg-positive-strong/10 flex items-center justify-center shrink-0 mt-0.5">
                    <FontAwesomeIcon
                      name="listCheck"
                      className="w-3 h-3 text-positive-strong"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-neutral-900 leading-5">{item.text}</p>
                    {item.discipline && (
                      <p className="text-xs text-neutral-900 mt-1">
                        <span className="font-semibold">Discipline:</span> {item.discipline}
                      </p>
                    )}
                    <p className="text-xs text-neutral-900 mt-1 break-words">
                      <span className="font-semibold">Location:</span> {item.location}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Updated on {item.updatedOn} by {item.updatedBy}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
