export function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-line text-sm">{children}</table>
    </div>
  );
}

export const th = 'px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted';
export const td = 'px-4 py-2.5 text-ink whitespace-nowrap';
export const trHover = 'transition-colors duration-150 hover:bg-cream-2 cursor-pointer';

export function EmptyRow({ colSpan, label = 'No records found.' }: { colSpan: number; label?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-muted">
        {label}
      </td>
    </tr>
  );
}

export function LoadingRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="animate-pulse px-4 py-10 text-center text-sm text-muted">
        Loading…
      </td>
    </tr>
  );
}
