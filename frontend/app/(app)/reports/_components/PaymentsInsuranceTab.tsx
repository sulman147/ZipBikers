'use client';

import { useEffect, useMemo, useState } from 'react';
import { getBikes, getInsuranceExpiryReport, getOutstandingPaymentsReport, getRiders } from '@/lib/api';
import type { Bike, InsuranceExpiryReport, Payment, Rider } from '@/lib/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { TableShell, th, td, EmptyRow } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/Badge';
import { BikeLink } from '@/components/BikeLink';
import { RiderLink } from '@/components/RiderLink';
import { formatDate, formatMoney } from '@/lib/utils';

export function PaymentsInsuranceTab() {
  const [outstanding, setOutstanding] = useState<Payment[]>([]);
  const [insurance, setInsurance] = useState<InsuranceExpiryReport[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOutstandingPaymentsReport(), getInsuranceExpiryReport(), getBikes(), getRiders()])
      .then(([o, i, b, r]) => {
        setOutstanding(o);
        setInsurance(i);
        setBikes(b);
        setRiders(r);
      })
      .finally(() => setLoading(false));
  }, []);

  const bikeMap = useMemo(() => new Map(bikes.map((b) => [b.id, b])), [bikes]);
  const riderMap = useMemo(() => new Map(riders.map((r) => [r.id, r])), [riders]);
  const totalOutstanding = outstanding.reduce((sum, p) => sum + (p.amountDue - p.amountPaid), 0);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title="Outstanding Payments" subtitle={loading ? undefined : `${outstanding.length} record(s) — ${formatMoney(totalOutstanding)} outstanding`} />
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Bike</th>
              <th className={th}>Rider</th>
              <th className={th}>Period</th>
              <th className={th}>Due</th>
              <th className={th}>Paid</th>
              <th className={th}>Balance</th>
              <th className={th}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {!loading && outstanding.length === 0 && <EmptyRow colSpan={7} />}
            {outstanding.map((p) => (
              <tr key={p.id}>
                <td className={td}><BikeLink bike={bikeMap.get(p.bikeId)} fallback={p.bikeId} /></td>
                <td className={td}><RiderLink rider={riderMap.get(p.riderId)} fallback={p.riderId} /></td>
                <td className={td}>{p.periodMonth}</td>
                <td className={td}>{formatMoney(p.amountDue)}</td>
                <td className={td}>{formatMoney(p.amountPaid)}</td>
                <td className={td}>{formatMoney(p.amountDue - p.amountPaid)}</td>
                <td className={td}>
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Card>

      <Card>
        <CardHeader title="Insurance Expiry" subtitle="Sorted by soonest expiry." />
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Reg. Number</th>
              <th className={th}>Yearly Insurance</th>
              <th className={th}>Expiry Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {!loading && insurance.length === 0 && <EmptyRow colSpan={3} />}
            {insurance.map((i) => (
              <tr key={i.bikeId}>
                <td className={td}><BikeLink bike={bikeMap.get(i.bikeId)} fallback={i.registrationNumber} /></td>
                <td className={td}>{formatMoney(i.yearlyInsurance)}</td>
                <td className={td}>{formatDate(i.expiryDate)}</td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Card>
    </div>
  );
}
