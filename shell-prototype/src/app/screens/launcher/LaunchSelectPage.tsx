import { useNavigate } from 'react-router';
import { FontAwesomeIcon } from '../../components/font-awesome-icon';
import { Button } from '../../components/ui/button';
import { launcherCopy, tenantGroups } from '../../config/tenants';
import { useSession } from '../../data/SessionContext';
import { canAccessNetworkLayer, canAccessSiteLayer, getPrimarySite, getVisibleSites } from '../../data/session';

/**
 * /launch — post-login role-aware launcher (Network + Site admin).
 */
export function LaunchSelectPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const showSite = canAccessSiteLayer(session);
  const showNetwork = canAccessNetworkLayer(session);

  const handleAsSite = () => {
    const sites = getVisibleSites(session);
    if (sites.length <= 1) {
      navigate(`/site/${getPrimarySite(session).id}`);
      return;
    }
    navigate('/sites');
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-lg font-semibold text-neutral-900 mb-8">
        {launcherCopy.heading}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
        {/* As Site card */}
        {showSite && (
          <div className="bg-card rounded-md shadow-md border border-neutral-200 p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <FontAwesomeIcon name="hospital" className="w-7 h-7 text-purple-500" />
            </div>
            <p className="text-base font-bold text-neutral-900 mb-6">{launcherCopy.asSiteLabel}</p>
            <Button
              onClick={handleAsSite}
              className="rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium text-sm px-5"
            >
              {launcherCopy.asSiteContinue} →
            </Button>
          </div>
        )}

        {/* Consortium tenants */}
        {showNetwork && (
          <div className="bg-card rounded-md shadow-md border border-neutral-200 p-5 space-y-6">
            {tenantGroups.map((group) => (
              <div key={group.id}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-neutral-900">{group.label}</h2>
                  {/* TODO(pm-feedback): "Edit Tennant" spelling matches screenshot */}
                  <button
                    type="button"
                    className="text-sm text-purple-500 font-medium inline-flex items-center gap-1.5 hover:underline"
                  >
                    <FontAwesomeIcon name="pencil" className="w-3.5 h-3.5" />
                    {launcherCopy.editTenant}
                  </button>
                </div>
                <ul className="space-y-2">
                  {group.tenants.map((tenant) => {
                    const rowBg =
                      tenant.tone === 'nursing' ? 'bg-blue-50' : 'bg-accent-50';
                    const metaColor =
                      tenant.tone === 'nursing' ? 'text-blue-700' : 'text-warning-default';
                    const iconBg =
                      tenant.tone === 'nursing' ? 'bg-blue-500' : 'bg-accent-200';
                    return (
                      <li key={tenant.id}>
                        <button
                          type="button"
                          onClick={() => navigate(`/network/${tenant.id}`)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-left ${rowBg} hover:opacity-90 transition-opacity`}
                        >
                          <div className={`w-9 h-9 rounded-md shrink-0 ${iconBg}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                              {tenant.name} — {tenant.scopeLabel}
                            </p>
                            <p className={`text-xs mt-0.5 truncate ${metaColor}`}>
                              {tenant.metaLine}
                            </p>
                          </div>
                          <FontAwesomeIcon
                            name="chevronRight"
                            className="w-4 h-4 text-neutral-600 shrink-0"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
