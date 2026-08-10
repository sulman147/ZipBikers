'use client';

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getToken, login, setSession } from '@/lib/api';
import logo from '@/app/logo.png';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@fleet.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace('/dashboard');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { accessToken, user } = await login(email, password);
      setSession(accessToken, user);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-2 px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="mb-8 text-center">
          <Image
            src={logo}
            alt="ZipBikers"
            width={96}
            height={96}
            className="mx-auto mb-3 h-24 w-24 rounded-full object-cover shadow-sm transition-transform duration-200 hover:scale-105"
            priority
          />
          <p className="text-sm font-semibold tracking-wide text-brand-600">Ride. Earn. Repeat.</p>
          <p className="mt-1 text-sm font-medium text-muted">Sign in to the ZipBikers fleet console</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <div className="mb-4">
            <label className="mb-1 block text-xs font-semibold text-ink/80">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fleet.com"
              className="block w-full rounded-lg border-0 px-3 py-2 text-sm text-ink ring-1 ring-inset ring-line transition-shadow duration-150 placeholder:text-muted focus:ring-2 focus:ring-inset focus:ring-brand-600"
            />
          </div>
          <div className="mb-2">
            <label className="mb-1 block text-xs font-semibold text-ink/80">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
              className="block w-full rounded-lg border-0 px-3 py-2 text-sm text-ink ring-1 ring-inset ring-line transition-shadow duration-150 placeholder:text-muted focus:ring-2 focus:ring-inset focus:ring-brand-600"
            />
          </div>
          <p className="mb-4 text-[11px] text-muted">
            Seed credentials: admin@fleet.com / staff@fleet.com / accounts@fleet.com — password for all: password123
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-600 ring-1 ring-inset ring-brand-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-full bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 ease-out hover:bg-brand-700 active:scale-[0.98] disabled:bg-brand-300 disabled:active:scale-100"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
