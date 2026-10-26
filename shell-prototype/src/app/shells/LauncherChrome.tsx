/**
 * Launch Page chrome — logo left, profile right (Figma 263:3288 / 413:6334).
 */

import { ExxatOneLogo } from '../components/ExxatOneLogo';
import { FontAwesomeIcon } from '../components/font-awesome-icon';
import { useSession } from '../data/SessionContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import type { CountMode, ProductKind, SessionRole } from '../data/session';

export function LauncherChrome({
  children,
  product = 'site',
}: {
  children: React.ReactNode;
  product?: ProductKind;
}) {
  const { session, setRole, setSiteCountMode, setSchoolCountMode, logout } = useSession();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-white px-4">
        <ExxatOneLogo variant={product === 'school' ? 'schools' : 'sites'} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-10 gap-1 rounded-md px-3 text-sm font-normal text-[#111827]"
            >
              {session.userDisplayName}
              <FontAwesomeIcon name="chevronDown" className="h-3.5 w-3.5 text-neutral-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-neutral-700">
              Developer Options
            </DropdownMenuLabel>
            <DropdownMenuLabel className="px-2 text-xs font-normal text-neutral-600">
              Role
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={session.role}
              onValueChange={(v) => setRole(v as SessionRole)}
            >
              <DropdownMenuRadioItem value="super-admin" className="cursor-pointer">
                Super admin (School + Site)
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="site-only" className="cursor-pointer">
                Site only
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="school-only" className="cursor-pointer">
                School only
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-2 text-xs font-normal text-neutral-600">
              Site count
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={session.siteCountMode}
              onValueChange={(v) => setSiteCountMode(v as CountMode)}
            >
              <DropdownMenuRadioItem value="multiple" className="cursor-pointer">
                Multiple sites
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="single" className="cursor-pointer">
                Single site
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-2 text-xs font-normal text-neutral-600">
              School count
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={session.schoolCountMode}
              onValueChange={(v) => setSchoolCountMode(v as CountMode)}
            >
              <DropdownMenuRadioItem value="multiple" className="cursor-pointer">
                Multiple schools
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="single" className="cursor-pointer">
                Single school
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-negative-default" onClick={logout}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="relative flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
