'use client';

import { useEffect, useMemo, useState } from 'react';
import { createExpense, deleteExpense, getBikes, getExpenses, updateExpense } from '@/lib/api';
import type { Bike, Expense, ExpenseCategory } from '@/lib/types';
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

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'MAINTENANCE',
  'ACCESSORIES',
  'WASHING',
  'LABOUR',
  'INSURANCE',
  'REGISTRATION',
  'REPAIRS',
  'MISCELLANEOUS',
];

const EMPTY: FormValues = {
  category: 'MAINTENANCE',
  bikeId: null,
  amount: '',
  supplier: '',
  invoiceImages: [],
  notes: '',
  date: '',
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([getExpenses(), getBikes()])
      .then(([e, b]) => {
        setExpenses(e);
        setBikes(b);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load expenses'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const bikeMap = useMemo(() => new Map(bikes.map((b) => [b.id, b])), [bikes]);

  const fields: FieldConfig[] = useMemo(
    () => [
      { name: 'category', label: 'Category', type: 'select', required: true, options: EXPENSE_CATEGORIES.map((c) => ({ label: titleCase(c), value: c })) },
      { name: 'bikeId', label: 'Bike (optional)', type: 'select', nullable: true, options: bikes.map((b) => ({ label: b.registrationNumber, value: b.id })) },
      { name: 'amount', label: 'Amount (QAR)', type: 'number', required: true },
      { name: 'supplier', label: 'Supplier', type: 'text', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
      { name: 'invoiceImages', label: 'Invoice Images', type: 'stringArray', colSpan: 2, helpText: 'One URL per line' },
    ],
    [bikes],
  );

  const initialValues = useMemo(() => (editing ? { ...editing } : EMPTY), [editing]);

  async function handleSubmit(values: FormValues) {
    if (editing) {
      await updateExpense(editing.id, values);
    } else {
      await createExpense(values);
    }
    setDrawerOpen(false);
    setEditing(null);
    load();
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteExpense(deleting.id);
      setDeleting(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Non-maintenance operating costs (accessories, washing, insurance, etc.)."
        action={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          >
            + New Expense
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
              <th className={th}>Date</th>
              <th className={th}>Category</th>
              <th className={th}>Bike</th>
              <th className={th}>Supplier</th>
              <th className={th}>Amount</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading && <LoadingRow colSpan={6} />}
            {!loading && expenses.length === 0 && <EmptyRow colSpan={6} />}
            {!loading &&
              expenses.map((e) => (
                <tr key={e.id} className="hover:bg-cream-2">
                  <td className={td}>{formatDate(e.date)}</td>
                  <td className={td}>
                    <Badge tone="purple">{titleCase(e.category)}</Badge>
                  </td>
                  <td className={td}>{e.bikeId ? <BikeLink bike={bikeMap.get(e.bikeId)} fallback={e.bikeId} /> : '—'}</td>
                  <td className={td}>{e.supplier}</td>
                  <td className={td}>{formatMoney(e.amount)}</td>
                  <td className={td}>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(e);
                          setDrawerOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleting(e)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </TableShell>
      </Card>

      <Modal open={drawerOpen} title={editing ? 'Edit Expense' : 'New Expense'} onClose={() => setDrawerOpen(false)} size="xl">
        <EntityForm fields={fields} initialValues={initialValues} onCancel={() => setDrawerOpen(false)} onSubmit={handleSubmit} submitLabel={editing ? 'Save changes' : 'Create expense'} />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this expense?"
        description="This action cannot be undone."
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
