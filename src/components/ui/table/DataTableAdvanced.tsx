import React, { useMemo, useState } from 'react';

interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface Filter<T> {
  key: string;
  label?: string;
  predicate?: (row: T, value: string) => boolean; // returns true to keep
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  defaultSortKey?: string;
  defaultSortDirection?: 'asc' | 'desc';
  pageSize?: number;
  className?: string;
  filters?: Filter<T>[];
}

export function DataTableAdvanced<T>({
  columns,
  data,
  defaultSortKey,
  defaultSortDirection = 'asc',
  pageSize = 10,
  className,
  filters,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [page, setPage] = useState(1);

  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    if (!filters || filters.length === 0) return data;
    return data.filter((row) => {
      return filters.every((f) => {
        const v = (filterValues[f.key] ?? '').trim();
        if (!v) return true;
        if (f.predicate) return f.predicate(row, v);
        // default predicate: check if any column string contains value
        return columns.some((c) => String(c.accessor(row)).toLowerCase().includes(v.toLowerCase()));
      });
    });
  }, [data, filters, filterValues, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;

    return [...filtered].sort((a, b) => {
      const va = String(col.accessor(a));
      const vb = String(col.accessor(b));
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [sorted, page, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className={className}>
      {filters && filters.length > 0 && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
          {filters.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-600">{f.label ?? f.key}</label>
              <input
                type="text"
                value={filterValues[f.key] ?? ''}
                onChange={(e) => setFilterValues((s) => ({ ...s, [f.key]: e.target.value }))}
                className="mt-1 block w-full border rounded px-2 py-1"
                placeholder={`Filter ${f.label ?? f.key}`}
              />
            </div>
          ))}
        </div>
      )}
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer' : ''}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center space-x-2">
                  <span>{col.header}</span>
                  {col.sortable && sortKey === col.key && (
                    <span className="text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pageData.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, sorted.length)} of {sorted.length}</div>
        <div className="space-x-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded">
            Prev
          </button>
          <span className="px-3 py-1">{page}/{totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTableAdvanced;
