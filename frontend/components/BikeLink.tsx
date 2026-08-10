'use client';

import { useState } from 'react';
import type { Bike } from '@/lib/types';
import { BikeQuickView } from './BikeQuickView';

/** Clickable bike reference used anywhere a bike is shown as plain text in a table/list — opens a quick-view popup instead of navigating away. */
export function BikeLink({ bike, fallback }: { bike?: Bike | null; fallback?: string }) {
  const [open, setOpen] = useState(false);

  if (!bike) return <span>{fallback ?? '—'}</span>;

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
        {bike.registrationNumber}
      </button>
      {open && <BikeQuickView bike={bike} onClose={() => setOpen(false)} />}
    </>
  );
}
