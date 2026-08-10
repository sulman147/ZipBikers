'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { cx } from '@/lib/utils';
import { RevenueTab } from './_components/RevenueTab';
import { ProfitabilityTab } from './_components/ProfitabilityTab';
import { MaintenanceTab } from './_components/MaintenanceTab';
import { FinesTab } from './_components/FinesTab';
import { PaymentsInsuranceTab } from './_components/PaymentsInsuranceTab';
import { UtilisationTab } from './_components/UtilisationTab';
import { RoiTab } from './_components/RoiTab';
import { ExpensesTab } from './_components/ExpensesTab';

const TABS = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'profitability', label: 'Bike Profitability' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'fines', label: 'Traffic Fines' },
  { key: 'payments', label: 'Payments & Insurance' },
  { key: 'utilisation', label: 'Fleet Utilisation' },
  { key: 'roi', label: 'ROI' },
  { key: 'expenses', label: 'Expense Breakdown' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function ReportsPage() {
  const [tab, setTab] = useState<TabKey>('revenue');

  return (
    <div>
      <PageHeader title="Reports" subtitle="Financial and operational reporting across the fleet." />

      <div className="mb-6 flex flex-wrap gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cx(
              'rounded-t-md px-3.5 py-2 text-sm font-medium transition-colors',
              tab === t.key ? 'border-b-2 border-brand-600 text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'revenue' && <RevenueTab />}
      {tab === 'profitability' && <ProfitabilityTab />}
      {tab === 'maintenance' && <MaintenanceTab />}
      {tab === 'fines' && <FinesTab />}
      {tab === 'payments' && <PaymentsInsuranceTab />}
      {tab === 'utilisation' && <UtilisationTab />}
      {tab === 'roi' && <RoiTab />}
      {tab === 'expenses' && <ExpensesTab />}
    </div>
  );
}
