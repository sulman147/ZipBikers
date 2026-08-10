'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getBikes, getDashboardKpis } from '@/lib/api';
import type { Bike, DashboardKpis } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/Card';
import { BikeLink } from '@/components/BikeLink';
import { formatMoney } from '@/lib/utils';
import { TableShell, th, td, EmptyRow } from '@/components/ui/Table';

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDashboardKpis(), getBikes()])
      .then(([k, b]) => {
        setKpis(k);
        setBikes(b);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'));
  }, []);

  const bikeMap = useMemo(() => new Map(bikes.map((b) => [b.id, b])), [bikes]);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Fleet-wide key performance indicators, updated live from operations data." />

      {error && (
        <div className="mb-4 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700 ring-1 ring-inset ring-brand-200">
          {error}
        </div>
      )}

      {!kpis && !error && <p className="text-sm text-muted">Loading dashboard…</p>}

      {kpis && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <KpiCard label="Total Bikes" value={kpis.totalBikes} />
            <KpiCard label="Available" value={kpis.available} tone="good" />
            <KpiCard label="Assigned" value={kpis.assigned} />
            <KpiCard label="Under Maintenance" value={kpis.underMaintenance} tone="warn" />
            <KpiCard label="Monthly Revenue" value={formatMoney(kpis.monthlyRevenue)} tone="good" />
            <KpiCard label="Expected Revenue" value={formatMoney(kpis.expectedRevenue)} />
            <KpiCard label="Outstanding Payments" value={formatMoney(kpis.outstandingPayments)} tone="danger" />
            <KpiCard label="Upcoming Services" value={kpis.upcomingServices} tone="warn" />
            <KpiCard label="Insurance Expiring" value={kpis.insuranceExpiryCount} tone="warn" />
            <KpiCard label="Unpaid Traffic Fines" value={kpis.trafficFinesUnpaid} tone="danger" />
            <KpiCard
              label="Profit (This Month)"
              value={formatMoney(kpis.profit)}
              tone={kpis.profit >= 0 ? 'good' : 'danger'}
            />
          </div>

          <div className="mt-8 rounded-lg border border-line bg-white shadow-sm">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-sm font-semibold text-ink">Top Costly Bikes</h2>
              <p className="mt-0.5 text-xs text-muted">Highest combined maintenance + expense cost, all-time.</p>
            </div>
            <TableShell>
              <thead>
                <tr>
                  <th className={th}>Registration #</th>
                  <th className={th}>Total Cost</th>
                  <th className={th}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {kpis.topCostlyBikes.length === 0 && <EmptyRow colSpan={3} />}
                {kpis.topCostlyBikes.map((b) => (
                  <tr key={b.bikeId} className="hover:bg-cream-2">
                    <td className={td}><BikeLink bike={bikeMap.get(b.bikeId)} fallback={b.registrationNumber} /></td>
                    <td className={td}>{formatMoney(b.totalCost)}</td>
                    <td className={td}>
                      <Link href={`/bikes/${b.bikeId}`} className="text-xs font-medium text-ink/70 hover:underline">
                        View bike →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          </div>
        </>
      )}
    </div>
  );
}
