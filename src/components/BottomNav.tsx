'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, Users, Sparkles, Settings } from 'lucide-react';

const TABS = [
  { href: '/', label: '홈', icon: Home, match: (p: string) => p === '/' },
  {
    href: '/records',
    label: '기록',
    icon: ListChecks,
    match: (p: string) => p.startsWith('/records'),
  },
  {
    href: '/people',
    label: '멤버',
    icon: Users,
    match: (p: string) => p.startsWith('/people'),
  },
  {
    href: '/treatments',
    label: '시술',
    icon: Sparkles,
    match: (p: string) => p.startsWith('/treatments'),
  },
  {
    href: '/settings',
    label: '설정',
    icon: Settings,
    match: (p: string) => p.startsWith('/settings'),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname === '/login') return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-medium ${
                active ? 'text-brand-deep' : 'text-black/40'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
