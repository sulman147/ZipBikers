'use client';

import { useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { getExpenseBreakdownReport } from '@/lib/api';
import type { ExpenseBreakdown } from '@/lib/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { TableShell, th, td, EmptyRow } from '@/components/ui/Table';
import { EXPENSE_CATEGORY_COLOR, tooltipContentStyle, tooltipLabelStyle, CHROME } from '@/lib/chartTheme';
import { formatMoney, titleCase } from '@/lib/utils';

export function ExpensesTab() {
  const [rows, setRows] = useState<ExpenseBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExpenseBreakdownReport()
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  const total = rows.reduce((sum, r) => sum + r.total, 0);
  const chartData = rows.map((r) => ({ ...r, label: titleCase(r.category) }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Expense Breakdown" subtitle={`${formatMoney(total)} total, by category`} />
        <div className="h-80 px-3 py-4">
          {loading ? (
            <p className="text-center text-sm text-muted">Loading…</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="total" nameKey="label" innerRadius="55%" outerRadius="85%" paddingAngle={2} stroke={CHROME.surface} strokeWidth={2}>
                  {chartData.map((r) => (
                    <Cell key={r.category} fill={EXPENSE_CATEGORY_COLOR[r.category]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} formatter={(v) => formatMoney(Number(v))} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{ fontSize: 12, color: CHROME.textSecondary }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Category Detail" />
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Category</th>
              <th className={th}>Total</th>
              <th className={th}>Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && <EmptyRow colSpan={3} />}
            {rows
              .slice()
              .sort((a, b) => b.total - a.total)
              .map((r) => (
                <tr key={r.category}>
                  <td className={td}>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: EXPENSE_CATEGORY_COLOR[r.category] }} />
                      {titleCase(r.category)}
                    </span>
                  </td>
                  <td className={td}>{formatMoney(r.total)}</td>
                  <td className={td}>{total > 0 ? `${((r.total / total) * 100).toFixed(1)}%` : '0%'}</td>
                </tr>
              ))}
          </tbody>
        </TableShell>
      </Card>
    </div>
  );
}
