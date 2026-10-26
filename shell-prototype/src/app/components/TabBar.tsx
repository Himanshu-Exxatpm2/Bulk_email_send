interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs?: string[];
  isNavigation?: boolean;
}

/** Shell underline tabs (same look as the Availability screen tabs). */
export function TabBar({
  activeTab,
  onTabChange,
  tabs = ['Setup', 'Standards', 'Communication', 'User Roles', 'Learning', 'Calendar'],
}: TabBarProps) {
  return (
    <div className="flex gap-6" role="tablist" data-name="TabBar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab)}
            className={`pb-3 -mb-px text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              isActive
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-neutral-700 hover:text-neutral-900'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
