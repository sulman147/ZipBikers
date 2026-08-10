'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getMonthlyRevenueReport, getYearlyRevenueReport } from '@/lib/api';
import type { MonthlyRevenuePoint, YearlyRevenuePoint } from '@/lib/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { CATEGORICAL, CHROME, axisTickStyle, tooltipContentStyle, tooltipLabelStyle } from '@/lib/chartTheme';
import { formatMoney } from '@/lib/utils';

const YEARS = ['2024', '2025', '2026'];

export function RevenueTab() {
  const [year, setYear] = useState('2026');
  const [monthly, setMonthly] = useState<MonthlyRevenuePoint[]>([]);
  const [yearly, setYearly] = useState<YearlyRevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getMonthlyRevenueReport(year), getYearlyRevenueReport()])
      .then(([m, y]) => {
        setMonthly(m);
        setYearly(y);
      })
      .finally(() => setLoading(false));
  }, [year]);

  const monthlyData = monthly.map((m) => ({ ...m, label: m.month.slice(5) }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader
          title="Monthly Revenue"
          subtitle="Amount actually collected (amountPaid), by calendar month."
          action={
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="rounded-md border-0 px-2.5 py-1 text-xs ring-1 ring-inset ring-line focus:ring-2 focus:ring-brand-600"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          }
        />
        <div className="h-72 px-3 py-4">
          {loading ? (
            <p className="text-center text-sm text-muted">Loading…</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={CHROME.gridline} />
                <XAxis dataKey="label" tick={axisTickStyle} axisLine={{ stroke: CHROME.baseline }} tickLine={false} />
                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => formatMoney(v)} />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(v) => [formatMoney(Number(v)), 'Revenue']}
                  cursor={{ fill: 'rgba(11,11,11,0.04)' }}
                />
                <Bar dataKey="revenue" name="Revenue" fill={CATEGORICAL[0]} radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Yearly Revenue" subtitle="Total collected revenue per calendar year." />
        <div className="h-72 px-3 py-4">
          {loading ? (
            <p className="text-center text-sm text-muted">Loading…</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearly} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={CHROME.gridline} />
                <XAxis dataKey="year" tick={axisTickStyle} axisLine={{ stroke: CHROME.baseline }} tickLine={false} />
                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => formatMoney(v)} />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(v) => [formatMoney(Number(v)), 'Revenue']}
                  cursor={{ fill: 'rgba(11,11,11,0.04)' }}
                />
                <Bar dataKey="revenue" name="Revenue" fill={CATEGORICAL[0]} radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
