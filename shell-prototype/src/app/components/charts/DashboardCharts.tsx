/**
 * Dashboard charts — Highcharts, matching the chart stack used by @exxat/ui.
 * Colors resolve from Exxat tokens so theme/color-scheme switches carry through.
 */

import { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import { tokenColor } from '../../data/mockData';

const CHART_FONT = "'Source Sans 3', Inter, sans-serif";

export interface ChartSegment {
  name: string;
  value: number;
  colorToken: string;
}

function useHighchart(build: () => Highcharts.Options, deps: unknown[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Highcharts.Chart | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    chartRef.current = Highcharts.chart(containerRef.current, build());
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}

export function SchedulePieChart({
  data,
  height = 200,
  ariaLabel,
}: {
  data: ChartSegment[];
  height?: number;
  ariaLabel: string;
}) {
  const ref = useHighchart(
    () => ({
      chart: {
        type: 'pie',
        height,
        backgroundColor: 'transparent',
        style: { fontFamily: CHART_FONT },
        spacing: [4, 4, 4, 4],
      },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false },
      tooltip: {
        pointFormat: '<b>{point.y}</b>',
        style: { fontSize: '12px' },
      },
      accessibility: { description: ariaLabel },
      plotOptions: {
        pie: {
          size: '85%',
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            connectorWidth: 1,
            connectorColor: tokenColor('neutral-300'),
            distance: 14,
            format: '{point.name} ({point.y})',
            style: {
              fontFamily: CHART_FONT,
              fontSize: '11px',
              fontWeight: '400',
              color: tokenColor('neutral-700'),
              textOutline: 'none',
            },
          },
        },
      },
      series: [
        {
          type: 'pie',
          name: 'Schedules',
          data: data
            .filter((d) => d.value > 0)
            .map((d) => ({
              name: d.name,
              y: d.value,
              color: tokenColor(d.colorToken),
            })),
        },
      ],
    }),
    [data, height, ariaLabel]
  );

  return <div ref={ref} role="img" aria-label={ariaLabel} />;
}

export function RequestAgingChart({
  categories,
  series,
  xAxisTitle,
  yAxisTitle,
  height = 360,
}: {
  categories: readonly string[];
  series: readonly { name: string; colorToken: string; data: readonly number[] }[];
  xAxisTitle: string;
  yAxisTitle: string;
  height?: number;
}) {
  const ref = useHighchart(
    () => ({
      chart: {
        type: 'column',
        height,
        backgroundColor: 'transparent',
        style: { fontFamily: CHART_FONT },
        spacing: [8, 8, 8, 8],
      },
      title: { text: undefined },
      credits: { enabled: false },
      accessibility: { description: 'Request aging by time period' },
      xAxis: {
        categories: [...categories],
        title: {
          text: xAxisTitle,
          style: { color: tokenColor('neutral-700'), fontSize: '12px' },
        },
        lineColor: tokenColor('neutral-200'),
        tickColor: tokenColor('neutral-200'),
        labels: { style: { color: tokenColor('neutral-700'), fontSize: '12px' } },
      },
      yAxis: {
        min: 0,
        tickInterval: 25,
        title: {
          text: yAxisTitle,
          style: { color: tokenColor('neutral-700'), fontSize: '12px' },
        },
        gridLineColor: tokenColor('neutral-200'),
        labels: { style: { color: tokenColor('neutral-700'), fontSize: '12px' } },
      },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        symbolRadius: 6,
        symbolHeight: 10,
        symbolWidth: 10,
        itemStyle: {
          fontFamily: CHART_FONT,
          fontSize: '12px',
          fontWeight: '400',
          color: tokenColor('neutral-700'),
        },
      },
      tooltip: { shared: true },
      plotOptions: {
        column: {
          stacking: 'normal',
          borderWidth: 0,
          pointWidth: 52,
          dataLabels: {
            enabled: true,
            filter: { property: 'y', operator: '>', value: 0 },
            style: {
              fontFamily: CHART_FONT,
              fontSize: '11px',
              fontWeight: '600',
              color: '#ffffff',
              textOutline: 'none',
            },
          },
        },
      },
      series: series.map((s) => ({
        type: 'column' as const,
        name: s.name,
        color: tokenColor(s.colorToken),
        data: [...s.data],
      })),
    }),
    [categories, series, xAxisTitle, yAxisTitle, height]
  );

  return <div ref={ref} />;
}

export function ChartLegend({ items }: { items: ChartSegment[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
      {items.map((item) => (
        <li key={item.name} className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: `var(--color-${item.colorToken})` }}
          />
          <span className="text-xs text-neutral-700 truncate">
            {item.name} ({item.value})
          </span>
        </li>
      ))}
    </ul>
  );
}
