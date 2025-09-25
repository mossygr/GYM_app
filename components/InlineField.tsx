'use client';
import { useState } from 'react';

export default function InlineField({ value: initial, onSave, placeholder }: { value: string; onSave: (v: string) => void; placeholder?: string; }) {
  const [value, setValue] = useState(initial);
  const [editing, setEditing] = useState(false);

  return (
    <div className="inline-flex items-center gap-2">
      {editing ? (
        <input
          className="px-2 py-1 border rounded"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => { setEditing(false); if (value !== initial) onSave(value); }}
          autoFocus
          placeholder={placeholder}
        />
      ) : (
        <span onClick={() => setEditing(true)} className="cursor-text hover:bg-gray-50 px-1 rounded">
          {value || placeholder}
        </span>
      )}
    </div>
  );
}
