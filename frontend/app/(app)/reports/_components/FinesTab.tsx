'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getBikes, getRiders, getTrafficFinesReport } from '@/lib/api';
import type { Bike, Rider, TrafficFineReport } from '@/lib/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { TableShell, th, td, EmptyRow } from '@/components/ui/Table';
import { BikeLink } from '@/components/BikeLink';
import { RiderLink } from '@/components/RiderLink';
import { CATEGORICAL, CHROME, axisTickStyle, tooltipContentStyle, tooltipLabelStyle } from '@/lib/chartTheme';
import { formatMoney } from '@/lib/utils';

export function FinesTab() {
  const [rows, setRows] = useState<TrafficFineReport[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTrafficFinesReport(), getBikes(), getRiders()])
      .then(([r, b, ri]) => {
        setRows(r);
        setBikes(b);
        setRiders(ri);
      })
      .finally(() => setLoading(false));
  }, []);

  const bikeMap = useMemo(() => new Map(bikes.map((b) => [b.id, b])), [bikes]);
  const riderMap = useMemo(() => new Map(riders.map((r) => [r.id, r])), [riders]);

  const chartData = rows.map((r) => ({
    ...r,
    label: bikeMap.get(r.bikeId)?.registrationNumber ?? r.bikeId,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title="Traffic Fine Reports" subtitle="Total vs. unpaid fine amounts, by bike/rider pair." />
        <div className="h-72 px-3 py-4">
          {loading ? (
            <p className="text-center text-sm text-muted">Loading…</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={CHROME.gridline} />
                <XAxis dataKey="label" tick={axisTickStyle} axisLine={{ stroke: CHROME.baseline }} tickLine={false} />
                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => formatMoney(v)} />
                <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} formatter={(v) => formatMoney(Number(v))} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: CHROME.textSecondary }} />
                <Bar dataKey="totalAmount" name="Total Amount" fill={CATEGORICAL[0]} radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="unpaidAmount" name="Unpaid Amount" fill={CATEGORICAL[7]} radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card>
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Bike</th>
              <th className={th}>Rider</th>
              <th className={th}>Count</th>
              <th className={th}>Total Amount</th>
              <th className={th}>Unpaid Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && <EmptyRow colSpan={5} />}
            {rows.map((r, idx) => (
              <tr key={`${r.bikeId}-${r.riderId ?? 'none'}-${idx}`}>
                <td className={td}><BikeLink bike={bikeMap.get(r.bikeId)} fallback={r.bikeId} /></td>
                <td className={td}>{r.riderId ? <RiderLink rider={riderMap.get(r.riderId)} fallback={r.riderId} /> : '—'}</td>
                <td className={td}>{r.count}</td>
                <td className={td}>{formatMoney(r.totalAmount)}</td>
                <td className={td}>{formatMoney(r.unpaidAmount)}</td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Card>
    </div>
  );
}
