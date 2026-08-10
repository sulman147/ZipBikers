'use client';

import Link from 'next/link';
import type { Rider } from '@/lib/types';
import { Modal, DetailRow } from './ui/Modal';
import { StatusBadge } from './ui/Badge';

export function RiderQuickView({ rider, onClose }: { rider: Rider; onClose: () => void }) {
  return (
    <Modal open title={rider.fullName} onClose={onClose}>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-serif text-lg font-bold text-ink">{rider.employer}</p>
        <StatusBadge status={rider.status} />
      </div>
      <div className="divide-y divide-line">
        <DetailRow label="Phone" value={rider.phone} />
        <DetailRow label="QID" value={rider.qid} />
        <DetailRow label="Passport" value={rider.passportNumber} />
        <DetailRow label="Driving licence" value={rider.drivingLicence} />
        <DetailRow label="Emergency contact" value={`${rider.emergencyContactName} · ${rider.emergencyContactPhone}`} />
      </div>
      <Link
        href={`/riders/${rider.id}`}
        onClick={onClose}
        className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:underline"
      >
        View full profile →
      </Link>
    </Modal>
  );
}
