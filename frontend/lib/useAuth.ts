'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, getToken } from './api';
import type { User } from './types';

/**
 * Client-side auth guard for pages under the authenticated app shell.
 * Redirects to /login when no token is present. Returns the current user
 * (or null while the redirect is in flight).
 */
export function useAuthGuard(): { user: User | null; ready: boolean } {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    const storedUser = getStoredUser();
    if (!token || !storedUser) {
      router.replace('/login');
      return;
    }
    setUser(storedUser);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, ready };
}
