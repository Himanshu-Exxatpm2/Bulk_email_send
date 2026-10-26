import { ReactNode } from 'react';
import { FontAwesomeIcon, FontAwesomeIconName } from './font-awesome-icon';
import { Button } from './ui/button';
import { TabBar } from './TabBar';

interface PageHeaderAction {
  label: string;
  onClick: () => void;
  icon?: FontAwesomeIconName;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  mobileLabel?: string;
}

interface PageHeaderProps {
  icon: FontAwesomeIconName;
  title: string;
  description?: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  actions?: PageHeaderAction[];
  children?: ReactNode;
}

/**
 * Shell page header: icon tile, title, subtitle, actions, optional underline tabs.
 * Same pattern as the Availability screen in this shell.
 */
export function PageHeader({
  icon,
  title,
  description,
  tabs,
  activeTab,
  onTabChange,
  actions = [],
  children,
}: PageHeaderProps) {
  return (
    <header className="bg-card border-b border-neutral-200 w-full">
      <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="size-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <FontAwesomeIcon name={icon} className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-neutral-900 leading-7 truncate">{title}</h1>
            {description && <p className="text-sm text-neutral-700 leading-5">{description}</p>}
          </div>
        </div>
        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((a, i) => (
              <Button
                key={i}
                variant={a.variant === 'secondary' ? 'outline' : a.variant === 'ghost' ? 'ghost' : 'default'}
                onClick={a.onClick}
                className={a.className}
              >
                {a.icon && <FontAwesomeIcon name={a.icon} className="w-4 h-4" aria-hidden="true" />}
                {a.label}
              </Button>
            ))}
          </div>
        )}
      </div>
      {children && <div className="px-6 pb-4">{children}</div>}
      {tabs && activeTab && onTabChange && (
        <div className="px-6">
          <TabBar activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
        </div>
      )}
    </header>
  );
}
