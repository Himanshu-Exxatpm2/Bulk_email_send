import { FontAwesomeIcon } from '../font-awesome-icon';
import { schoolNavGroups, type SchoolNavGroup, type SchoolNavItem } from '../../config/schoolNav';

interface SchoolSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigate?: (href: string) => void;
  currentPath?: string;
  navGroups?: SchoolNavGroup[];
}

/**
 * School-admin collapsible LHN — mirrors the site sidebar chrome (Figma 413:7475).
 */
export function SchoolSidebar({
  isCollapsed,
  onToggle,
  onNavigate,
  currentPath,
  navGroups = schoolNavGroups,
}: SchoolSidebarProps) {
  const isItemActive = (item: SchoolNavItem) =>
    currentPath === item.href ||
    (item.href === '/home' && (currentPath === '/' || currentPath === '/home')) ||
    (item.href !== '/home' && !!currentPath?.startsWith(item.href));

  const renderNavItem = (item: SchoolNavItem) => {
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
        className={`flex items-center transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset ${
          isCollapsed
            ? `w-full h-11 justify-center ${active ? 'bg-blue-500 text-neutral-0' : 'text-neutral-800 hover:bg-neutral-100'}`
            : `w-full gap-3 px-4 py-2.5 min-h-11 rounded-md ${active ? 'bg-blue-500 text-neutral-0' : 'text-neutral-800 hover:bg-neutral-100'}`
        }`}
      >
        <FontAwesomeIcon
          name={item.icon}
          className={`shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'}`}
        />
        {!isCollapsed && <span className="font-medium text-sm flex-1 text-left">{item.label}</span>}
        {!isCollapsed && item.badge && (
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              active ? 'bg-neutral-0/20 text-neutral-0' : 'bg-blue-50 text-blue-700'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  const renderGroup = (group: SchoolNavGroup, index: number) => (
    <div key={group.id}>
      {index > 0 && (
        <div className={`border-t border-neutral-200 ${isCollapsed ? 'mx-2 my-2' : 'mx-3 my-3'}`} />
      )}
      {group.label && !isCollapsed && (
        <h3 className="px-4 pt-1 pb-2 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
          {group.label}
        </h3>
      )}
      <div className={isCollapsed ? 'space-y-0.5' : 'space-y-0.5 px-2'}>
        {group.items.map((item) => renderNavItem(item))}
      </div>
    </div>
  );

  return (
    <aside
      className={`relative transition-[width] duration-300 ease-in-out shrink-0 ${
        isCollapsed ? 'w-[56px]' : 'w-[260px]'
      } h-full bg-neutral-0 border-r border-neutral-200 flex flex-col`}
    >
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

      <nav className="flex-1 overflow-y-auto py-2">
        {navGroups.map((group, i) => renderGroup(group, i))}
      </nav>
    </aside>
  );
}
