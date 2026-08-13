'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Sidebar } from '@/components/Sidebar';
import { useAuthGuard } from '@/lib/useAuth';
import logo from '@/app/logo.png';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuthGuard();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-2">
        <p className="animate-pulse text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-cream-2">
      <Sidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-b border-line bg-cream px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-full p-1.5 text-ink/70 hover:bg-neutral-50 hover:text-ink"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6">
              <path
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5A.75.75 0 012.75 9h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 9.75zM2.75 14a.75.75 0 000 1.5h14.5a.75.75 0 000-1.5H2.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <Image src={logo} alt="ZipBikers" width={28} height={28} className="h-7 w-7 shrink-0 rounded-full object-cover" priority />
          <p className="font-serif text-sm font-bold text-ink">ZipBikers</p>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div key={pathname} className="mx-auto max-w-7xl animate-fade-in-up px-4 py-4 sm:px-6 sm:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
