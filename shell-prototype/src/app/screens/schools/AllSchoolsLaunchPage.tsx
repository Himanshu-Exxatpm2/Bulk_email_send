/**
 * Schools launch page (Figma 413:6334) — shown when a School admin has 2+ schools.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { LaunchGrid, type LaunchGridItem } from '../../components/LaunchGrid';
import { schoolLaunchCards, schoolLaunchTotalCount } from '../../config/schools';
import { useSession } from '../../data/SessionContext';
import { getVisibleSchools, schoolLabel } from '../../data/session';

export function AllSchoolsLaunchPage() {
  const { session } = useSession();
  const navigate = useNavigate();

  const items: LaunchGridItem[] = useMemo(() => {
    const fromSession = getVisibleSchools(session).map((s) => ({
      id: s.id,
      title: schoolLabel(s),
    }));
    const extras = schoolLaunchCards
      .filter((c) => !fromSession.some((s) => s.id === c.id))
      .map((c) => ({ id: c.id, title: c.name }));
    return [...fromSession, ...extras];
  }, [session]);

  return (
    <LaunchGrid
      items={items}
      icon="graduationCap"
      emptyNoun="schools"
      totalCountOverride={schoolLaunchTotalCount}
      onSelect={(id) => navigate(`/school/${id}`)}
    />
  );
}
