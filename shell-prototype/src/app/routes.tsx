import {
  createBrowserRouter,
  type RouteObject,
  createMemoryRouter,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router';
import { useEffect } from 'react';
import { SessionProvider, useSession } from './data/SessionContext';
import { SiteShell } from './shells/SiteShell';
import { SchoolShell } from './shells/SchoolShell';
import { LauncherChrome } from './shells/LauncherChrome';
import { LoginPage } from './screens/auth/LoginPage';
import { ChooseProductsPage } from './screens/launcher/ChooseProductsPage';
import { AllSitesLaunchPage } from './screens/sites/AllSitesLaunchPage';
import { AllSchoolsLaunchPage } from './screens/schools/AllSchoolsLaunchPage';
import { SiteDashboard } from './screens/site/SiteDashboard';
import { SchoolDashboard } from './screens/school/SchoolDashboard';
import { PlaceholderPage } from './screens/PlaceholderPage';
import { JobsPage } from './components/JobsPage';
import { AvailabilityListPage } from './components/availability/AvailabilityListPage';
import { SchedulesModule, SchedulesPlaceholder } from './components/schedules-module/SchedulesModule';
import { SchedulesOverview } from './components/schedules-module/SchedulesOverview';
import { SchedulesListPage } from './components/schedules-module/SchedulesListPage';
import { PersonnelPage } from './components/personnel/PersonnelPage';
import { SchoolPartnersPage } from './components/school-partners/SchoolPartnersPage';
import { SchoolPartnerDetailPage } from './components/school-partners/SchoolPartnerDetailPage';
import { LocationsListPage } from './components/locations/LocationsListPage';
import { LocationDetailPage } from './components/locations/LocationDetailPage';
import { ConfigLayout } from './components/notifications/ConfigLayout';
import { SiteEmailSetup, SchoolEmailSetup, SiteAttachmentTemplates } from './components/notifications/EmbeddedPages';
import { EmailTemplatesPage } from './components/notifications/EmailTemplatesPage';
import { TemplateEditorPage } from './components/notifications/TemplateEditorPage';
import { NotificationConfigurationPage } from './components/notifications/NotificationConfigurationPage';
import { MyNotificationsPage } from './components/notifications/MyNotificationsPage';
import { SchoolSchedulesPage } from './components/school/SchoolSchedulesPage';
import { SchoolRequestsPage } from './components/school/SchoolRequestsPage';
import type { ProductKind } from './data/session';

// NOTE: The "Network Layer" (consortium) surfaces were a parallel project and are
// intentionally not routed in this shell. NetworkShell / NetworkDashboard / MembersPage
// and LaunchSelectPage remain in the codebase for future iterations.

/** Redirect unauthenticated users to /login */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session.isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [session.isAuthenticated, navigate]);

  if (!session.isAuthenticated) return null;
  return <>{children}</>;
}

function RootLayout() {
  return (
    <SessionProvider>
      <Outlet />
    </SessionProvider>
  );
}

function LauncherLayout({ product }: { product: ProductKind }) {
  return (
    <RequireAuth>
      <LauncherChrome product={product}>
        <Outlet />
      </LauncherChrome>
    </RequireAuth>
  );
}

function SiteLayout() {
  return (
    <RequireAuth>
      <SiteShell />
    </RequireAuth>
  );
}

function SchoolLayout() {
  return (
    <RequireAuth>
      <SchoolShell />
    </RequireAuth>
  );
}

/**
 * React Router v7 route tree — one line per screen under shell layouts.
 */
