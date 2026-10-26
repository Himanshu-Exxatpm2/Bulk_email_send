/**
 * Sites launch page (Figma 263:3288) — shown when a Site admin has 2+ sites.
 * Network Layer tab is intentionally out of scope for this shell.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { LaunchGrid, type LaunchGridItem } from '../../components/LaunchGrid';
import { launchSiteCards } from '../../config/launchPage';
import { useSession } from '../../data/SessionContext';
import { getVisibleSites } from '../../data/session';

export function AllSitesLaunchPage() {
  const { session } = useSession();
  const navigate = useNavigate();

  const items: LaunchGridItem[] = useMemo(() => {
    const fromSession = getVisibleSites(session);
    const extras = launchSiteCards.filter(
      (c) => !fromSession.some((s) => s.id === c.id),
    );
    return [
      ...fromSession.map((s) => ({ id: s.id, title: s.name, subtitle: s.location })),
      ...extras.map((c) => ({ id: c.id, title: c.name, subtitle: c.location })),
    ];
  }, [session]);

  return (
    <LaunchGrid
      items={items}
      icon="building"
      emptyNoun="sites"
      onSelect={(id) => navigate(`/site/${id}`)}
    />
  );
}
