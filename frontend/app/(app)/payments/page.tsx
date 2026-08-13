'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createPayment,
  deletePayment,
  getAssignments,
  getBikes,
  getPayments,
  getRiders,
  updatePayment,
} from '@/lib/api';
import type { Assignment, Bike, Payment, PaymentStatus, Rider } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EntityForm, FieldConfig, FormValues } from '@/components/ui/EntityForm';
import { StatusBadge } from '@/components/ui/Badge';
import { TableShell, th, td, EmptyRow, LoadingRow } from '@/components/ui/Table';
import { BikeLink } from '@/components/BikeLink';
import { RiderLink } from '@/components/RiderLink';
import { cx, formatDate, formatMoney } from '@/lib/utils';

const FILTERS: Array<PaymentStatus | 'ALL'> = ['ALL', 'PAID', 'UNPAID', 'PARTIAL'];

const EMPTY: FormValues = {
  assignmentId: '',
  periodMonth: '',
  amountDue: '',
  amountPaid: '',
  dueDate: '',
  paidDate: null,
  receiptNumber: null,
  notes: '',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PaymentStatus | 'ALL'>('ALL');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [deleting, setDeleting] = useState<Payment | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([getPayments(), getAssignments(), getBikes(), getRiders()])
      .then(([p, a, b, r]) => {
        setPayments(p);
        setAssignments(a);
        setBikes(b);
        setRiders(r);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load payments'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const bikeMap = useMemo(() => new Map(bikes.map((b) => [b.id, b])), [bikes]);
  const riderMap = useMemo(() => new Map(riders.map((r) => [r.id, r])), [riders]);

  const fields: FieldConfig[] = useMemo(
    () => [
      {
        name: 'assignmentId',
        label: 'Assignment',
        type: 'select',
        required: true,
        helpText: 'Choosing an assignment fills in the bike, rider and rent amount due automatically.',
        options: assignments.map((a) => ({
          label: `${riderMap.get(a.riderId)?.fullName ?? a.riderId} — ${bikeMap.get(a.bikeId)?.registrationNumber ?? a.bikeId} — QAR ${a.monthlyRent}/mo`,
          value: a.id,
        })),
      },
      { name: 'periodMonth', label: 'Period Month', type: 'month', required: true },
      { name: 'amountDue', label: 'Amount Due (QAR)', type: 'number', required: true, helpText: 'Auto-filled from the assignment’s monthly rent — adjust only for a special case.' },
      { name: 'amountPaid', label: 'Amount Paid (QAR)', type: 'number', required: true, helpText: 'What the rider actually handed over. Status is calculated from this automatically.' },
      { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
      { name: 'paidDate', label: 'Paid Date', type: 'date', nullable: true, helpText: 'Leave blank — set automatically once an amount is paid.' },
      { name: 'receiptNumber', label: 'Receipt Number', type: 'text', nullable: true },
      { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
    ],
    [assignments, bikeMap, riderMap],
  );

  function deriveOnChange(name: string, value: unknown) {
    if (name === 'assignmentId') {
      const assignment = assignments.find((a) => a.id === value);
      if (assignment) return { amountDue: assignment.monthlyRent };
    }
  }

  const initialValues = useMemo(() => (editing ? { ...editing } : EMPTY), [editing]);

  const filtered = filter === 'ALL' ? payments : payments.filter((p) => p.status === filter);

  // bikeId/riderId/status/paidDate are derived server-side from the
  // assignment and amountDue/amountPaid (see PaymentsService) — the form
  // only needs to submit what the user actually filled in.
  async function handleSubmit(values: FormValues) {
    if (editing) {
      await updatePayment(editing.id, values);
    } else {
      await createPayment(values);
    }
    setDrawerOpen(false);
    setEditing(null);
    load();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deletePayment(deleting.id);
      setDeleting(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment');
    } finally {
      setDeleteBusy(false);
    }
  }

  async function markPaid(p: Payment) {
    setMarkingId(p.id);
    try {
      // status + paidDate are derived server-side from amountPaid.
      await updatePayment(p.id, { amountPaid: p.amountDue });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark payment as paid');
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Monthly rent payments per assignment."
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          >
            + New Payment
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cx(
              'rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset',
              filter === f ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-ink/70 ring-line hover:bg-cream-2',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-brand-50 px-3 py-2 text-sm text-brand-700 ring-1 ring-inset ring-brand-200">
          {error}
        </div>
      )}

      <Card>
        <TableShell>
          <thead>
            <tr>
              <th className={th}>Bike</th>
              <th className={th}>Rider</th>
              <th className={th}>Period</th>
              <th className={th}>Due</th>
              <th className={th}>Paid</th>
              <th className={th}>Due Date</th>
              <th className={th}>Status</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <LoadingRow colSpan={8} />}
            {!loading && filtered.length === 0 && <EmptyRow colSpan={8} />}
            {!loading &&
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-cream-2">
                  <td className={td}><BikeLink bike={bikeMap.get(p.bikeId)} fallback={p.bikeId} /></td>
                  <td className={td}><RiderLink rider={riderMap.get(p.riderId)} fallback={p.riderId} /></td>
                  <td className={td}>{p.periodMonth}</td>
                  <td className={td}>{formatMoney(p.amountDue)}</td>
                  <td className={td}>{formatMoney(p.amountPaid)}</td>
                  <td className={td}>{formatDate(p.dueDate)}</td>
                  <td className={td}>
                    <StatusBadge status={p.status} />
                  </td>
                  <td className={td}>
                    <div className="flex gap-2">
                      {p.status !== 'PAID' && (
                        <Button size="sm" variant="primary" disabled={markingId === p.id} onClick={() => markPaid(p)}>
                          {markingId === p.id ? 'Marking…' : 'Mark Paid'}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(p);
                          setDrawerOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleting(p)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </TableShell>
      </Card>

      <Modal open={drawerOpen} title={editing ? 'Edit Payment' : 'New Payment'} onClose={() => setDrawerOpen(false)} size="xl">
        <EntityForm fields={fields} initialValues={initialValues} onCancel={() => setDrawerOpen(false)} onSubmit={handleSubmit} deriveOnChange={deriveOnChange} submitLabel={editing ? 'Save changes' : 'Create payment'} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this payment record?"
        description="This action cannot be undone."
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
