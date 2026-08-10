'use client';

import { useState } from 'react';
import type { Rider } from '@/lib/types';
import { RiderQuickView } from './RiderQuickView';

/** Clickable rider reference used anywhere a rider is shown as plain text in a table/list — opens a quick-view popup instead of navigating away. */
export function RiderLink({ rider, fallback }: { rider?: Rider | null; fallback?: string }) {
  const [open, setOpen] = useState(false);

  if (!rider) return <span>{fallback ?? '—'}</span>;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="font-medium text-brand-600 transition-colors duration-150 hover:underline hover:text-brand-700"
      >
        {rider.fullName}
      </button>
      {open && <RiderQuickView rider={rider} onClose={() => setOpen(false)} />}
    </>
  );
}
