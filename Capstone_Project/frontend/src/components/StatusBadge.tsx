const tones: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-mint/15 text-mint',
  CREATED: 'bg-gray-100 text-gray-700',
  IN_TRANSIT: 'bg-sky-100 text-sky-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800'
};
export function StatusBadge({ value }: { value: string }) { return <span className={'rounded px-2 py-1 text-xs font-semibold ' + (tones[value] || 'bg-gray-100 text-gray-700')}>{value}</span>; }

