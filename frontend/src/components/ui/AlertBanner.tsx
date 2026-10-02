import React from 'react';
import { cn } from '@/lib/utils';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

const variantStyles: Record<AlertVariant, string> = {
  error: 'bg-red-50 border-red-100 text-red-700',
  success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  warning: 'bg-amber-50 border-amber-100 text-amber-700',
  info: 'bg-slate-50 border-slate-100 text-slate-700',
};

interface AlertBannerProps {
  message: string;
  variant?: AlertVariant;
  className?: string;
}

export default function AlertBanner({ message, variant = 'error', className }: AlertBannerProps) {
  return (
    <div
      role="alert"
      className={cn('mb-6 rounded-lg border px-4 py-3 text-sm font-medium', variantStyles[variant], className)}
    >
      {message}
    </div>
  );
}
