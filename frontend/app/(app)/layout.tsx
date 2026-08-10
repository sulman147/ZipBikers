'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { useAuthGuard } from '@/lib/useAuth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuthGuard();
  const pathname = usePathname();

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-2">
        <p className="animate-pulse text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-cream-2">
      <Sidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <div key={pathname} className="mx-auto max-w-7xl animate-fade-in-up px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
