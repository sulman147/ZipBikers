import { cx } from '@/lib/utils';

type BadgeTone = 'green' | 'blue' | 'amber' | 'red' | 'gray' | 'purple';

const TONE_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-good-50 text-good-700 ring-good-600/20',
  blue: 'bg-neutral-50 text-ink/70 ring-line',
  amber: 'bg-warn-50 text-warn-700 ring-warn-600/20',
  red: 'bg-brand-50 text-brand-600 ring-brand-600/20',
  gray: 'bg-neutral-50 text-muted ring-line',
  purple: 'bg-warn-50 text-warn-700 ring-warn-600/20',
};

export function Badge({ tone = 'gray', children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONE: Record<string, BadgeTone> = {
  AVAILABLE: 'green',
  ASSIGNED: 'blue',
  MAINTENANCE: 'amber',
  RETIRED: 'gray',
  ACTIVE: 'green',
  INACTIVE: 'gray',
  COMPLETED: 'blue',
  TERMINATED: 'red',
  PAID: 'green',
  UNPAID: 'red',
  PARTIAL: 'amber',
  DISPUTED: 'purple',
  RIDER: 'blue',
  COMPANY: 'purple',
  SHARED: 'amber',
  BEFORE: 'blue',
  AFTER: 'purple',
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? 'gray'}>{status}</Badge>;
}
