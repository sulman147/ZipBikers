'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBike, deleteBike, getBikes, updateBike } from '@/lib/api';
import type { Bike, BikeStatus } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EntityForm, FieldConfig, FormValues } from '@/components/ui/EntityForm';
import { StatusBadge } from '@/components/ui/Badge';
import { TableShell, th, td, EmptyRow, LoadingRow } from '@/components/ui/Table';

const BIKE_STATUSES: BikeStatus[] = ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED'];

const FIELDS: FieldConfig[] = [
  { name: 'qrCode', label: 'QR Code', type: 'text', required: true },
  { name: 'registrationNumber', label: 'Registration Number', type: 'text', required: true },
  { name: 'brand', label: 'Brand', type: 'text', required: true },
  { name: 'model', label: 'Model', type: 'text', required: true },
  { name: 'year', label: 'Year', type: 'number', required: true },
  { name: 'status', label: 'Status', type: 'select', required: true, options: BIKE_STATUSES.map((s) => ({ label: s, value: s })) },
  { name: 'purchasePrice', label: 'Purchase Price (QAR)', type: 'number', required: true },
  { name: 'registrationCost', label: 'Registration Cost (QAR)', type: 'number', required: true },
  { name: 'yearlyInsurance', label: 'Yearly Insurance (QAR)', type: 'number', required: true },
  { name: 'currentMileage', label: 'Current Mileage (km)', type: 'number', required: true },
  { name: 'batteryHealth', label: 'Battery Health (%)', type: 'number', required: true },
  { name: 'photos', label: 'Photos', type: 'stringArray', colSpan: 2, helpText: 'One URL per line' },
  { name: 'documents', label: 'Documents', type: 'stringArray', colSpan: 2, helpText: 'One URL per line' },
];

const EMPTY: FormValues = {
  qrCode: '',
  registrationNumber: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  status: 'AVAILABLE',
  purchasePrice: '',
  registrationCost: '',
  yearlyInsurance: '',
  currentMileage: '',
  batteryHealth: '',
  photos: [],
  documents: [],
};

export default function BikesPage() {
  const router = useRouter();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Bike | null>(null);
  const [deleting, setDeleting] = useState<Bike | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  function load() {
    setLoading(true);
    getBikes()
      .then(setBikes)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load bikes'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const initialValues = useMemo(() => (editing ? { ...editing } : EMPTY), [editing]);

  async function handleSubmit(values: FormValues) {
    if (editing) {
      await updateBike(editing.id, values);
    } else {
      await createBike(values);
    }
    setDrawerOpen(false);
    setEditing(null);
    load();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteBike(deleting.id);
      setDeleting(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bike');
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Bikes"
        subtitle="Fleet inventory — registration, condition, and lifecycle status."
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          >
            + New Bike
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
              <th className={th}>Reg. Number</th>
              <th className={th}>Brand / Model</th>
              <th className={th}>Status</th>
              <th className={th}>Mileage</th>
              <th className={th}>Battery</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <LoadingRow colSpan={6} />}
            {!loading && bikes.length === 0 && <EmptyRow colSpan={6} />}
            {!loading &&
              bikes.map((bike) => (
                <tr key={bike.id} className="hover:bg-cream-2">
                  <td className={td}>
                    <button className="font-medium text-ink hover:underline" onClick={() => router.push(`/bikes/${bike.id}`)}>
                      {bike.registrationNumber}
                    </button>
                  </td>
                  <td className={td}>
                    {bike.brand} {bike.model} <span className="text-muted">({bike.year})</span>
                  </td>
                  <td className={td}>
                    <StatusBadge status={bike.status} />
                  </td>
                  <td className={td}>{bike.currentMileage.toLocaleString()} km</td>
                  <td className={td}>{bike.batteryHealth}%</td>
                  <td className={td}>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(bike);
                          setDrawerOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleting(bike)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </TableShell>
      </Card>

      <Modal open={drawerOpen} title={editing ? `Edit ${editing.registrationNumber}` : 'New Bike'} onClose={() => setDrawerOpen(false)} size="xl">
        <EntityForm fields={FIELDS} initialValues={initialValues} onCancel={() => setDrawerOpen(false)} onSubmit={handleSubmit} submitLabel={editing ? 'Save changes' : 'Create bike'} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title={`Delete bike ${deleting?.registrationNumber ?? ''}?`}
        description="This action cannot be undone."
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
