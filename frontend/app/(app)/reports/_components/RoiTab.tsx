'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getBikes, getRoiReport } from '@/lib/api';
import type { Bike, RoiReport } from '@/lib/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { TableShell, th, td, EmptyRow } from '@/components/ui/Table';
import { BikeLink } from '@/components/BikeLink';
import { CATEGORICAL, CHROME, axisTickStyle, tooltipContentStyle, tooltipLabelStyle } from '@/lib/chartTheme';
import { formatMoney } from '@/lib/utils';

export function RoiTab() {
  const [rows, setRows] = useState<RoiReport[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRoiReport(), getBikes()])
      .then(([r, bk]) => {
        setRows(r.slice().sort((a, b) => b.roiPercent - a.roiPercent));
        setBikes(bk);
      })
      .finally(() => setLoading(false));
  }, []);

  const bikeMap = useMemo(() => new Map(bikes.map((b) => [b.id, b])), [bikes]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader title="Return on Investment" subtitle="ROI% = (totalRevenue − totalInvested) / totalInvested." />
        <div className="h-72 px-3 py-4">
          {loading ? (
            <p className="text-center text-sm text-muted">Loading…</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={CHROME.gridline} />
                <XAxis dataKey="registrationNumber" tick={axisTickStyle} axisLine={{ stroke: CHROME.baseline }} tickLine={false} />
                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={60} tickFormatter={(v) => `${v}%`} />
                <ReferenceLine y={0} stroke={CHROME.baseline} />
                <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} formatter={(v) => [`${v}%`, 'ROI']} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
                <Bar dataKey="roiPercent" name="ROI %" radius={[4, 4, 4, 4]} maxBarSize={28}>
                  {rows.map((r) => (
                    <Cell key={r.bikeId} fill={r.roiPercent >= 0 ? CATEGORICAL[0] : CATEGORICAL[7]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card>
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Reg. Number</th>
              <th className={th}>Total Invested</th>
              <th className={th}>Total Revenue</th>
              <th className={th}>ROI %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && <EmptyRow colSpan={4} />}
            {rows.map((r) => (
              <tr key={r.bikeId}>
                <td className={td}><BikeLink bike={bikeMap.get(r.bikeId)} fallback={r.registrationNumber} /></td>
                <td className={td}>{formatMoney(r.totalInvested)}</td>
                <td className={td}>{formatMoney(r.totalRevenue)}</td>
                <td className={`${td} font-medium`} style={{ color: r.roiPercent >= 0 ? CHROME.successText : CATEGORICAL[7] }}>
                  {r.roiPercent}%
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Card>
    </div>
  );
}
