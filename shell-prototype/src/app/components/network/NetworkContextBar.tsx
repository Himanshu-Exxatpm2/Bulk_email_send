/**
 * Centered top-tab ContextBar — Figma 370:1131 (Menu Full).
 */

import { Link } from 'react-router';
import { networkTopNav } from '../../config/networkNav';

interface NetworkContextBarProps {
  basePath: string;
  activeId: string;
}

export function NetworkContextBar({ basePath, activeId }: NetworkContextBarProps) {
  return (
    <div className="flex items-center justify-center bg-neutral-50 px-4 py-3">
      <nav className="inline-flex items-center rounded bg-white p-px shadow-sm">
        {networkTopNav.map((item) => {
          const active = item.id === activeId;
          const to = item.href ? `${basePath}/${item.href}` : basePath;
          return (
            <Link
              key={item.id}
              to={to}
              className={`rounded px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
                active
                  ? 'bg-[#3f51b5] font-semibold text-white'
                  : 'font-normal text-black/87 hover:bg-neutral-50'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
