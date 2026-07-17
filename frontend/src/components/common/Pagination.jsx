import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Pagination({ page, totalPages, totalElements, onPageChange }) {
  if (totalElements === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-muted">
      <span>
        Page {page + 1} of {Math.max(totalPages, 1)} &middot; {totalElements} result{totalElements > 1 ? 's' : ''}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1 rounded-lg border border-border-default px-3 py-2 text-ink transition hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FaChevronLeft className="text-xs" /> Prev
        </button>
        <button
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-1 rounded-lg border border-border-default px-3 py-2 text-ink transition hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <FaChevronRight className="text-xs" />
        </button>
      </div>
    </div>
  );
}
