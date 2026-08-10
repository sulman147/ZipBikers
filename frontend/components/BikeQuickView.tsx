'use client';

import Link from 'next/link';
import type { Bike } from '@/lib/types';
import { Modal, DetailRow } from './ui/Modal';
import { StatusBadge } from './ui/Badge';
import { formatMoney } from '@/lib/utils';

export function BikeQuickView({ bike, onClose }: { bike: Bike; onClose: () => void }) {
  return (
    <Modal open title={bike.registrationNumber} onClose={onClose}>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-serif text-lg font-bold text-ink">
          {bike.brand} {bike.model} · {bike.year}
        </p>
        <StatusBadge status={bike.status} />
      </div>
      <div className="divide-y divide-line">
        <DetailRow label="Registration" value={bike.registrationNumber} />
        <DetailRow label="Mileage" value={`${bike.currentMileage.toLocaleString()} km`} />
        <DetailRow label="Battery health" value={`${bike.batteryHealth}%`} />
        <DetailRow label="Purchase price" value={formatMoney(bike.purchasePrice)} />
        <DetailRow label="Registration cost" value={formatMoney(bike.registrationCost)} />
        <DetailRow label="Yearly insurance" value={formatMoney(bike.yearlyInsurance)} />
      </div>
      <Link
        href={`/bikes/${bike.id}`}
        onClick={onClose}
        className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline"
      >
        View full profile →
      </Link>
    </Modal>
  );
}
