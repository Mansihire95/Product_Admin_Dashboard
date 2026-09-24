import './Pagination.css';

/**
 * Manual pagination component.
 * Shows: Previous | 1 2 3 ... | Next  and  "Showing X–Y of Z"
 */
const Pagination = ({ page, pageSize, total, onPageChange, onPageSizeChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  // Build page number buttons with ellipsis logic
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    // Always show first page
    pages.push(1);

    if (page > 3) pages.push('...');

    // Show pages around current
    const rangeStart = Math.max(2, page - 1);
    const rangeEnd = Math.min(totalPages - 1, page + 1);
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) pages.push('...');

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  if (total === 0) return null;

  return (
    <div className="pagination-wrapper">
      <div className="pagination-info">
        Showing {start}–{end} of {total}
      </div>

      <div className="pagination-controls">
        <button
          className="page-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          ← Prev
        </button>

        {getPageNumbers().map((num, idx) =>
          num === '...' ? (
            <span key={`ellipsis-${idx}`} className="page-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={num}
              className={`page-btn ${num === page ? 'active' : ''}`}
              onClick={() => onPageChange(num)}
            >
              {num}
            </button>
          )
        )}

        <button
          className="page-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next →
        </button>
      </div>

      <div className="page-size-selector">
        <label htmlFor="pageSize">Per page:</label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
};

export default Pagination;
