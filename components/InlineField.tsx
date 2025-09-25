'use client';

import React, { useEffect, useState } from 'react';

type Props = {
  initial: string | number | null | undefined;
  placeholder?: string;
  onSave?: (value: string) => void | Promise<void>;
  readOnly?: boolean;
  className?: string;
};

export default function InlineField({
  initial,
  placeholder = '',
  onSave,
  readOnly = false,
  className = '',
}: Props) {
  const norm = (v: unknown) => (v === null || v === undefined ? '' : String(v));

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState<string>(norm(initial));

  useEffect(() => {
    setValue(norm(initial));
  }, [initial]);

  if (!editing || readOnly) {
    return (
      <button
        type="button"
        disabled={readOnly}
        onClick={() => !readOnly && setEditing(true)}
        className={`w-full rounded-md border px-2 py-1.5 text-left text-[15px] hover:bg-neutral-50 ${className}`}
        aria-label="Επεξεργασία"
        title="Κάνε κλικ για επεξεργασία"
      >
        {value !== '' ? value : <span className="text-neutral-400">{placeholder || '—'}</span>}
      </button>
    );
  }

  return (
    <input
      className={`w-full rounded-md border px-2 py-1.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-neutral-500/30 ${className}`}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={async () => {
        setEditing(false);
        if (!onSave) return;
        if (value !== norm(initial)) {
          try {
            await onSave(value);
          } catch (e) {
            setValue(norm(initial));
            console.error('InlineField save error:', e);
          }
        }
      }}
      placeholder={placeholder}
      autoFocus
      inputMode="decimal"
    />
  );
}

