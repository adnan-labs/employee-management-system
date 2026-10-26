import Pagination from "./Pagination";

/**
 * Formats a numeric value into INR currency representation.
 * @param {number|string} amount
 * @returns {string}
 */
function formatSalary(amount) {
  if (amount === null || amount === undefined || amount === "") {
    return "—";
  }
  const numeric = Number(amount);
  if (isNaN(numeric)) {
    return "—";
  }
  return `₹${numeric.toLocaleString("en-IN")}`;
}

/**
 * Returns a stable badge CSS class based on department name.
 * @param {string} department
 * @returns {string}
 */
function getDepartmentBadgeClass(department) {
  if (!department) return "badge-default";
  const normalized = department.trim().toLowerCase();
  if (normalized.includes("it") || normalized.includes("tech") || normalized.includes("eng")) {
    return "badge-blue";
  }
  if (normalized.includes("hr") || normalized.includes("people")) {
    return "badge-purple";
  }
  if (normalized.includes("fin") || normalized.includes("acc")) {
    return "badge-emerald";
  }
  if (normalized.includes("mark") || normalized.includes("sales")) {
    return "badge-amber";
  }
  if (normalized.includes("op")) {
    return "badge-cyan";
  }
  return "badge-slate";
}

export default function EmployeeTable({
  employees,
  isLoading,
  error,
  onRetry,
  onEdit,
  onDelete,
  onOpenAddModal,
  isFiltered,
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  if (isLoading) {
    return (
      <div className="table-card table-loading-state">
        <div className="spinner" aria-hidden="true" />
        <p className="loading-message">Fetching employee records from server...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-card error-card" role="alert">
        <div className="error-icon" aria-hidden="true">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="error-content">
          <h3>Failed to load employees</h3>
          <p>{error}</p>
          <button type="button" className="btn-secondary" onClick={onRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    // Check if empty because user requested out-of-range page
    const isOutOfRange =
      pagination && pagination.totalRecords > 0 && pagination.currentPage > pagination.totalPages;

    return (
      <div className="table-card empty-state-card">
        <div className="empty-state-icon" aria-hidden="true">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="17" y1="8" x2="23" y2="14" />
            <line x1="23" y1="8" x2="17" y2="14" />
          </svg>
        </div>
        <h3>
          {isOutOfRange
            ? "Page out of range"
            : isFiltered
            ? "No matching employees found"
            : "No employees yet"}
        </h3>
        <p>
          {isOutOfRange
            ? `There are no records on page ${pagination.currentPage}. Total pages available: ${pagination.totalPages}.`
            : isFiltered
            ? "Try adjusting your search criteria or clear the department filter."
            : "Get started by adding your first employee to the management system."}
        </p>

        {isOutOfRange ? (
          <button
            type="button"
            className="btn-primary"
            onClick={() => onPageChange(1)}
          >
            Go to First Page
          </button>
        ) : !isFiltered ? (
          <button
            type="button"
            className="btn-primary"
            onClick={onOpenAddModal}
          >
            Add First Employee
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-responsive" tabIndex="0" role="region" aria-label="Employees table">
        <table className="employee-table">
          <thead>
            <tr>
              <th scope="col" className="col-id">ID</th>
              <th scope="col" className="col-name">Name</th>
              <th scope="col" className="col-email">Email</th>
              <th scope="col" className="col-dept">Department</th>
              <th scope="col" className="col-salary">Salary</th>
              <th scope="col" className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="employee-row">
                <td className="cell-id">
                  <span className="id-badge">#{emp.id}</span>
                </td>
                <td className="cell-name">
                  <div className="name-wrapper">
                    <span className="employee-avatar" aria-hidden="true">
                      {emp.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="employee-full-name">{emp.name}</span>
                  </div>
                </td>
                <td className="cell-email">
                  <a
                    href={`mailto:${emp.email}`}
                    className="email-link"
                    title={`Send email to ${emp.email}`}
                  >
                    {emp.email}
                  </a>
                </td>
                <td className="cell-dept">
                  {emp.department ? (
                    <span
                      className={`department-badge ${getDepartmentBadgeClass(
                        emp.department
                      )}`}
                    >
                      {emp.department}
                    </span>
                  ) : (
                    <span className="empty-dash">—</span>
                  )}
                </td>
                <td className="cell-salary">
                  <span className="salary-text">{formatSalary(emp.salary)}</span>
                </td>
                <td className="cell-actions">
                  <div className="action-buttons-group">
                    <button
                      type="button"
                      className="btn-action btn-edit"
                      onClick={() => onEdit(emp)}
                      aria-label={`Edit details for ${emp.name}`}
                      title={`Edit ${emp.name}`}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      className="btn-action btn-delete"
                      onClick={() => onDelete(emp)}
                      aria-label={`Delete record for ${emp.name}`}
                      title={`Delete ${emp.name}`}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          pageSize={pagination.pageSize}
          totalPages={pagination.totalPages}
          totalRecords={pagination.totalRecords}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          isLoading={isLoading}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
