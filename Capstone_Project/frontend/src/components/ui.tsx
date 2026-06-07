import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function PrimaryButton({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#27856f] focus:outline-none focus:ring-2 focus:ring-mint/30 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-200 ${className}`}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  title,
  description,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const body = description || message || '';

  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto max-w-md">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-steel">{body}</p>
        {actionLabel && onAction && (
          <div className="mt-5">
            <PrimaryButton onClick={onAction}>{actionLabel}</PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}

export function ActionModal({
  title,
  description,
  open = true,
  onClose,
  children,
  footer,
}: {
  title: string;
  description: string;
  open?: boolean;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 px-4">
      <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-steel">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-lg leading-none text-steel hover:bg-gray-100"
            aria-label="Close"
          >
            x
          </button>
        </div>
        {children && <div className="mt-5">{children}</div>}
        <div className="mt-6 flex justify-end">{footer || <SecondaryButton onClick={onClose}>Close</SecondaryButton>}</div>
      </div>
    </div>
  );
}

export function PermissionNotice({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
      <div className="text-base font-semibold">Permission required</div>
      <p className="mt-2 text-sm leading-6">{message}</p>
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}
