/**
 * Network Layer Admin shell — Figma 370:1052 structure:
 * App header → Page header → ContextBar → outlet.
 */

import { Outlet, useLocation, useParams } from 'react-router';
import { NetworkAppHeader } from '../components/network/NetworkAppHeader';
import { NetworkPageHeader } from '../components/network/NetworkPageHeader';
import { NetworkContextBar } from '../components/network/NetworkContextBar';
import { useSession } from '../data/SessionContext';
import { findConsortium } from '../data/session';

export function NetworkShell() {
  const { session } = useSession();
  const location = useLocation();
  const { consortiumId } = useParams<{ consortiumId: string }>();

  const consortium = consortiumId ? findConsortium(session, consortiumId) : undefined;
  const consortiumName = consortium?.name ?? 'MDDC Nursing Consortium';
  const fullName = consortium?.fullName ?? 'Maryland–DC Nursing Consortium (MDDC)';
  const region = consortium?.region ?? 'Maryland & Washington DC Region';
  const initial = (consortium?.shortName ?? 'M').charAt(0).toUpperCase();
  const base = `/network/${consortiumId}`;

  const activeId = (() => {
    if (location.pathname.includes('/members')) return 'members';
    if (location.pathname.includes('/communications')) return 'communications';
    if (location.pathname.includes('/reports')) return 'reports';
    return 'overview';
  })();

  const subtitle =
    activeId === 'members'
      ? `Member directory for the ${consortium?.discipline?.toLowerCase() ?? 'nursing'} consortium · ${region}`
      : `Network layer dashboard of the MDDC nursing consortium · ${region}`;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-neutral-50">
      <NetworkAppHeader consortiumName={consortiumName} />
      <NetworkPageHeader initial={initial} title={fullName} subtitle={subtitle} />
      <NetworkContextBar basePath={base} activeId={activeId} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
