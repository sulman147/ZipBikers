'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearSession } from '@/lib/api';
import { cx } from '@/lib/utils';
import type { User } from '@/lib/types';
import logo from '@/app/logo.png';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/bikes', label: 'Bikes' },
  { href: '/riders', label: 'Riders' },
  { href: '/assignments', label: 'Assignments' },
  { href: '/payments', label: 'Payments' },
  { href: '/maintenance', label: 'Maintenance' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/violations', label: 'Traffic Violations' },
  { href: '/inspections', label: 'Inspections' },
  { href: '/notifications', label: 'Notifications' },
  { href: '/reports', label: 'Reports' },
];

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearSession();
    router.replace('/login');
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line bg-cream">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
        <Image
          src={logo}
          alt="ZipBikers"
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-full object-cover shadow-sm transition-transform duration-200 hover:scale-105"
          priority
        />
        <div>
          <p className="font-serif text-base font-bold leading-tight text-ink">ZipBikers</p>
          <p className="text-[11px] font-medium leading-tight text-muted">Fleet Console</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cx(
                    'block rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-150 ease-out',
                    active
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-ink/70 hover:translate-x-0.5 hover:bg-neutral-50',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line px-4 py-4">
        <div className="mb-3">
          <p className="text-sm font-semibold text-ink">{user.name}</p>
          <p className="text-xs text-muted">{user.email}</p>
          <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-600">
            {user.role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink/70 transition-colors duration-150 hover:bg-neutral-50"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
