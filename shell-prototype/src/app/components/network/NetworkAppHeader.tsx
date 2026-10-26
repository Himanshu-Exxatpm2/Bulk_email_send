/**
 * Shared chrome for Network Layer screens — Figma 370:1053.
 */

import { useNavigate } from 'react-router';
import askLeoImg from '../../../assets/chrome/ask-leo.png';
import exxatOneLogo from '../../../assets/login/ExxatOneLogo.svg';
import { FontAwesomeIcon } from '../font-awesome-icon';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '../ui/dropdown-menu';
import { useSession } from '../../data/SessionContext';
import type { SessionRole, SiteCountMode } from '../../data/session';

interface NetworkAppHeaderProps {
  consortiumName: string;
}

export function NetworkAppHeader({ consortiumName }: NetworkAppHeaderProps) {
  const { session, setRole, setSiteCountMode, logout } = useSession();
  const navigate = useNavigate();

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b-2 border-[#e5e7eb] bg-white px-2">
      <div className="flex items-center gap-2">
        <img
          src={exxatOneLogo}
          alt="Exxat One"
          className="h-[22px] w-[90px] object-contain object-left"
        />
        <div className="border-l border-[#d1d5dc] pl-3">
          <p className="text-sm font-medium text-[#364153] whitespace-nowrap">
            {consortiumName}
          </p>
        </div>
      </div>

      <div className="flex items-center">
        <div className="border-r border-[#e5e7eb] pr-2">
          <button
            type="button"
            onClick={() => navigate('/sites')}
            className="flex h-8 items-center gap-2 rounded-md px-3 text-sm font-semibold text-[#3f51b5] hover:bg-blue-50"
          >
            <FontAwesomeIcon name="tableCells" className="h-3.5 w-3.5 text-purple-500" />
            Launch Page
          </button>
        </div>

        <div className="flex items-center pl-2">
          <IconBtn label="Resource center">
            <FontAwesomeIcon name="circleQuestion" className="h-5 w-5 text-neutral-600" />
          </IconBtn>
          <IconBtn label="Feedback">
            <FontAwesomeIcon name="comments" className="h-[17px] w-5 text-neutral-600" />
          </IconBtn>
          <IconBtn label="Release notes">
            <FontAwesomeIcon name="bullhorn" className="h-[17px] w-5 text-neutral-600" />
          </IconBtn>
          <IconBtn label="Notifications">
            <FontAwesomeIcon name="bell" className="h-5 w-5 text-neutral-600" />
          </IconBtn>
        </div>

        <div className="flex items-center border-x border-[#e5e7eb] px-2 ml-2">
          <button type="button" className="rounded-md" aria-label="Ask Leo">
            <img
              src={askLeoImg}
              alt="Ask Leo"
              className="h-[29px] w-auto max-w-[109px] object-contain"
            />
          </button>
        </div>

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
            <DropdownMenuLabel>{session.userDisplayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-2 text-xs font-normal text-neutral-600">
              Preview role
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={session.role}
              onValueChange={(v) => setRole(v as SessionRole)}
            >
              <DropdownMenuRadioItem value="network-and-site">Network + Site</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="site-only">Site only</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="network-only">Network only</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="px-2 text-xs font-normal text-neutral-600">
              Site count
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={session.siteCountMode}
              onValueChange={(v) => setSiteCountMode(v as SiteCountMode)}
            >
              <DropdownMenuRadioItem value="multiple">Multiple sites</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="single">Single site</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-negative-default"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function IconBtn({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-8 min-w-8 items-center justify-center rounded-md px-2 hover:bg-neutral-100"
    >
      {children}
    </button>
  );
}
