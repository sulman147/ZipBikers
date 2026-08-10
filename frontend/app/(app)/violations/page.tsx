'use client';

import { useEffect, useMemo, useState } from 'react';
import { createViolation, deleteViolation, getBikes, getRiders, getViolations, updateViolation } from '@/lib/api';
import type { Bike, Responsibility, Rider, TrafficViolation, ViolationStatus } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EntityForm, FieldConfig, FormValues } from '@/components/ui/EntityForm';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { TableShell, th, td, EmptyRow, LoadingRow } from '@/components/ui/Table';
import { BikeLink } from '@/components/BikeLink';
import { RiderLink } from '@/components/RiderLink';
import { formatDate, formatMoney } from '@/lib/utils';

const VIOLATION_STATUSES: ViolationStatus[] = ['PAID', 'UNPAID', 'DISPUTED'];
const RESPONSIBILITIES: Responsibility[] = ['RIDER', 'COMPANY', 'SHARED'];

const EMPTY: FormValues = {
  fineId: '',
  moiReference: '',
  bikeId: '',
  riderId: null,
  violationDate: '',
  location: '',
  violationType: '',
  amount: '',
  responsibility: 'RIDER',
  dueDate: '',
  status: 'UNPAID',
  fineScreenshot: null,
  officialImage: null,
  paymentReceipt: null,
  receiptNumber: null,
  paymentDate: null,
};

export default function ViolationsPage() {
  const [violations, setViolations] = useState<TrafficViolation[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<TrafficViolation | null>(null);
  const [deleting, setDeleting] = useState<TrafficViolation | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([getViolations(), getBikes(), getRiders()])
      .then(([v, b, r]) => {
        setViolations(v);
        setBikes(b);
        setRiders(r);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load violations'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const bikeMap = useMemo(() => new Map(bikes.map((b) => [b.id, b])), [bikes]);
  const riderMap = useMemo(() => new Map(riders.map((r) => [r.id, r])), [riders]);

  const fields: FieldConfig[] = useMemo(
    () => [
      { name: 'fineId', label: 'Fine ID', type: 'text', required: true },
      { name: 'moiReference', label: 'MOI Reference', type: 'text', required: true },
      { name: 'bikeId', label: 'Bike', type: 'select', required: true, options: bikes.map((b) => ({ label: b.registrationNumber, value: b.id })) },
      { name: 'riderId', label: 'Rider (optional)', type: 'select', nullable: true, options: riders.map((r) => ({ label: r.fullName, value: r.id })) },
      { name: 'violationDate', label: 'Violation Date', type: 'date', required: true },
      { name: 'location', label: 'Location', type: 'text', required: true },
      { name: 'violationType', label: 'Violation Type', type: 'text', required: true },
      { name: 'amount', label: 'Amount (QAR)', type: 'number', required: true },
      { name: 'responsibility', label: 'Responsibility', type: 'select', required: true, options: RESPONSIBILITIES.map((r) => ({ label: r, value: r })) },
      { name: 'status', label: 'Status', type: 'select', required: true, options: VIOLATION_STATUSES.map((s) => ({ label: s, value: s })) },
      { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
      { name: 'paymentDate', label: 'Payment Date', type: 'date', nullable: true },
      { name: 'receiptNumber', label: 'Receipt Number', type: 'text', nullable: true },
      { name: 'fineScreenshot', label: 'Fine Screenshot URL', type: 'text', nullable: true },
      { name: 'officialImage', label: 'Official Image URL', type: 'text', nullable: true },
      { name: 'paymentReceipt', label: 'Payment Receipt URL', type: 'text', nullable: true },
    ],
    [bikes, riders],
  );

  const initialValues = useMemo(() => (editing ? { ...editing } : EMPTY), [editing]);

  async function handleSubmit(values: FormValues) {
    if (editing) {
      await updateViolation(editing.id, values);
    } else {
      await createViolation(values);
    }
    setDrawerOpen(false);
    setEditing(null);
    load();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteViolation(deleting.id);
      setDeleting(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete violation');
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Traffic Violations"
        subtitle="Fines issued against fleet bikes, with rider/company responsibility."
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          >
            + New Violation
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700 ring-1 ring-inset ring-brand-200">
          {error}
        </div>
      )}

      <Card>
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Fine ID</th>
              <th className={th}>Bike</th>
              <th className={th}>Rider</th>
              <th className={th}>Date</th>
              <th className={th}>Type</th>
              <th className={th}>Amount</th>
              <th className={th}>Responsibility</th>
              <th className={th}>Status</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <LoadingRow colSpan={9} />}
            {!loading && violations.length === 0 && <EmptyRow colSpan={9} />}
            {!loading &&
              violations.map((v) => (
                <tr key={v.id} className="hover:bg-cream-2">
                  <td className={td}>{v.fineId}</td>
                  <td className={td}><BikeLink bike={bikeMap.get(v.bikeId)} fallback={v.bikeId} /></td>
                  <td className={td}>{v.riderId ? <RiderLink rider={riderMap.get(v.riderId)} fallback={v.riderId} /> : '—'}</td>
                  <td className={td}>{formatDate(v.violationDate)}</td>
                  <td className={td}>{v.violationType}</td>
                  <td className={td}>{formatMoney(v.amount)}</td>
                  <td className={td}>
                    <Badge tone="gray">{v.responsibility}</Badge>
                  </td>
                  <td className={td}>
                    <StatusBadge status={v.status} />
                  </td>
                  <td className={td}>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(v);
                          setDrawerOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleting(v)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </TableShell>
      </Card>

      <Modal open={drawerOpen} title={editing ? 'Edit Violation' : 'New Violation'} onClose={() => setDrawerOpen(false)} size="xl">
        <EntityForm fields={fields} initialValues={initialValues} onCancel={() => setDrawerOpen(false)} onSubmit={handleSubmit} submitLabel={editing ? 'Save changes' : 'Create violation'} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this violation record?"
        description="This action cannot be undone."
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
