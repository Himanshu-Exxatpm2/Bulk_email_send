import { useParams } from 'react-router';

/**
 * Lightweight placeholder for nav targets not yet designed.
 * Adding a real screen = config + screen component + one route line.
 */
export function PlaceholderPage({ title }: { title?: string }) {
  const params = useParams();
  const label = title ?? 'Coming soon';

  return (
    <div className="p-8">
      <div className="bg-card border border-neutral-200 rounded-md p-8 shadow-sm max-w-xl">
        <h1 className="text-lg font-semibold text-neutral-900 mb-2">{label}</h1>
        <p className="text-sm text-neutral-700">
          This screen is a stub for exploration. Wire a real screen via config + routes when ready.
        </p>
        {Object.keys(params).length > 0 && (
          <pre className="mt-4 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-md overflow-auto">
            {JSON.stringify(params, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
