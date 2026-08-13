'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAssignments, getBikes, getRider } from '@/lib/api';
import type { Assignment, Bike, Rider } from '@/lib/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TableShell, th, td, EmptyRow } from '@/components/ui/Table';
import { BikeLink } from '@/components/BikeLink';
import { formatDate, formatMoney } from '@/lib/utils';

export default function RiderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [rider, setRider] = useState<Rider | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params.id;
    Promise.all([getRider(id), getAssignments(), getBikes()])
      .then(([r, a, b]) => {
        setRider(r);
        setAssignments(a.filter((x) => x.riderId === id));
        setBikes(b);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load rider'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-sm text-muted">Loading…</p>;
  if (error) return <p className="text-sm text-brand-600">{error}</p>;
  if (!rider) return <p className="text-sm text-muted">Rider not found.</p>;

  const bikeMap = new Map(bikes.map((b) => [b.id, b]));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button size="sm" variant="ghost" onClick={() => router.push('/riders')} className="mb-2 -ml-2">
            ← Back to riders
          </Button>
          <h1 className="text-xl font-semibold text-ink">{rider.fullName}</h1>
        </div>
        <StatusBadge status={rider.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Profile" />
          <dl className="divide-y divide-line px-5 py-2 text-sm">
            <Row label="QID" value={rider.qid} />
            <Row label="Passport #" value={rider.passportNumber} />
            <Row label="Driving Licence" value={rider.drivingLicence} />
            <Row label="Employer" value={rider.employer} />
            <Row label="Phone" value={rider.phone} />
            <Row label="Emergency Contact" value={rider.emergencyContactName} />
            <Row label="Emergency Phone" value={rider.emergencyContactPhone} />
            <Row
              label="Assigned Bike"
              value={rider.assignedBikeId ? <BikeLink bike={bikeMap.get(rider.assignedBikeId)} fallback={rider.assignedBikeId} /> : 'None'}
            />
            <Row label="Registered" value={formatDate(rider.createdAt)} />
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Assignment History" subtitle={`${assignments.length} assignment(s)`} />
          <TableShell>
            <thead>
              <tr>
                <th className={th}>Bike</th>
                <th className={th}>Monthly Rent</th>
                <th className={th}>Deposit</th>
                <th className={th}>Start</th>
                <th className={th}>End</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {assignments.length === 0 && <EmptyRow colSpan={6} />}
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td className={td}><BikeLink bike={bikeMap.get(a.bikeId)} fallback={a.bikeId} /></td>
                  <td className={td}>{formatMoney(a.monthlyRent)}</td>
                  <td className={td}>{formatMoney(a.deposit)}</td>
                  <td className={td}>{formatDate(a.contractStartDate)}</td>
                  <td className={td}>{formatDate(a.contractEndDate)}</td>
                  <td className={td}>
                    <StatusBadge status={a.status} />
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

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between py-2">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
