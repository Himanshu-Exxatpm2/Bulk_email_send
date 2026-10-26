import { FontAwesomeIcon } from '../font-awesome-icon';
import { ExxatOneLogo } from '../ExxatOneLogo';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

function VerticalSeparator() {
  return <div className="h-6 w-px bg-neutral-200 shrink-0" aria-hidden />;
}

export interface SchoolHeaderProps {
  schoolName: string;
  userDisplayName: string;
  notificationCount?: number;
  onSignOut?: () => void;
  onSwitchProduct?: () => void;
}

/**
 * School-admin header (Figma 413:7475) — logo · school · Dashboard · utilities · Ask Leo · user.
 */
export function SchoolHeader({
  schoolName,
  userDisplayName,
  notificationCount = 0,
  onSignOut,
  onSwitchProduct,
}: SchoolHeaderProps) {
  return (
    <div className="bg-neutral-0 border-b border-neutral-200 shrink-0">
      <header className="h-12">
        <div className="flex items-center h-full px-4 gap-3">
          <ExxatOneLogo variant="schools" />
          <VerticalSeparator />
          <p className="text-[13px] text-neutral-700 whitespace-nowrap font-medium">{schoolName}</p>

          <div className="flex-1" />

          <button
            type="button"
            className="flex items-center gap-2 h-8 px-2 rounded-md text-sm font-semibold text-blue-500 hover:bg-blue-50"
          >
            <FontAwesomeIcon name="tableCells" className="text-blue-500 text-base" />
            Dashboard
          </button>
          <VerticalSeparator />

          <div className="flex items-center gap-3">
            <button type="button" aria-label="Help" className="text-neutral-700 hover:opacity-75">
              <FontAwesomeIcon name="circleQuestion" className="w-[18px] h-[18px]" />
            </button>
            <button type="button" aria-label="Chat" className="text-neutral-700 hover:opacity-75">
              <FontAwesomeIcon name="comments" className="w-[18px] h-[18px]" />
            </button>
            <button
              type="button"
              aria-label="Announcements"
              className="text-neutral-700 hover:opacity-75"
            >
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
                  {notificationCount}
                </span>
              )}
            </button>
          </div>

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

          <VerticalSeparator />
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
              {onSwitchProduct && (
                <DropdownMenuItem className="cursor-pointer" onClick={onSwitchProduct}>
                  <FontAwesomeIcon name="tableCells" className="w-4 h-4 mr-2" />
                  Switch product
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-negative-default cursor-pointer"
                onClick={onSignOut}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>
  );
}
