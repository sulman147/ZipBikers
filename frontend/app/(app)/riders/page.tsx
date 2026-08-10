'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRider, deleteRider, getBikes, getRiders, updateRider } from '@/lib/api';
import type { Bike, Rider, RiderStatus } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EntityForm, FieldConfig, FormValues } from '@/components/ui/EntityForm';
import { StatusBadge } from '@/components/ui/Badge';
import { TableShell, th, td, EmptyRow, LoadingRow } from '@/components/ui/Table';
import { BikeLink } from '@/components/BikeLink';

const RIDER_STATUSES: RiderStatus[] = ['ACTIVE', 'INACTIVE'];

const EMPTY: FormValues = {
  fullName: '',
  qid: '',
  passportNumber: '',
  drivingLicence: '',
  employer: '',
  phone: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  documents: [],
  assignedBikeId: null,
  status: 'ACTIVE',
};

export default function RidersPage() {
  const router = useRouter();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Rider | null>(null);
  const [deleting, setDeleting] = useState<Rider | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([getRiders(), getBikes()])
      .then(([r, b]) => {
        setRiders(r);
        setBikes(b);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load riders'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const bikeMap = useMemo(() => new Map(bikes.map((b) => [b.id, b])), [bikes]);

  const fields: FieldConfig[] = useMemo(
    () => [
      { name: 'fullName', label: 'Full Name', type: 'text', required: true },
      { name: 'status', label: 'Status', type: 'select', required: true, options: RIDER_STATUSES.map((s) => ({ label: s, value: s })) },
      { name: 'qid', label: 'QID', type: 'text', required: true },
      { name: 'passportNumber', label: 'Passport Number', type: 'text', required: true },
      { name: 'drivingLicence', label: 'Driving Licence', type: 'text', required: true },
      { name: 'employer', label: 'Employer', type: 'text', required: true },
      { name: 'phone', label: 'Phone', type: 'text', required: true },
      { name: 'emergencyContactName', label: 'Emergency Contact Name', type: 'text', required: true },
      { name: 'emergencyContactPhone', label: 'Emergency Contact Phone', type: 'text', required: true },
      {
        name: 'assignedBikeId',
        label: 'Assigned Bike',
        type: 'select',
        nullable: true,
        options: bikes.map((b) => ({ label: `${b.registrationNumber} — ${b.brand} ${b.model}`, value: b.id })),
      },
      { name: 'documents', label: 'Documents', type: 'stringArray', colSpan: 2, helpText: 'One URL per line' },
    ],
    [bikes],
  );

  const initialValues = useMemo(() => (editing ? { ...editing } : EMPTY), [editing]);

  async function handleSubmit(values: FormValues) {
    if (editing) {
      await updateRider(editing.id, values);
    } else {
      await createRider(values);
    }
    setDrawerOpen(false);
    setEditing(null);
    load();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteRider(deleting.id);
      setDeleting(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rider');
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Riders"
        subtitle="Rider profiles, documents, and bike assignment status."
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          >
            + New Rider
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
              <th className={th}>Name</th>
              <th className={th}>Employer</th>
              <th className={th}>Phone</th>
              <th className={th}>Assigned Bike</th>
              <th className={th}>Status</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <LoadingRow colSpan={6} />}
            {!loading && riders.length === 0 && <EmptyRow colSpan={6} />}
            {!loading &&
              riders.map((rider) => (
                <tr key={rider.id} className="hover:bg-cream-2">
                  <td className={td}>
                    <button className="font-medium text-ink hover:underline" onClick={() => router.push(`/riders/${rider.id}`)}>
                      {rider.fullName}
                    </button>
                  </td>
                  <td className={td}>{rider.employer}</td>
                  <td className={td}>{rider.phone}</td>
                  <td className={td}>
                    {rider.assignedBikeId ? <BikeLink bike={bikeMap.get(rider.assignedBikeId)} fallback={rider.assignedBikeId} /> : '—'}
                  </td>
                  <td className={td}>
                    <StatusBadge status={rider.status} />
                  </td>
                  <td className={td}>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(rider);
                          setDrawerOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleting(rider)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </TableShell>
      </Card>

      <Modal open={drawerOpen} title={editing ? `Edit ${editing.fullName}` : 'New Rider'} onClose={() => setDrawerOpen(false)} size="xl">
        <EntityForm fields={fields} initialValues={initialValues} onCancel={() => setDrawerOpen(false)} onSubmit={handleSubmit} submitLabel={editing ? 'Save changes' : 'Create rider'} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title={`Delete rider ${deleting?.fullName ?? ''}?`}
        description="This action cannot be undone."
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
