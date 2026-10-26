import { useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { SchoolHeader } from '../components/school/SchoolHeader';
import { SchoolSidebar } from '../components/school/SchoolSidebar';
import { useSession } from '../data/SessionContext';
import { findSchool, schoolLabel } from '../data/session';

/**
 * School-admin shell — SchoolHeader + SchoolSidebar; screens render via <Outlet/>.
 */
export function SchoolShell() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { session, logout } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { schoolId } = useParams<{ schoolId: string }>();

  const school = schoolId ? findSchool(session, schoolId) : undefined;
  const schoolName = school ? schoolLabel(school) : 'Abilene Christine University - DPT';

  const handleNavigate = (href: string) => {
    if (!schoolId) return;
    if (href === '/home' || href === '/') {
      navigate(`/school/${schoolId}`);
      return;
    }
    navigate(`/school/${schoolId}${href}`);
  };

  const pathForNav = location.pathname.replace(`/school/${schoolId}`, '') || '/home';
  const currentPath =
    pathForNav === '' || pathForNav === '/'
      ? '/home'
      : pathForNav.startsWith('/')
        ? pathForNav
        : `/${pathForNav}`;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-neutral-50">
      <SchoolHeader
        schoolName={schoolName}
        userDisplayName={session.userDisplayName}
        notificationCount={session.notificationCount}
        onSwitchProduct={() => navigate('/choose-products')}
        onSignOut={() => {
          logout();
          navigate('/login');
        }}
      />
      <div className="flex flex-1 overflow-hidden">
        <SchoolSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onNavigate={handleNavigate}
          currentPath={currentPath}
        />
        <main className="flex-1 overflow-y-auto bg-[#f6f5fb]">
          <Outlet context={{ schoolName }} />
        </main>
      </div>
    </div>
  );
}
