'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createInspection,
  deleteInspection,
  getAssignments,
  getBikes,
  getInspections,
  getRiders,
  updateInspection,
} from '@/lib/api';
import type { Assignment, Bike, Inspection, InspectionType, Rider } from '@/lib/types';
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
import { formatDate } from '@/lib/utils';

const INSPECTION_TYPES: InspectionType[] = ['BEFORE', 'AFTER'];

const EMPTY: FormValues = {
  bikeId: '',
  riderId: '',
  assignmentId: '',
  type: 'BEFORE',
  mileage: '',
  condition: '',
  damageNotes: '',
  photos: [],
  signature: null,
  inspectionDate: '',
};

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Inspection | null>(null);
  const [deleting, setDeleting] = useState<Inspection | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([getInspections(), getBikes(), getRiders(), getAssignments()])
      .then(([i, b, r, a]) => {
        setInspections(i);
        setBikes(b);
        setRiders(r);
        setAssignments(a);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load inspections'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const bikeMap = useMemo(() => new Map(bikes.map((b) => [b.id, b])), [bikes]);
  const riderMap = useMemo(() => new Map(riders.map((r) => [r.id, r])), [riders]);

  const fields: FieldConfig[] = useMemo(
    () => [
      { name: 'bikeId', label: 'Bike', type: 'select', required: true, options: bikes.map((b) => ({ label: b.registrationNumber, value: b.id })) },
      { name: 'riderId', label: 'Rider', type: 'select', required: true, options: riders.map((r) => ({ label: r.fullName, value: r.id })) },
      { name: 'assignmentId', label: 'Assignment', type: 'select', required: true, options: assignments.map((a) => ({ label: `${a.id} (${bikeMap.get(a.bikeId)?.registrationNumber ?? a.bikeId})`, value: a.id })) },
      { name: 'type', label: 'Type', type: 'select', required: true, options: INSPECTION_TYPES.map((t) => ({ label: t, value: t })) },
      { name: 'inspectionDate', label: 'Inspection Date', type: 'date', required: true },
      { name: 'mileage', label: 'Mileage (km)', type: 'number', required: true },
      { name: 'condition', label: 'Condition', type: 'text', required: true, colSpan: 2 },
      { name: 'damageNotes', label: 'Damage Notes', type: 'textarea', colSpan: 2 },
      { name: 'signature', label: 'Signature URL', type: 'text', nullable: true },
      { name: 'photos', label: 'Photos', type: 'stringArray', colSpan: 2, helpText: 'One URL per line' },
    ],
    [bikes, riders, assignments, bikeMap],
  );

  const initialValues = useMemo(() => (editing ? { ...editing } : EMPTY), [editing]);

  async function handleSubmit(values: FormValues) {
    if (editing) {
      await updateInspection(editing.id, values);
    } else {
      await createInspection(values);
    }
    setDrawerOpen(false);
    setEditing(null);
    load();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteInspection(deleting.id);
      setDeleting(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete inspection');
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Inspections"
        subtitle="Before/after condition inspections tied to bike handovers."
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          >
            + New Inspection
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
              <th className={th}>Type</th>
              <th className={th}>Date</th>
              <th className={th}>Mileage</th>
              <th className={th}>Condition</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <LoadingRow colSpan={7} />}
            {!loading && inspections.length === 0 && <EmptyRow colSpan={7} />}
            {!loading &&
              inspections.map((i) => (
                <tr key={i.id} className="hover:bg-cream-2">
                  <td className={td}><BikeLink bike={bikeMap.get(i.bikeId)} fallback={i.bikeId} /></td>
                  <td className={td}><RiderLink rider={riderMap.get(i.riderId)} fallback={i.riderId} /></td>
                  <td className={td}>
                    <StatusBadge status={i.type} />
                  </td>
                  <td className={td}>{formatDate(i.inspectionDate)}</td>
                  <td className={td}>{i.mileage.toLocaleString()} km</td>
                  <td className={td}>{i.condition}</td>
                  <td className={td}>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(i);
                          setDrawerOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleting(i)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </TableShell>
      </Card>

      <Modal open={drawerOpen} title={editing ? 'Edit Inspection' : 'New Inspection'} onClose={() => setDrawerOpen(false)} size="xl">
        <EntityForm fields={fields} initialValues={initialValues} onCancel={() => setDrawerOpen(false)} onSubmit={handleSubmit} submitLabel={editing ? 'Save changes' : 'Create inspection'} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this inspection record?"
        description="This action cannot be undone."
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
