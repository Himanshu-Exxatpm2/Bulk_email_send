import { useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { RubixHeader } from '../components/RubixHeader';
import { RubixSidebar } from '../components/RubixSidebar';
import { useSession } from '../data/SessionContext';
import { findSite } from '../data/session';
import { siteNavGroups } from '../config/siteNav';

/**
 * Site-admin shell — RubixHeader + RubixSidebar; screens render via <Outlet/>.
 * Never import Network chrome here.
 */
export function SiteShell() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [showEmptyStates, setShowEmptyStates] = useState(false);
  const [emptyStateCase, setEmptyStateCase] = useState<'no-jobs' | 'has-jobs'>('has-jobs');
  const { session, setRole, setSiteCountMode, logout } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { siteId } = useParams<{ siteId: string }>();

  const site = siteId ? findSite(session, siteId) : undefined;
  const siteName = site?.name ?? 'Bedlam-Hospital';

  const handleNavigate = (href: string) => {
    if (!siteId) return;
    // Map config hrefs into site-scoped routes
    if (href === '/home' || href === '/') {
      navigate(`/site/${siteId}`);
      return;
    }
    if (href.startsWith('/jobs')) {
      navigate(`/site/${siteId}/jobs`);
      return;
    }
    navigate(`/site/${siteId}${href}`);
  };

  // Normalize path for sidebar active state (strip /site/:id prefix)
  const pathForNav = location.pathname.replace(`/site/${siteId}`, '') || '/home';
  const currentPath =
    pathForNav === '' || pathForNav === '/' ? '/home' : pathForNav.startsWith('/') ? pathForNav : `/${pathForNav}`;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-neutral-50">
      <RubixHeader
        siteName={siteName}
        userDisplayName={session.userDisplayName}
        userInitials={session.userInitials}
        notificationCount={session.notificationCount}
        showAskLeo
        showAllSites={session.siteCountMode === 'multiple'}
        onAllSitesClick={() => navigate('/sites')}
        onSignOut={() => {
          logout();
          navigate('/login');
        }}
        showEmptyStates={showEmptyStates}
        onToggleEmptyStates={setShowEmptyStates}
        emptyStateCase={emptyStateCase}
        onToggleEmptyStateCase={setEmptyStateCase}
        role={session.role}
        onRoleChange={setRole}
        siteCountMode={session.siteCountMode}
        onSiteCountModeChange={setSiteCountMode}
      />
      <div className="flex flex-1 overflow-hidden">
        <RubixSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onNavigate={handleNavigate}
          currentPath={currentPath}
          navGroups={siteNavGroups}
          siteName={siteName}
        />
        <main className="flex-1 overflow-y-auto bg-neutral-50">
          <Outlet context={{ showEmptyStates, emptyStateCase, siteName }} />
        </main>
      </div>
    </div>
  );
}
