import { cx } from '@/lib/utils';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cx('rounded-2xl border border-line bg-white shadow-sm transition-shadow duration-200 hover:shadow-md', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-5 py-4">
      <div>
        <h2 className="font-serif text-sm font-bold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: 'default' | 'warn' | 'danger' | 'good';
}) {
  const toneClasses: Record<string, string> = {
    default: 'text-ink',
    warn: 'text-warn-600',
    danger: 'text-brand-600',
    good: 'text-good-600',
  };
  return (
    <Card className="px-5 py-4 transition-transform duration-200 hover:-translate-y-0.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={cx('mt-1.5 font-serif text-2xl font-bold', toneClasses[tone])}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  );
}
