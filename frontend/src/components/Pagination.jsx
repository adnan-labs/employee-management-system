/**
 * Pagination controls component with page navigation,
 * page size selector, and informative range display.
 */
export default function Pagination({
  currentPage = 1,
  pageSize = 10,
  totalPages = 1,
  totalRecords = 0,
  hasNextPage = false,
  hasPrevPage = false,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
}) {
  const fromRecord =
    totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toRecord = Math.min(currentPage * pageSize, totalRecords);

  // Generate visible page numbers with smart sliding window
  const pageNumbers = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = startPage + maxButtons - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination-bar" role="navigation" aria-label="Pagination">
      <div className="pagination-info-group">
        <label htmlFor="page-size-select" className="page-size-label">
          Show:
        </label>
        <select
          id="page-size-select"
          className="form-control select-page-size"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          disabled={isLoading}
          aria-label="Records per page"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>

        <span className="pagination-records-text">
          Showing <strong>{fromRecord}</strong>–<strong>{toRecord}</strong> of{" "}
          <strong>{totalRecords}</strong> {totalRecords === 1 ? "record" : "records"}
        </span>
      </div>

      <div className="pagination-nav-group">
        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage || isLoading}
          aria-label="Previous page"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Previous</span>
        </button>

        <div className="pagination-pages-list" aria-label="Page numbers">
          {startPage > 1 && (
            <>
              <button
                type="button"
                className={`btn-page-number ${
                  currentPage === 1 ? "is-active" : ""
                }`}
                onClick={() => onPageChange(1)}
                disabled={isLoading}
                aria-label="Go to page 1"
              >
                1
              </button>
              {startPage > 2 && <span className="pagination-ellipsis">…</span>}
            </>
          )}

          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              className={`btn-page-number ${
                currentPage === page ? "is-active" : ""
              }`}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              aria-current={currentPage === page ? "page" : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="pagination-ellipsis">…</span>
              )}
              <button
                type="button"
                className={`btn-page-number ${
                  currentPage === totalPages ? "is-active" : ""
                }`}
                onClick={() => onPageChange(totalPages)}
                disabled={isLoading}
                aria-label={`Go to page ${totalPages}`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage || isLoading}
          aria-label="Next page"
        >
          <span>Next</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
