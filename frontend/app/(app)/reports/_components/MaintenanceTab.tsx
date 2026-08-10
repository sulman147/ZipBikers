'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getBikes, getHighestMaintenanceBikesReport, getMaintenanceCostByBikeReport, getServiceDueReport } from '@/lib/api';
import type { Bike, MaintenanceCostByBike, MaintenanceRecord } from '@/lib/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { TableShell, th, td, EmptyRow } from '@/components/ui/Table';
import { BikeLink } from '@/components/BikeLink';
import { CATEGORICAL, CHROME, axisTickStyle, tooltipContentStyle, tooltipLabelStyle } from '@/lib/chartTheme';
import { formatDate, formatMoney, titleCase } from '@/lib/utils';

export function MaintenanceTab() {
  const [byBike, setByBike] = useState<MaintenanceCostByBike[]>([]);
  const [highest, setHighest] = useState<MaintenanceCostByBike[]>([]);
  const [dueSoon, setDueSoon] = useState<MaintenanceRecord[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMaintenanceCostByBikeReport(), getHighestMaintenanceBikesReport(), getServiceDueReport(), getBikes()])
      .then(([b, h, s, bk]) => {
        setByBike(b);
        setHighest(h);
        setDueSoon(s);
        setBikes(bk);
      })
      .finally(() => setLoading(false));
  }, []);

  const bikeMap = useMemo(() => new Map(bikes.map((b) => [b.id, b])), [bikes]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title="Maintenance Cost by Bike" subtitle="Total maintenance spend, all-time." />
        <div className="h-72 px-3 py-4">
          {loading ? (
            <p className="text-center text-sm text-muted">Loading…</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byBike} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={CHROME.gridline} />
                <XAxis dataKey="registrationNumber" tick={axisTickStyle} axisLine={{ stroke: CHROME.baseline }} tickLine={false} />
                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => formatMoney(v)} />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(v, name) => [name === 'totalCost' ? formatMoney(Number(v)) : String(v), name === 'totalCost' ? 'Total Cost' : 'Records']}
                  cursor={{ fill: 'rgba(11,11,11,0.04)' }}
                />
                <Bar dataKey="totalCost" name="Total Cost" fill={CATEGORICAL[1]} radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Highest Maintenance Bikes (Top 5)" />
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Reg. Number</th>
              <th className={th}>Total Cost</th>
              <th className={th}>Record Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {highest.length === 0 && <EmptyRow colSpan={3} />}
            {highest.map((h) => (
              <tr key={h.bikeId}>
                <td className={td}><BikeLink bike={bikeMap.get(h.bikeId)} fallback={h.registrationNumber} /></td>
                <td className={td}>{formatMoney(h.totalCost)}</td>
                <td className={td}>{h.recordCount}</td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Card>

      <Card>
        <CardHeader title="Service Due" subtitle="Within 30 days, or within 300km of current mileage." />
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Bike</th>
              <th className={th}>Type</th>
              <th className={th}>Next Due Date</th>
              <th className={th}>Next Due Mileage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {dueSoon.length === 0 && <EmptyRow colSpan={4} />}
            {dueSoon.map((m) => (
              <tr key={m.id}>
                <td className={td}><BikeLink bike={bikeMap.get(m.bikeId)} fallback={m.bikeId} /></td>
                <td className={td}>{titleCase(m.type)}</td>
                <td className={td}>{formatDate(m.nextServiceDueDate)}</td>
                <td className={td}>{m.nextServiceDueMileage != null ? `${m.nextServiceDueMileage.toLocaleString()} km` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Card>
    </div>
  );
}
