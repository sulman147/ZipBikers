import { cx } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 disabled:bg-brand-300',
  secondary: 'bg-white text-ink ring-1 ring-inset ring-line hover:bg-neutral-50 disabled:text-muted',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 disabled:bg-rose-300',
  ghost: 'text-muted hover:bg-neutral-50 disabled:text-muted/50',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'secondary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-all duration-150 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  );
}
