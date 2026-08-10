'use client';

import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '@/lib/api';
import type { Notification } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime, formatDate, titleCase, cx } from '@/lib/utils';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getNotifications()
      .then((n) => setNotifications(n.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load notifications'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function markRead(n: Notification) {
    setMarkingId(n.id);
    try {
      await markNotificationRead(n.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    } finally {
      setMarkingId(null);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader title="Notifications" subtitle={`${unreadCount} unread of ${notifications.length} total`} />

      {error && (
        <div className="mb-4 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700 ring-1 ring-inset ring-brand-200">
          {error}
        </div>
      )}

      <Card>
        <ul className="divide-y divide-line">
          {loading && <li className="px-5 py-8 text-center text-sm text-muted">Loading…</li>}
          {!loading && notifications.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-muted">No notifications.</li>
          )}
          {!loading &&
            notifications.map((n) => (
              <li key={n.id} className={cx('flex items-start justify-between gap-4 px-5 py-4', !n.read && 'bg-cream-2/70')}>
                <div className="flex items-start gap-3">
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                  {n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-transparent" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone="gray">{titleCase(n.type)}</Badge>
                      {n.dueDate && <span className="text-xs text-muted">Due {formatDate(n.dueDate)}</span>}
                    </div>
                    <p className={cx('mt-1 text-sm', n.read ? 'text-muted' : 'font-medium text-ink')}>{n.message}</p>
                    <p className="mt-0.5 text-xs text-muted">{formatDateTime(n.createdAt)}</p>
                  </div>
                </div>
                {!n.read && (
                  <Button size="sm" variant="secondary" disabled={markingId === n.id} onClick={() => markRead(n)}>
                    {markingId === n.id ? 'Marking…' : 'Mark as read'}
                  </Button>
                )}
              </li>
            ))}
        </ul>
      </Card>
    </div>
  );
}
