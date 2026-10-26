import { FontAwesomeIcon, type FontAwesomeIconName } from './font-awesome-icon';
import { siteNavGroups, type SiteNavGroup, type SiteNavItem } from '../config/siteNav';

interface RubixSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigate?: (href: string) => void;
  currentPath?: string;
  navGroups?: SiteNavGroup[];
  siteName?: string;
}

/**
 * Site-admin collapsible sidebar — matches Left Nav closed / expanded screenshots.
 * Collapsed: hamburger rail + icons. Expanded: "Menu" + X, section labels, NEW badge.
 * Site Configuration pinned to bottom.
 */
export function RubixSidebar({
  isCollapsed,
  onToggle,
  onNavigate,
  currentPath,
  navGroups = siteNavGroups,
}: RubixSidebarProps) {
  const mainGroups = navGroups.filter((g) => g.id !== 'config');
  const footerGroup = navGroups.find((g) => g.id === 'config');

  const isItemActive = (item: SiteNavItem) =>
    currentPath === item.href ||
    (item.href === '/home' && (currentPath === '/' || currentPath === '/home')) ||
    (item.href !== '/home' && !!currentPath?.startsWith(item.href));

  const renderNavItem = (item: SiteNavItem) => {
    const active = isItemActive(item);

    return (
      <button
        key={item.id}
        type="button"
        title={isCollapsed ? item.label : undefined}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        onClick={(e) => {
          e.preventDefault();
          if (item.href && onNavigate) onNavigate(item.href);
        }}
        className={`
          flex items-center transition-colors duration-150
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset
          ${
            isCollapsed
              ? `w-full h-11 justify-center ${
                  active
                    ? 'bg-blue-500 text-neutral-0'
                    : 'text-neutral-800 hover:bg-neutral-100'
                }`
              : `w-full gap-3 px-4 py-2.5 min-h-11 ${
                  active
                    ? 'bg-blue-500 text-neutral-0'
                    : 'text-neutral-800 hover:bg-neutral-100'
                }`
          }
        `}
      >
        <FontAwesomeIcon
          name={item.icon as FontAwesomeIconName}
          className={`shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'}`}
        />
        {!isCollapsed && (
          <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
        )}
        {!isCollapsed && item.badge && (
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              active
                ? 'bg-neutral-0/20 text-neutral-0'
                : 'bg-blue-50 text-blue-700'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  const renderGroup = (group: SiteNavGroup, index: number) => (
    <div key={group.id}>
      {(index > 0 || isCollapsed) && index > 0 && (
        <div className={`border-t border-neutral-200 ${isCollapsed ? 'mx-2 my-2' : 'mx-3 my-3'}`} />
      )}
      {group.label && !isCollapsed && (
        <h3 className="px-4 pt-1 pb-2 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
          {group.label}
        </h3>
      )}
      <div className={isCollapsed ? 'space-y-0.5' : 'space-y-0.5'}>
        {group.items.map((item) => renderNavItem(item))}
      </div>
    </div>
  );

  return (
    <aside
      className={`
        relative transition-[width] duration-300 ease-in-out shrink-0
        ${isCollapsed ? 'w-[56px]' : 'w-[260px]'}
        h-full bg-neutral-0 border-r border-neutral-200 flex flex-col
      `}
    >
      {/* Toggle header */}
      <div
        className={`shrink-0 border-b border-neutral-200 ${
          isCollapsed ? 'px-2 py-3 flex justify-center' : 'px-4 py-3'
        }`}
      >
        {isCollapsed ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Expand sidebar"
            aria-expanded={false}
            className="h-9 w-9 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-100"
          >
            <FontAwesomeIcon name="menu" className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="text-lg font-bold text-blue-700 leading-none">Menu</p>
            <button
              type="button"
              onClick={onToggle}
              aria-label="Collapse sidebar"
              aria-expanded={true}
              className="h-8 w-8 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-100"
            >
              <FontAwesomeIcon name="x" className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Nav body */}
      <nav className="flex-1 overflow-y-auto py-2 flex flex-col">
        <div className="flex-1">
          {mainGroups.map((group, i) => renderGroup(group, i))}
        </div>

        {/* Site Configuration pinned to bottom */}
        {footerGroup && (
          <div className="mt-auto pt-2">
            <div className={`border-t border-neutral-200 ${isCollapsed ? 'mx-2 mb-2' : 'mx-3 mb-2'}`} />
            {footerGroup.items.map((item) => renderNavItem(item))}
          </div>
        )}
      </nav>
    </aside>
  );
}
