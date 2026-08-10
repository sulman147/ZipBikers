'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createMaintenanceRecord,
  deleteMaintenanceRecord,
  getBikes,
  getMaintenanceRecords,
  updateMaintenanceRecord,
} from '@/lib/api';
import type { Bike, MaintenanceRecord, MaintenanceType } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EntityForm, FieldConfig, FormValues } from '@/components/ui/EntityForm';
import { Badge } from '@/components/ui/Badge';
import { TableShell, th, td, EmptyRow, LoadingRow } from '@/components/ui/Table';
import { BikeLink } from '@/components/BikeLink';
import { formatDate, formatMoney, titleCase } from '@/lib/utils';

const MAINTENANCE_TYPES: MaintenanceType[] = [
  'OIL_CHANGE',
  'BRAKE_PADS',
  'TYRES',
  'BATTERY',
  'SUSPENSION',
  'ACCIDENT_REPAIR',
  'OTHER',
];

const EMPTY: FormValues = {
  bikeId: '',
  type: 'OIL_CHANGE',
  description: '',
  labourCost: '',
  partsCost: '',
  totalCost: '',
  workshop: '',
  invoiceNumber: '',
  invoiceImages: [],
  mileageAtService: '',
  serviceDate: '',
  nextServiceDueDate: null,
  nextServiceDueMileage: null,
};

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceRecord | null>(null);
  const [deleting, setDeleting] = useState<MaintenanceRecord | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([getMaintenanceRecords(), getBikes()])
      .then(([m, b]) => {
        setRecords(m);
        setBikes(b);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load maintenance records'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const bikeMap = useMemo(() => new Map(bikes.map((b) => [b.id, b])), [bikes]);

  const fields: FieldConfig[] = useMemo(
    () => [
      { name: 'bikeId', label: 'Bike', type: 'select', required: true, options: bikes.map((b) => ({ label: `${b.registrationNumber} — ${b.brand} ${b.model}`, value: b.id })) },
      { name: 'type', label: 'Type', type: 'select', required: true, options: MAINTENANCE_TYPES.map((t) => ({ label: titleCase(t), value: t })) },
      { name: 'workshop', label: 'Workshop', type: 'text', required: true },
      { name: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: true },
      { name: 'labourCost', label: 'Labour Cost (QAR)', type: 'number', required: true },
      { name: 'partsCost', label: 'Parts Cost (QAR)', type: 'number', required: true },
      { name: 'totalCost', label: 'Total Cost (QAR)', type: 'number', required: true },
      { name: 'mileageAtService', label: 'Mileage at Service (km)', type: 'number', required: true },
      { name: 'serviceDate', label: 'Service Date', type: 'date', required: true },
      { name: 'nextServiceDueDate', label: 'Next Service Due Date', type: 'date', nullable: true },
      { name: 'nextServiceDueMileage', label: 'Next Service Due Mileage', type: 'number', nullable: true },
      { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
      { name: 'invoiceImages', label: 'Invoice Images', type: 'stringArray', colSpan: 2, helpText: 'One URL per line' },
    ],
    [bikes],
  );

  const initialValues = useMemo(() => (editing ? { ...editing } : EMPTY), [editing]);

  async function handleSubmit(values: FormValues) {
    if (editing) {
      await updateMaintenanceRecord(editing.id, values);
    } else {
      await createMaintenanceRecord(values);
    }
    setDrawerOpen(false);
    setEditing(null);
    load();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteMaintenanceRecord(deleting.id);
      setDeleting(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete maintenance record');
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle="Service history and upcoming maintenance scheduling."
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          >
            + New Record
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
              <th className={th}>Type</th>
              <th className={th}>Workshop</th>
              <th className={th}>Service Date</th>
              <th className={th}>Total Cost</th>
              <th className={th}>Next Due</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <LoadingRow colSpan={7} />}
            {!loading && records.length === 0 && <EmptyRow colSpan={7} />}
            {!loading &&
              records.map((m) => (
                <tr key={m.id} className="hover:bg-cream-2">
                  <td className={td}><BikeLink bike={bikeMap.get(m.bikeId)} fallback={m.bikeId} /></td>
                  <td className={td}>
                    <Badge tone="blue">{titleCase(m.type)}</Badge>
                  </td>
                  <td className={td}>{m.workshop}</td>
                  <td className={td}>{formatDate(m.serviceDate)}</td>
                  <td className={td}>{formatMoney(m.totalCost)}</td>
                  <td className={td}>{formatDate(m.nextServiceDueDate)}</td>
                  <td className={td}>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(m);
                          setDrawerOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleting(m)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </TableShell>
      </Card>

      <Modal open={drawerOpen} title={editing ? 'Edit Maintenance Record' : 'New Maintenance Record'} onClose={() => setDrawerOpen(false)} size="xl">
        <EntityForm fields={fields} initialValues={initialValues} onCancel={() => setDrawerOpen(false)} onSubmit={handleSubmit} submitLabel={editing ? 'Save changes' : 'Create record'} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this maintenance record?"
        description="This action cannot be undone."
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
