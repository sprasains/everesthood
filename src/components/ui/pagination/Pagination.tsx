import React from 'react';

interface PaginationProps {
  total: number;
  pageSize: number;
  currentPage: number;
  onChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  total,
  pageSize,
  currentPage,
  onChange,
  siblingCount = 1,
  className,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const range = () => {
    const pages: (number | '...')[] = [];
    const left = Math.max(1, currentPage - siblingCount);
    const right = Math.min(totalPages, currentPage + siblingCount);

    if (left > 1) pages.push(1);
    if (left > 2) pages.push('...');

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < totalPages - 1) pages.push('...');
    if (right < totalPages) pages.push(totalPages);

    return pages;
  };

  const pages = range();

  return (
    <nav className={`flex items-center space-x-2 ${className ?? ''}`} aria-label="Pagination">
      <button onClick={() => onChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded border">
        Prev
      </button>

      {pages.map((p, idx) => (
        <button
          key={idx}
          onClick={() => typeof p === 'number' && onChange(p)}
          disabled={p === '...'}
          className={`px-3 py-1 rounded ${p === currentPage ? 'bg-blue-600 text-white' : 'border'}`}
        >
          {p}
        </button>
      ))}

      <button onClick={() => onChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded border">
        Next
      </button>
    </nav>
  );
};

export default Pagination;
