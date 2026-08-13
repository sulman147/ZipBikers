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

export function Sidebar({ user, open, onClose }: { user: User; open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearSession();
    router.replace('/login');
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 animate-fade-in lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 -translate-x-full flex-col border-r border-line bg-cream transition-transform duration-200 ease-out',
          'lg:static lg:translate-x-0',
          open && 'translate-x-0',
        )}
      >
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
          <button
            onClick={onClose}
            className="ml-auto rounded-full p-1.5 text-muted hover:bg-neutral-50 hover:text-ink lg:hidden"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
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
    </>
  );
}
