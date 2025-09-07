import React, { useEffect, useMemo, useRef, useState } from 'react';

interface AutocompleteProps<T> {
  items: T[];
  getItemLabel: (item: T) => string;
  onSelect: (item: T) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  noResultsText?: string;
}

export function Autocomplete<T>({
  items,
  getItemLabel,
  onSelect,
  placeholder = 'Start typing...',
  className,
  inputClassName,
  noResultsText = 'No results',
}: AutocompleteProps<T>) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => getItemLabel(it).toLowerCase().includes(q));
  }, [items, query, getItemLabel]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [filtered]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightIndex]) {
        onSelect(filtered[highlightIndex]);
        setIsOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={className} role="combobox" aria-haspopup="listbox" aria-owns="autocomplete-list" aria-expanded={isOpen}>
      <input
        ref={inputRef}
        type="text"
        role="searchbox"
        aria-autocomplete="list"
        aria-controls="autocomplete-list"
        aria-activedescendant={isOpen && filtered[highlightIndex] ? `autocomplete-item-${highlightIndex}` : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName ?? 'w-full border px-3 py-2 rounded'}
      />

      {isOpen && (
        <ul id="autocomplete-list" role="listbox" className="mt-1 max-h-56 overflow-auto bg-white border rounded shadow-sm">
          {filtered.length === 0 ? (
            <li className="p-2 text-sm text-gray-500" role="option">{noResultsText}</li>
          ) : (
            filtered.map((it, idx) => (
              <li
                id={`autocomplete-item-${idx}`}
                key={idx}
                role="option"
                aria-selected={idx === highlightIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(it);
                  setIsOpen(false);
                  setQuery('');
                }}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${idx === highlightIndex ? 'bg-gray-100' : ''}`}
              >
                {getItemLabel(it)}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default Autocomplete;