const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <LoginPage /> },

      {
        path: 'choose-products',
        element: (
          <RequireAuth>
            <ChooseProductsPage />
          </RequireAuth>
        ),
      },

      {
        path: 'sites',
        element: <LauncherLayout product="site" />,
        children: [{ index: true, element: <AllSitesLaunchPage /> }],
      },

      {
        path: 'schools',
        element: <LauncherLayout product="school" />,
        children: [{ index: true, element: <AllSchoolsLaunchPage /> }],
      },

      {
        path: 'site/:siteId',
        element: <SiteLayout />,
        children: [
          { index: true, element: <SiteDashboard /> },
          { path: 'jobs/*', element: <JobsPageAdapter /> },
          { path: 'locations', element: <SiteNavAdapter render={(nav) => <LocationsListPage onNavigate={nav} />} /> },
          { path: 'locations/:locationId', element: <LocationDetailAdapter /> },
          { path: 'personnel', element: <PersonnelPage /> },
          { path: 'partners', element: <SiteNavAdapter render={(nav) => <SchoolPartnersPage onNavigate={nav} />} /> },
          { path: 'partners/:partnerId', element: <PartnerDetailAdapter /> },
          { path: 'availability/*', element: <AvailabilityPageAdapter /> },
          { path: 'slot-requests', element: <PlaceholderPage title="Slot Requests" /> },
          {
            path: 'schedules',
            element: <SchedulesModule />,
            children: [
              { index: true, element: <Navigate to="overview" replace /> },
              { path: 'overview', element: <SchedulesOverview /> },
              { path: 'list', element: <Navigate to="all" replace /> },
              { path: 'list/:kind', element: <SchedulesListPage /> },
              { path: 'calendar', element: <SchedulesPlaceholder title="Calendar" /> },
              { path: 'report', element: <SchedulesPlaceholder title="Report" /> },
            ],
          },
          { path: 'reports', element: <PlaceholderPage title="Reports" /> },
          {
            path: 'site-configuration',
            element: <ConfigLayout portal="site" />,
            children: [
              { index: true, element: <Navigate to="notification/email-setup" replace /> },
              { path: 'email', element: <Navigate to="../notification/email-setup" replace /> },
              { path: 'notification/email-setup', element: <SiteEmailSetup /> },
              { path: 'notification/email-templates', element: <EmailTemplatesPage portal="site" /> },
              { path: 'notification/email-templates/:templateId', element: <TemplateEditorPage portal="site" /> },
              { path: 'notification/attachment-templates', element: <SiteAttachmentTemplates /> },
              { path: 'notification/notification-configuration', element: <NotificationConfigurationPage portal="site" /> },
              { path: 'notification/my-notifications', element: <MyNotificationsPage portal="site" /> },
            ],
          },
        ],
      },

      {
        path: 'school/:schoolId',
        element: <SchoolLayout />,
        children: [
          { index: true, element: <SchoolDashboard /> },
          { path: 'explore', element: <PlaceholderPage title="Explore & apply for Availability" /> },
          { path: 'dashboard', element: <PlaceholderPage title="Dashboard" /> },
          { path: 'requests', element: <SchoolRequestsPage /> },
          { path: 'schedules', element: <SchoolSchedulesPage /> },
          { path: 'reports', element: <PlaceholderPage title="Reports" /> },
          {
            path: 'school-configuration',
            element: <ConfigLayout portal="school" />,
            children: [
              { index: true, element: <Navigate to="notification/email-setup" replace /> },
              { path: 'notification/email-setup', element: <SchoolEmailSetup /> },
              { path: 'notification/email-templates', element: <EmailTemplatesPage portal="school" /> },
              { path: 'notification/email-templates/:templateId', element: <TemplateEditorPage portal="school" /> },
              { path: 'notification/notification-configuration', element: <NotificationConfigurationPage portal="school" /> },
              { path: 'notification/my-notifications', element: <MyNotificationsPage portal="school" /> },
            ],
          },
        ],
      },

      { path: '*', element: <Navigate to="/login" replace /> },
    ],
  },
];

// The single-file build is opened from disk or inside a sandboxed viewer frame (address about:srcdoc),
// where the browser address cannot be used, so it keeps its location in memory instead.
export const router = import.meta.env.VITE_SINGLE_FILE ? createMemoryRouter(routes) : createBrowserRouter(routes);

/** Adapt the Availability list (path/nav props) into the site shell outlet */
function AvailabilityPageAdapter() {
  const navigate = useNavigate();
  const { siteId } = useParams<{ siteId: string }>();
  const location = useLocation();
  const currentPath = location.pathname.replace(`/site/${siteId}`, '') || '/availability';
  return (
    <AvailabilityListPage
      currentPath={currentPath}
      onNavigate={(href) => navigate(`/site/${siteId}${href}`)}
    />
  );
}

/** Adapt existing JobsPage (path/nav props) into the site shell outlet */
function JobsPageAdapter() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { siteId } = useParams<{ siteId: string }>();
  const base = `/site/${siteId}`;
  return (
    <JobsPage
      currentPath={pathname.startsWith(base) ? pathname.slice(base.length) : '/jobs'}
      onNavigate={(href) => navigate(href.startsWith('/jobs') ? `${base}${href}` : href)}
    />
  );
}


/** Gives a page the old path-based onNavigate, scoped to the current site */
function SiteNavAdapter({ render }: { render: (nav: (href: string) => void) => React.ReactNode }) {
  const navigate = useNavigate();
  const { siteId } = useParams<{ siteId: string }>();
  return <>{render((href) => navigate(`/site/${siteId}${href}`))}</>;
}

function PartnerDetailAdapter() {
  const { partnerId } = useParams<{ partnerId: string }>();
  return (
    <SiteNavAdapter
      render={(nav) => <SchoolPartnerDetailPage partnerId={partnerId ?? ''} onNavigate={nav} />}
    />
  );
}

function LocationDetailAdapter() {
  const { locationId } = useParams<{ locationId: string }>();
  return (
    <SiteNavAdapter
      render={(nav) => <LocationDetailPage locationId={locationId ?? ''} onNavigate={nav} />}
    />
  );
}
