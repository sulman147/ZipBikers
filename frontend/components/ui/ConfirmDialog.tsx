'use client';

import { createPortal } from 'react-dom';
import { Button } from './Button';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 animate-fade-in bg-ink/50" onClick={onCancel} />
      <div className="relative w-full max-w-sm animate-scale-in rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="font-serif text-sm font-bold text-ink">{title}</h3>
        {description && <p className="mt-2 text-sm text-muted">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
