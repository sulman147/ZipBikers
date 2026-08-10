'use client';

import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { getFleetUtilisationReport } from '@/lib/api';
import type { FleetUtilisation } from '@/lib/types';
import { Card, CardHeader, KpiCard } from '@/components/ui/Card';
import { CATEGORICAL, CHROME } from '@/lib/chartTheme';

export function UtilisationTab() {
  const [data, setData] = useState<FleetUtilisation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFleetUtilisationReport()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted">Loading…</p>;
  if (!data) return <p className="text-sm text-muted">No data.</p>;

  const gaugeData = [
    { name: 'Utilised', value: data.utilisationPercent },
    { name: 'Idle', value: Math.max(0, 100 - data.utilisationPercent) },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader title="Fleet Utilisation" subtitle="Percentage of the fleet currently assigned to a rider." />
        <div className="relative h-64 px-3 py-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gaugeData}
                dataKey="value"
                startAngle={180}
                endAngle={0}
                cx="50%"
                cy="80%"
                innerRadius="65%"
                outerRadius="100%"
                stroke="none"
              >
                <Cell fill={CATEGORICAL[0]} />
                <Cell fill={CHROME.gridline} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-x-0 top-[58%] flex flex-col items-center">
            <span className="text-4xl font-semibold text-ink">{data.utilisationPercent}%</span>
            <span className="mt-1 text-xs text-muted">Utilisation</span>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <KpiCard label="Total Bikes" value={data.totalBikes} />
        <KpiCard label="Assigned Bikes" value={data.assigned} tone="good" />
      </div>
    </div>
  );
}
