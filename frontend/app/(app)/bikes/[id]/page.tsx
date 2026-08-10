'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getBike,
  getExpenses,
  getMaintenanceRecords,
  getPayments,
} from '@/lib/api';
import type { Bike, Expense, MaintenanceRecord, Payment } from '@/lib/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TableShell, th, td, EmptyRow } from '@/components/ui/Table';
import { formatDate, formatMoney, titleCase } from '@/lib/utils';

export default function BikeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [bike, setBike] = useState<Bike | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params.id;
    Promise.all([getBike(id), getMaintenanceRecords(), getExpenses(), getPayments()])
      .then(([b, m, e, p]) => {
        setBike(b);
        setMaintenance(m.filter((r) => r.bikeId === id));
        setExpenses(e.filter((r) => r.bikeId === id));
        setPayments(p.filter((r) => r.bikeId === id));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load bike'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-sm text-muted">Loading…</p>;
  if (error) return <p className="text-sm text-brand-600">{error}</p>;
  if (!bike) return <p className="text-sm text-muted">Bike not found.</p>;

  const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.totalCost, 0);
  const totalExpenseCost = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRevenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button size="sm" variant="ghost" onClick={() => router.push('/bikes')} className="mb-2 -ml-2">
            ← Back to bikes
          </Button>
          <h1 className="text-xl font-semibold text-ink">
            {bike.brand} {bike.model} <span className="text-muted">— {bike.registrationNumber}</span>
          </h1>
        </div>
        <StatusBadge status={bike.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Profile" />
          <dl className="divide-y divide-line px-5 py-2 text-sm">
            <Row label="QR Code" value={bike.qrCode} />
            <Row label="Year" value={String(bike.year)} />
            <Row label="Current Mileage" value={`${bike.currentMileage.toLocaleString()} km`} />
            <Row label="Battery Health" value={`${bike.batteryHealth}%`} />
            <Row label="Purchase Price" value={formatMoney(bike.purchasePrice)} />
            <Row label="Registration Cost" value={formatMoney(bike.registrationCost)} />
            <Row label="Yearly Insurance" value={formatMoney(bike.yearlyInsurance)} />
            {bike.insuranceExpiryDate && <Row label="Insurance Expiry" value={formatDate(bike.insuranceExpiryDate)} />}
            <Row label="Created" value={formatDate(bike.createdAt)} />
            <Row label="Updated" value={formatDate(bike.updatedAt)} />
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Financial Ledger" subtitle="Revenue vs. costs attributed to this bike (all-time)." />
          <div className="grid grid-cols-3 gap-4 px-5 py-5">
            <Ledger label="Revenue (paid)" value={formatMoney(totalRevenue)} tone="good" />
            <Ledger label="Maintenance Cost" value={formatMoney(totalMaintenanceCost)} tone="warn" />
            <Ledger label="Other Expenses" value={formatMoney(totalExpenseCost)} tone="warn" />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <Card>
          <CardHeader title="Maintenance History" subtitle={`${maintenance.length} record(s)`} />
          <TableShell>
            <thead>
              <tr>
                <th className={th}>Date</th>
                <th className={th}>Type</th>
                <th className={th}>Workshop</th>
                <th className={th}>Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {maintenance.length === 0 && <EmptyRow colSpan={4} />}
              {maintenance.map((m) => (
                <tr key={m.id}>
                  <td className={td}>{formatDate(m.serviceDate)}</td>
                  <td className={td}>{titleCase(m.type)}</td>
                  <td className={td}>{m.workshop}</td>
                  <td className={td}>{formatMoney(m.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Card>

        <Card>
          <CardHeader title="Expenses" subtitle={`${expenses.length} record(s)`} />
          <TableShell>
            <thead>
              <tr>
                <th className={th}>Date</th>
                <th className={th}>Category</th>
                <th className={th}>Supplier</th>
                <th className={th}>Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {expenses.length === 0 && <EmptyRow colSpan={4} />}
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td className={td}>{formatDate(e.date)}</td>
                  <td className={td}>{titleCase(e.category)}</td>
                  <td className={td}>{e.supplier}</td>
                  <td className={td}>{formatMoney(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Card>

        <Card>
          <CardHeader title="Payment History" subtitle={`${payments.length} record(s)`} />
          <TableShell>
            <thead>
              <tr>
                <th className={th}>Period</th>
                <th className={th}>Due</th>
                <th className={th}>Paid</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payments.length === 0 && <EmptyRow colSpan={4} />}
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className={td}>{p.periodMonth}</td>
                  <td className={td}>{formatMoney(p.amountDue)}</td>
                  <td className={td}>{formatMoney(p.amountPaid)}</td>
                  <td className={td}>
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

function Ledger({ label, value, tone }: { label: string; value: string; tone: 'good' | 'warn' }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${tone === 'good' ? 'text-good-600' : 'text-warn-600'}`}>{value}</p>
    </div>
  );
}
