import { FontAwesomeIcon } from './font-awesome-icon';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from './ui/dropdown-menu';
import { ExxatOneLogo } from './ExxatOneLogo';
import type { SessionRole, SiteCountMode } from '../data/session';

function VerticalSeparator() {
  return <div className="h-6 w-px bg-neutral-200 shrink-0" aria-hidden />;
}

export interface RubixHeaderProps {
  siteName?: string;
  userDisplayName?: string;
  userInitials?: string;
  notificationCount?: number;
  showAskLeo?: boolean;
  showAllSites?: boolean;
  onAllSitesClick?: () => void;
  onSignOut?: () => void;
  showEmptyStates?: boolean;
  onToggleEmptyStates?: (show: boolean) => void;
  emptyStateCase?: 'no-jobs' | 'has-jobs';
  onToggleEmptyStateCase?: (caseType: 'no-jobs' | 'has-jobs') => void;
  role?: SessionRole;
  onRoleChange?: (role: SessionRole) => void;
  siteCountMode?: SiteCountMode;
  onSiteCountModeChange?: (mode: SiteCountMode) => void;
}

/**
 * Site-admin header — matches Bedlam "Exxat one _ Header" screenshot.
 * Logo · site · help (pink circle) · chat · bullhorn · bell+badge · Ask Leo · name▾
 */
export function RubixHeader({
  siteName = 'Bedlam-Hospital',
  userDisplayName = 'Darp Dhameliya',
  notificationCount = 278,
  showAskLeo = true,
  showAllSites = false,
  onAllSitesClick,
  onSignOut,
  showEmptyStates,
  onToggleEmptyStates,
  emptyStateCase = 'has-jobs',
  onToggleEmptyStateCase,
  role,
  onRoleChange,
  siteCountMode,
  onSiteCountModeChange,
}: RubixHeaderProps) {
  return (
    <div className="bg-neutral-0 border-b border-neutral-200 shrink-0">
      <header className="h-12">
        <div className="flex items-center h-full px-4 gap-3">
          <ExxatOneLogo variant="plain" />
          <VerticalSeparator />
          <p className="text-[13px] text-neutral-700 whitespace-nowrap font-medium">
            {siteName}
          </p>

          <div className="flex-1" />

          {showAllSites && (
            <>
              <button
                type="button"
                onClick={onAllSitesClick}
                className="flex items-center gap-2 h-8 px-2 rounded-md text-sm font-semibold text-blue-500 hover:bg-blue-50"
              >
                <FontAwesomeIcon name="tableCells" className="text-blue-500 text-base" />
                Launch Page
              </button>
              <VerticalSeparator />
            </>
          )}

          <div className="flex items-center gap-3">
            {/* Help — solid pink circle with white ? */}
            <button
              type="button"
              aria-label="Help"
              className="h-6 w-6 rounded-full bg-brand-magenta text-neutral-0 flex items-center justify-center hover:opacity-90"
            >
              <span className="text-[13px] font-bold leading-none">?</span>
            </button>
            <button type="button" aria-label="Chat" className="text-neutral-700 hover:opacity-75">
              <FontAwesomeIcon name="comments" className="w-[18px] h-[18px]" />
            </button>
            <button type="button" aria-label="Announcements" className="text-neutral-700 hover:opacity-75">
              <FontAwesomeIcon name="bullhorn" className="w-[18px] h-[18px]" />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="relative text-neutral-700 hover:opacity-75"
            >
              <FontAwesomeIcon name="bell" className="w-[18px] h-[18px]" />
              {notificationCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-negative-default text-neutral-0 text-[10px] font-semibold flex items-center justify-center leading-none">
                  {notificationCount > 99 ? notificationCount : notificationCount}
                </span>
              )}
            </button>
          </div>

          {showAskLeo && (
            <>
              <VerticalSeparator />
              <button
                type="button"
                className="relative flex items-center gap-2 h-8 px-3 rounded-md bg-brand-magenta text-neutral-0 text-sm font-medium hover:opacity-90"
              >
                <FontAwesomeIcon name="sparkles" className="w-3.5 h-3.5" />
                Ask Leo
                <span className="absolute -top-1.5 -right-1 text-[8px] font-bold uppercase tracking-wide px-1 py-px rounded-sm bg-accent-500 text-neutral-900 leading-none">
                  BETA
                </span>
              </button>
            </>
          )}

          <VerticalSeparator />

          {/* Profile — name + chevron only (no avatar per header screenshot) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1.5 h-auto px-1.5 py-1 hover:bg-neutral-100 text-neutral-850"
              >
                <span className="text-sm font-medium">{userDisplayName}</span>
                <FontAwesomeIcon name="chevronDown" className="w-3 h-3 text-neutral-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FontAwesomeIcon name="user" className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FontAwesomeIcon name="settings" className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-neutral-700 font-normal">
                Developer Options
              </DropdownMenuLabel>
              {onToggleEmptyStates && (
                <DropdownMenuCheckboxItem
                  checked={showEmptyStates}
                  onCheckedChange={(checked) => onToggleEmptyStates(checked)}
                  className="cursor-pointer"
                >
                  Show Empty States
                </DropdownMenuCheckboxItem>
              )}
              {showEmptyStates && onToggleEmptyStateCase && (
                <>
                  <DropdownMenuItem
                    onClick={() => onToggleEmptyStateCase('no-jobs')}
                    className={`cursor-pointer ${emptyStateCase === 'no-jobs' ? 'bg-blue-50 text-blue-500' : ''}`}
                  >
                    No Jobs Posted
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onToggleEmptyStateCase('has-jobs')}
                    className={`cursor-pointer ${emptyStateCase === 'has-jobs' ? 'bg-blue-50 text-blue-500' : ''}`}
                  >
                    Has Jobs, No Candidates
                  </DropdownMenuItem>
                </>
              )}
              {onRoleChange && role && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-neutral-600 font-normal px-2">
                    Preview role
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={role}
                    onValueChange={(v) => onRoleChange(v as SessionRole)}
                  >
                    <DropdownMenuRadioItem value="super-admin">Super admin (School + Site)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="site-only">Site only</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="school-only">School only</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </>
              )}
              {onSiteCountModeChange && siteCountMode && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-neutral-600 font-normal px-2">
                    Site count
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={siteCountMode}
                    onValueChange={(v) => onSiteCountModeChange(v as SiteCountMode)}
                  >
                    <DropdownMenuRadioItem value="multiple">Multiple sites</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="single">Single site</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-negative-default cursor-pointer" onClick={onSignOut}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>
  );
}
