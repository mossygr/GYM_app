'use client';
import { useState, PropsWithChildren } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  open?: boolean;                 // controlled (optional)
  onToggle?: (next: boolean) => void;
  rightSlot?: React.ReactNode;    // actions στη δεξιά πλευρά (αν θες)
  tone?: 'plain' | 'subtle';      // οπτικό θέμα
  className?: string;
}>;

export default function CollapsibleCard({
  title,
  subtitle,
  defaultOpen = false,
  open,
  onToggle,
  rightSlot,
  children,
  tone = 'subtle',
  className = '',
}: Props) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;

  const toggle = () => {
    const next = !isOpen;
    setInternalOpen(next);
    onToggle?.(next);
  };

  return (
    <div
      className={[
        'rounded-2xl border',
        tone === 'subtle' ? 'bg-white/80 border-neutral-200 shadow-sm' : 'bg-white border-neutral-200',
        className,
      ].join(' ')}
    >
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4"
      >
        <div className="flex items-start gap-3 text-left">
          <div className="mt-0.5">
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
          <div>
            <div className="text-base sm:text-lg font-semibold leading-tight">{title}</div>
            {subtitle && <div className="text-xs sm:text-sm text-neutral-500 mt-0.5">{subtitle}</div>}
          </div>
        </div>
        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </button>

      {isOpen && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1">
          <div className="space-y-3">{children}</div>
        </div>
      )}
    </div>
  );
}

