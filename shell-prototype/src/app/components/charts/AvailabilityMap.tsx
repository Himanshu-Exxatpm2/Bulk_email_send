/**
 * US availability choropleth (Figma 413:7475 "Availability Landscape").
 * Highcharts Maps + the US states topology fetched from the Highcharts CDN at
 * runtime, so we don't vendor @highcharts/map-collection into this shell.
 */

import { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsMap from 'highcharts/modules/map';
import usTopology from '../../../assets/maps/us-all.topo.json';
import { availabilityByState } from '../../config/schoolDashboard';
import { tokenColor } from '../../data/mockData';

// Register the map module once (guarded for HMR / double-invoke).
type MapInit = (hc: typeof Highcharts) => void;
const initMap = HighchartsMap as unknown as MapInit;
if (typeof (Highcharts as unknown as { mapChart?: unknown }).mapChart !== 'function') {
  try {
    initMap(Highcharts);
  } catch {
    /* already registered */
  }
}

export function AvailabilityMap({ height = 420 }: { height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Highcharts.Chart | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const data: [string, number][] = Object.entries(availabilityByState).map(
        ([key, value]) => [key, value],
      );

      const options = {
        chart: {
          map: usTopology,
          height,
          backgroundColor: 'transparent',
          spacing: [4, 4, 4, 4],
        },
        title: { text: undefined },
        credits: { enabled: false },
        accessibility: { description: 'US availability by state' },
        mapNavigation: { enabled: false },
        legend: { enabled: false },
        colorAxis: {
          min: 0,
          minColor: '#e4e7f6',
          maxColor: tokenColor('blue-500'),
        },
        tooltip: {
          headerFormat: '',
          pointFormat: '<b>{point.name}</b>: {point.value} availabilities',
          style: { fontSize: '12px' },
        },
        series: [
          {
            type: 'map',
            data,
            nullColor: '#eef0f4',
            borderColor: '#ffffff',
            borderWidth: 0.5,
            states: { hover: { borderColor: tokenColor('blue-700') } },
            name: 'Availabilities',
          },
        ],
      } as unknown as Highcharts.Options;

      chartRef.current = (
        Highcharts as unknown as {
          mapChart: (el: HTMLElement, opts: Highcharts.Options) => Highcharts.Chart;
        }
      ).mapChart(containerRef.current, options);
    } catch {
      setError(true);
    }

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [height]);

  if (error) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-lg bg-neutral-50 text-sm text-neutral-600"
      >
        Availability map unavailable.
      </div>
    );
  }

  return <div ref={containerRef} style={{ height }} role="img" aria-label="US availability map" />;
}
