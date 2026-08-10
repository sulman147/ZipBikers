'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getBikeProfitabilityReport, getBikes, getTopProfitableBikesReport } from '@/lib/api';
import type { Bike, BikeProfitability } from '@/lib/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { TableShell, th, td, EmptyRow } from '@/components/ui/Table';
import { BikeLink } from '@/components/BikeLink';
import { CATEGORICAL, CHROME, axisTickStyle, tooltipContentStyle, tooltipLabelStyle } from '@/lib/chartTheme';
import { formatMoney } from '@/lib/utils';

export function ProfitabilityTab() {
  const [rows, setRows] = useState<BikeProfitability[]>([]);
  const [top, setTop] = useState<BikeProfitability[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBikeProfitabilityReport(), getTopProfitableBikesReport(), getBikes()])
      .then(([r, t, b]) => {
        setRows(r);
        setTop(t);
        setBikes(b);
      })
      .finally(() => setLoading(false));
  }, []);

  const bikeMap = useMemo(() => new Map(bikes.map((b) => [b.id, b])), [bikes]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title="Bike Profitability" subtitle="Revenue vs. cost per bike, all-time." />
        <div className="h-80 px-3 py-4">
          {loading ? (
            <p className="text-center text-sm text-muted">Loading…</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={CHROME.gridline} />
                <XAxis dataKey="registrationNumber" tick={axisTickStyle} axisLine={{ stroke: CHROME.baseline }} tickLine={false} />
                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => formatMoney(v)} />
                <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} formatter={(v) => formatMoney(Number(v))} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: CHROME.textSecondary }} />
                <Bar dataKey="revenue" name="Revenue" fill={CATEGORICAL[0]} radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="costs" name="Costs" fill={CATEGORICAL[1]} radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Top 5 Profitable Bikes" />
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Reg. Number</th>
              <th className={th}>Revenue</th>
              <th className={th}>Costs</th>
              <th className={th}>Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {top.length === 0 && <EmptyRow colSpan={4} />}
            {top.map((r) => (
              <tr key={r.bikeId}>
                <td className={td}><BikeLink bike={bikeMap.get(r.bikeId)} fallback={r.registrationNumber} /></td>
                <td className={td}>{formatMoney(r.revenue)}</td>
                <td className={td}>{formatMoney(r.costs)}</td>
                <td className={`${td} font-medium`} style={{ color: r.profit >= 0 ? CHROME.successText : CATEGORICAL[7] }}>
                  {formatMoney(r.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Card>

      <Card>
        <CardHeader title="All Bikes — Profitability Detail" />
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Reg. Number</th>
              <th className={th}>Revenue</th>
              <th className={th}>Costs</th>
              <th className={th}>Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && <EmptyRow colSpan={4} />}
            {rows
              .slice()
              .sort((a, b) => b.profit - a.profit)
              .map((r) => (
                <tr key={r.bikeId}>
                  <td className={td}><BikeLink bike={bikeMap.get(r.bikeId)} fallback={r.registrationNumber} /></td>
                  <td className={td}>{formatMoney(r.revenue)}</td>
                  <td className={td}>{formatMoney(r.costs)}</td>
                  <td className={`${td} font-medium`} style={{ color: r.profit >= 0 ? CHROME.successText : CATEGORICAL[7] }}>
                    {formatMoney(r.profit)}
                  </td>
                </tr>
              ))}
          </tbody>
        </TableShell>
      </Card>
    </div>
  );
}
