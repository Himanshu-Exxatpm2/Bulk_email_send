/**
 * Placement Funnel Health hero — ports Exxat-UI / network-hero-funnel-prototype-v3
 * using Highcharts for Drop-off + Progression fidelity.
 */

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import {
  FUNNEL_BAR_COLORS,
  FUNNEL_LINE_COLORS,
  funnelCopy,
  funnelInsights,
  funnelKpis,
  funnelMonths,
  funnelRate,
  type FunnelDesign,
} from '../../config/placementFunnel';

const INSIGHT_ACCENT = {
  red: '#EF4444',
  amber: '#F59E0B',
  indigo: '#6366F1',
} as const;

export function PlacementFunnelHero() {
  const chartId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Highcharts.Chart | null>(null);
  const [design, setDesign] = useState<FunnelDesign>('progression');
  const [kpisOpen, setKpisOpen] = useState(true);

  const categories = useMemo(() => funnelMonths.map((m) => m.month), []);
  const req = useMemo(() => funnelMonths.map((m) => m.requested), []);
  const app = useMemo(() => funnelMonths.map((m) => m.approved), []);
  const conf = useMemo(() => funnelMonths.map((m) => m.confirmed), []);
  const onb = useMemo(() => funnelMonths.map((m) => m.onboarded), []);

  useEffect(() => {
    if (!containerRef.current) return;

    const rAppr = app.map((a, i) => funnelRate(a, req[i]));
    const rConf = conf.map((c, i) => funnelRate(c, app[i]));
    const rOnb = onb.map((o, i) => funnelRate(o, conf[i]));
    const rOvr = onb.map((o, i) => funnelRate(o, req[i]));

    const lineSeries: Highcharts.SeriesOptionsType[] = [
      {
        type: 'line',
        name: 'Approval rate',
        data: rAppr,
        yAxis: 1,
        color: FUNNEL_LINE_COLORS.approval,
        lineWidth: 2.25,
        marker: { radius: 3, lineColor: '#fff', lineWidth: 1, symbol: 'circle' },
        zIndex: 10,
      },
      {
        type: 'line',
        name: 'Confirmation rate',
        data: rConf,
        yAxis: 1,
        color: FUNNEL_LINE_COLORS.confirmation,
        lineWidth: 2.25,
        marker: { radius: 3, lineColor: '#fff', lineWidth: 1, symbol: 'circle' },
        zIndex: 10,
      },
      {
        type: 'line',
        name: 'Onboarding rate',
        data: rOnb,
        yAxis: 1,
        color: FUNNEL_LINE_COLORS.onboarding,
        lineWidth: 2.25,
        marker: { radius: 3, lineColor: '#fff', lineWidth: 1, symbol: 'circle' },
        zIndex: 11,
      },
      {
        type: 'line',
        name: 'Overall placement rate',
        data: rOvr,
        yAxis: 1,
        color: FUNNEL_LINE_COLORS.overall,
        lineWidth: 2,
        dashStyle: 'ShortDash',
        marker: { radius: 3, lineColor: '#fff', lineWidth: 1, symbol: 'circle' },
        zIndex: 10,
      },
    ];

    const isDropoff = design === 'dropoff';
    let barSeries: Highcharts.SeriesOptionsType[];

    if (isDropoff) {
      const gRA = req.map((r, i) => r - app[i]);
      const gAC = app.map((a, i) => a - conf[i]);
      const gCO = conf.map((c, i) => c - onb[i]);
      barSeries = [
        {
          type: 'column',
          name: 'Onboarded',
          data: onb,
          color: FUNNEL_BAR_COLORS.onboarded,
          stack: 'f',
          zIndex: 1,
        },
        {
          type: 'column',
          name: 'Confirmed · not onboarded',
          data: gCO,
          color: FUNNEL_BAR_COLORS.confirmed,
          stack: 'f',
          zIndex: 1,
        },
        {
          type: 'column',
          name: 'Approved · not confirmed',
          data: gAC,
          color: FUNNEL_BAR_COLORS.approved,
          stack: 'f',
          zIndex: 1,
        },
        {
          type: 'column',
          name: 'Requested · not approved',
          data: gRA,
          color: FUNNEL_BAR_COLORS.requested,
          stack: 'f',
          zIndex: 1,
        },
      ];
    } else {
      const pw = [26, 19, 12, 6] as const;
      barSeries = [
        {
          type: 'column',
          name: 'Requested',
          data: req,
          color: FUNNEL_BAR_COLORS.requested,
          grouping: false,
          pointWidth: pw[0],
          borderWidth: 0,
          zIndex: 1,
        },
        {
          type: 'column',
          name: 'Approved',
          data: app,
          color: FUNNEL_BAR_COLORS.approved,
          grouping: false,
          pointWidth: pw[1],
          borderWidth: 0,
          zIndex: 2,
        },
        {
          type: 'column',
          name: 'Confirmed',
          data: conf,
          color: FUNNEL_BAR_COLORS.confirmed,
          grouping: false,
          pointWidth: pw[2],
          borderWidth: 0,
          zIndex: 3,
        },
        {
          type: 'column',
          name: 'Onboarded',
          data: onb,
          color: FUNNEL_BAR_COLORS.onboarded,
          grouping: false,
          pointWidth: pw[3],
          borderWidth: 0,
          zIndex: 4,
        },
      ];
    }

    const BAR = FUNNEL_BAR_COLORS;
    const LN = FUNNEL_LINE_COLORS;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = Highcharts.chart(containerRef.current, {
      chart: {
        spacing: [4, 2, 2, 2],
        style: {
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif',
        },
        animation: { duration: 300 },
        backgroundColor: 'transparent',
      },
      title: { text: undefined },
      credits: { enabled: false },
      xAxis: {
        categories,
        labels: { style: { fontSize: '10px', color: '#64748B' } },
        lineColor: '#E5E9F0',
        tickLength: 0,
      },
      yAxis: [
        {
          title: {
            text: 'Slots',
            style: { fontSize: '10px', color: '#94A3B8' },
          },
          gridLineColor: '#EEF2F7',
          labels: { style: { fontSize: '10px', color: '#94A3B8' } },
        },
        {
          title: {
            text: 'Rate %',
            style: { fontSize: '10px', color: '#334155' },
          },
          min: 0,
          max: 100,
          opposite: true,
          gridLineWidth: 0,
          labels: {
            format: '{value}%',
            style: { fontSize: '10px', color: '#334155' },
          },
        },
      ],
      plotOptions: {
        column: {
          stacking: isDropoff ? 'normal' : undefined,
          borderRadius: isDropoff ? 0 : 2,
          pointPadding: 0.06,
          groupPadding: 0.12,
        },
        line: { connectNulls: false },
        series: { states: { inactive: { opacity: 0.25 } } },
      },
      legend: {
        itemStyle: {
          fontSize: '9.5px',
          fontWeight: '600',
          color: '#475569',
        },
        symbolRadius: 2,
        symbolHeight: 8,
        symbolWidth: 9,
        itemDistance: 9,
        padding: 2,
        margin: 3,
        y: 2,
        maxHeight: 44,
      },
      tooltip: {
        shared: true,
        useHTML: true,
        borderWidth: 0,
        backgroundColor: '#FFFFFF',
        style: { fontSize: '11px' },
        formatter: function () {
          const i = this.points?.[0]?.point.index ?? 0;
          const r = req[i];
          const a = app[i];
          const c = conf[i];
          const o = onb[i];
          const p = (n: number, dn: number) =>
            dn >= 10 ? `${Math.round((n / dn) * 100)}%` : '—';
          return (
            `<b>${this.x}</b><br>` +
            `<span style="color:${BAR.requested}">■</span> Requested: <b>${r.toLocaleString()}</b><br>` +
            `<span style="color:${BAR.approved}">■</span> Approved: <b>${a.toLocaleString()}</b> · rate ${p(a, r)}<br>` +
            `<span style="color:${BAR.confirmed}">■</span> Confirmed: <b>${c.toLocaleString()}</b> · rate ${p(c, a)}<br>` +
            `<span style="color:${BAR.onboarded}">■</span> Onboarded: <b>${o.toLocaleString()}</b> · rate ${p(o, c)}<br>` +
            `<span style="color:${LN.overall}">▬</span> Overall placement: <b>${p(o, r)}</b>`
          );
        },
      },
      series: [...barSeries, ...lineSeries],
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [design, categories, req, app, conf, onb]);

  return (
    <section className="overflow-hidden rounded-xl border border-[#E5E9F0] bg-card shadow-sm">
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_420px]">
        {/* Chart pane */}
        <div className="flex min-h-[295px] flex-col p-4">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold tracking-tight text-slate-900">
                {funnelCopy.title}
              </h2>
              <p className="mt-0.5 text-[11.5px] text-slate-500">
                {funnelCopy.subtitle}
              </p>
            </div>
            <div className="inline-flex shrink-0 gap-0.5 rounded-lg border border-[#E5E9F0] bg-[#F1F4F9] p-0.5">
              {(
                [
                  { id: 'dropoff' as const, label: 'Drop-off' },
                  { id: 'progression' as const, label: 'Progression' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDesign(opt.id)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                    design === opt.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div
            id={chartId}
            ref={containerRef}
            className="min-h-0 flex-1"
            style={{ height: 230 }}
          />
        </div>

        {/* Leo Insights pane */}
        <aside className="flex flex-col border-t border-[#E5E9F0] p-4 lg:border-t-0 lg:border-l">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-900">
              <span className="grid h-[18px] w-[18px] place-items-center rounded-[5px] bg-gradient-to-br from-violet-600 to-pink-600 text-[11px] text-white">
                ✦
              </span>
              {funnelCopy.leoTitle}
            </div>
            <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
              {funnelCopy.bottleneck}
            </span>
          </div>

          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[9.5px] font-bold tracking-wider text-slate-400 uppercase">
              {funnelCopy.keySignals}
            </span>
            <button
              type="button"
              onClick={() => setKpisOpen((v) => !v)}
              className="rounded-md border border-[#E5E9F0] bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-slate-50"
            >
              {kpisOpen ? 'Hide ▾' : 'Show ▸'}
            </button>
          </div>

          {kpisOpen && (
            <div className="mb-2.5 grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {funnelKpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className="rounded-lg border border-[#E5E9F0] bg-slate-50 px-2 py-1.5"
                >
                  <div
                    className={`text-[15px] leading-none font-extrabold ${
                      kpi.tone === 'danger' ? 'text-red-700' : 'text-slate-900'
                    }`}
                  >
                    {kpi.value}
                  </div>
                  <div className="mt-1 text-[8.5px] leading-tight tracking-wide text-slate-500 uppercase">
                    {kpi.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
            {funnelInsights.map((ins) => (
              <div
                key={ins.id}
                className="flex gap-2 rounded-[7px] border border-[#E5E9F0] bg-[#FBFCFE] py-1.5 pr-2 pl-2 text-[11px] leading-snug"
                style={{ borderLeftWidth: 3, borderLeftColor: INSIGHT_ACCENT[ins.tone] }}
              >
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: INSIGHT_ACCENT[ins.tone] }}
                />
                <p className="text-slate-700">
                  <b className="font-bold text-slate-900">{ins.title}</b>{' '}
                  {ins.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-2 text-[9.5px] text-slate-400">{funnelCopy.footer}</p>
        </aside>
      </div>
    </section>
  );
}
