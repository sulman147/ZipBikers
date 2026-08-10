'use client';

import { useEffect, useState } from 'react';
import { Button } from './Button';

export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'month'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'stringArray';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  options?: FieldOption[];
  required?: boolean;
  nullable?: boolean; // when true, an empty value is submitted as null instead of '' / undefined
  placeholder?: string;
  helpText?: string;
  step?: string;
  colSpan?: 1 | 2;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormValues = Record<string, any>;

interface EntityFormProps {
  fields: FieldConfig[];
  initialValues: FormValues;
  onSubmit: (values: FormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
  /**
   * Called after a field changes, with the field name, its new value, and the
   * values object post-change. Return a partial values object to merge in
   * (e.g. auto-filling "amount due" from a selected assignment's rent).
   */
  deriveOnChange?: (name: string, value: unknown, values: FormValues) => Partial<FormValues> | void;
}

export function EntityForm({ fields, initialValues, onSubmit, onCancel, submitLabel = 'Save', deriveOnChange }: EntityFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues.id]);

  function setField(name: string, value: unknown) {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      const derived = deriveOnChange?.(name, value, next);
      return derived ? { ...next, ...derived } : next;
    });
  }

  function buildPayload(): FormValues {
    const payload: FormValues = {};
    for (const field of fields) {
      const raw = values[field.name];
      if (field.type === 'number') {
        if (raw === '' || raw === null || raw === undefined) {
          payload[field.name] = field.nullable ? null : 0;
        } else {
          payload[field.name] = Number(raw);
        }
      } else if (field.type === 'checkbox') {
        payload[field.name] = Boolean(raw);
      } else if (field.type === 'stringArray') {
        const text = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw.join('\n') : '';
        payload[field.name] = text
          .split('\n')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
      } else {
        if ((raw === '' || raw === undefined || raw === null) && field.nullable) {
          payload[field.name] = null;
        } else {
          payload[field.name] = raw ?? '';
        }
      }
    }
    return payload;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(buildPayload());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name} className={field.colSpan === 2 ? 'col-span-2' : 'col-span-1'}>
            <label className="mb-1 block text-xs font-semibold text-ink/80">
              {field.label}
              {field.required && <span className="text-brand-600"> *</span>}
            </label>
            <FieldInput
              field={field}
              value={values[field.name]}
              onChange={(v) => setField(field.name, v)}
            />
            {field.helpText && <p className="mt-1 text-[11px] text-muted">{field.helpText}</p>}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-600 ring-1 ring-inset ring-brand-200">
          {error}
        </div>
      )}

      <div className="mt-2 flex justify-end gap-2 border-t border-line pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const baseClass =
    'block w-full rounded-lg border-0 px-3 py-1.5 text-sm text-ink ring-1 ring-inset ring-line transition-shadow duration-150 placeholder:text-muted focus:ring-2 focus:ring-inset focus:ring-brand-600';

  switch (field.type) {
    case 'textarea':
    case 'stringArray':
      return (
        <textarea
          className={baseClass}
          rows={field.type === 'stringArray' ? 3 : 3}
          placeholder={field.placeholder || (field.type === 'stringArray' ? 'One URL per line' : undefined)}
          value={typeof value === 'string' ? value : Array.isArray(value) ? value.join('\n') : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'select':
      return (
        <select
          className={baseClass}
          value={(value as string) ?? ''}
          required={field.required}
          onChange={(e) => onChange(e.target.value === '' ? (field.nullable ? null : '') : e.target.value)}
        >
          {(!field.required || field.nullable) && <option value="">{field.nullable ? '— None —' : 'Select…'}</option>}
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    case 'checkbox':
      return (
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-600"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          step={field.step || 'any'}
          className={baseClass}
          placeholder={field.placeholder}
          value={(value as string | number) ?? ''}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'date':
      return (
        <input
          type="date"
          className={baseClass}
          value={typeof value === 'string' ? value.slice(0, 10) : ''}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'month':
      return (
        <input
          type="month"
          className={baseClass}
          value={typeof value === 'string' ? value.slice(0, 7) : ''}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    default:
      return (
        <input
          type="text"
          className={baseClass}
          placeholder={field.placeholder}
          value={(value as string | number) ?? ''}
          required={field.required}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
