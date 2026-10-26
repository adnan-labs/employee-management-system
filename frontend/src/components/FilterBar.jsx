/**
 * FilterBar provides search with debounce support, department filtering,
 * and the primary Add Employee action.
 */
export default function FilterBar({
  searchInput,
  onSearchChange,
  onClearSearch,
  selectedDepartment,
  onDepartmentChange,
  departments = [],
  onClearFilters,
  onOpenAddModal,
  totalRecords = 0,
}) {
  const hasActiveFilters = Boolean(searchInput.trim() || selectedDepartment);

  return (
    <div className="filter-bar">
      <div className="filter-controls">
        <div className="search-input-group">
          <label htmlFor="employee-search" className="sr-only">
            Search employees by name or email
          </label>
          <div className="input-with-icon">
            <svg
              className="search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="employee-search"
              type="text"
              className="form-control search-input"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              autoComplete="off"
            />
            {searchInput && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={onClearSearch}
                aria-label="Clear search input"
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        <div className="department-filter-group">
          <label htmlFor="department-select" className="sr-only">
            Filter by department
          </label>
          <select
            id="department-select"
            className="form-control select-input"
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            aria-label="Filter by department"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn-text-clear"
            onClick={onClearFilters}
            aria-label="Reset all search and department filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="filter-summary-and-action">
        <span className="results-counter" aria-live="polite">
          Found <strong>{totalRecords}</strong> {totalRecords === 1 ? "match" : "matches"}
        </span>

        <button
          type="button"
          className="btn-primary"
          onClick={onOpenAddModal}
          id="btn-add-employee"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add Employee</span>
        </button>
      </div>
    </div>
  );
}
