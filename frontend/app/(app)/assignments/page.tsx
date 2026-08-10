'use client';

import { useEffect, useMemo, useState } from 'react';
import { createAssignment, deleteAssignment, getAssignments, getBikes, getRiders, updateAssignment } from '@/lib/api';
import type { Assignment, AssignmentStatus, Bike, Rider } from '@/lib/types';
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
import { formatDate, formatMoney } from '@/lib/utils';

const ASSIGNMENT_STATUSES: AssignmentStatus[] = ['ACTIVE', 'COMPLETED', 'TERMINATED'];

const EMPTY: FormValues = {
  bikeId: '',
  riderId: '',
  monthlyRent: '',
  deposit: '',
  contractStartDate: '',
  contractEndDate: null,
  beforePhotos: [],
  signatureRider: null,
  signatureStaff: null,
  status: 'ACTIVE',
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [deleting, setDeleting] = useState<Assignment | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([getAssignments(), getBikes(), getRiders()])
      .then(([a, b, r]) => {
        setAssignments(a);
        setBikes(b);
        setRiders(r);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load assignments'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const bikeMap = useMemo(() => new Map(bikes.map((b) => [b.id, b])), [bikes]);
  const riderMap = useMemo(() => new Map(riders.map((r) => [r.id, r])), [riders]);

  const fields: FieldConfig[] = useMemo(
    () => [
      { name: 'bikeId', label: 'Bike', type: 'select', required: true, options: bikes.map((b) => ({ label: `${b.registrationNumber} — ${b.brand} ${b.model}`, value: b.id })) },
      { name: 'riderId', label: 'Rider', type: 'select', required: true, options: riders.map((r) => ({ label: r.fullName, value: r.id })) },
      { name: 'status', label: 'Status', type: 'select', required: true, options: ASSIGNMENT_STATUSES.map((s) => ({ label: s, value: s })) },
      { name: 'monthlyRent', label: 'Monthly Rent (QAR)', type: 'number', required: true },
      { name: 'deposit', label: 'Deposit (QAR)', type: 'number', required: true },
      { name: 'contractStartDate', label: 'Contract Start', type: 'date', required: true },
      { name: 'contractEndDate', label: 'Contract End', type: 'date', nullable: true },
      { name: 'signatureRider', label: 'Rider Signature URL', type: 'text', nullable: true },
      { name: 'signatureStaff', label: 'Staff Signature URL', type: 'text', nullable: true },
      { name: 'beforePhotos', label: 'Before Photos', type: 'stringArray', colSpan: 2, helpText: 'One URL per line' },
    ],
    [bikes, riders],
  );

  const initialValues = useMemo(() => (editing ? { ...editing } : EMPTY), [editing]);

  async function handleSubmit(values: FormValues) {
    if (editing) {
      await updateAssignment(editing.id, values);
    } else {
      await createAssignment(values);
    }
    setDrawerOpen(false);
    setEditing(null);
    load();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteAssignment(deleting.id);
      setDeleting(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assignment');
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle="Bike lease contracts linking riders to bikes."
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          >
            + New Assignment
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
              <th className={th}>Bike</th>
              <th className={th}>Rider</th>
              <th className={th}>Monthly Rent</th>
              <th className={th}>Deposit</th>
              <th className={th}>Start</th>
              <th className={th}>End</th>
              <th className={th}>Status</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <LoadingRow colSpan={8} />}
            {!loading && assignments.length === 0 && <EmptyRow colSpan={8} />}
            {!loading &&
              assignments.map((a) => (
                <tr key={a.id} className="hover:bg-cream-2">
                  <td className={td}><BikeLink bike={bikeMap.get(a.bikeId)} fallback={a.bikeId} /></td>
                  <td className={td}><RiderLink rider={riderMap.get(a.riderId)} fallback={a.riderId} /></td>
                  <td className={td}>{formatMoney(a.monthlyRent)}</td>
                  <td className={td}>{formatMoney(a.deposit)}</td>
                  <td className={td}>{formatDate(a.contractStartDate)}</td>
                  <td className={td}>{formatDate(a.contractEndDate)}</td>
                  <td className={td}>
                    <StatusBadge status={a.status} />
                  </td>
                  <td className={td}>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(a);
                          setDrawerOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleting(a)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </TableShell>
      </Card>

      <Modal open={drawerOpen} title={editing ? 'Edit Assignment' : 'New Assignment'} onClose={() => setDrawerOpen(false)} size="xl">
        <EntityForm fields={fields} initialValues={initialValues} onCancel={() => setDrawerOpen(false)} onSubmit={handleSubmit} submitLabel={editing ? 'Save changes' : 'Create assignment'} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this assignment?"
        description="This action cannot be undone."
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
