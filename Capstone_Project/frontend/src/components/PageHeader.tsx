// export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
//   return <div className="mb-6"><h1 className="text-2xl font-semibold text-ink">{title}</h1><p className="mt-1 text-sm text-steel">{subtitle}</p></div>;
// }


import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 border-b border-gray-200 pb-5 md:flex-row md:items-end md:justify-between">
    <div>
      <h1 className="text-2xl font-semibold tracking-normal text-ink">{title}</h1>
      <p className="mt-1.5 max-w-3xl text-sm leading-6 text-steel">{subtitle}</p>
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>;
}

