/**
 * Header component displaying the application title and system status.
 * @param {{
 *   dbStatus: { connected: boolean, database?: string },
 *   onRefresh: () => void,
 *   isRefreshing: boolean
 * }} props
 */
export default function Header({ dbStatus, onRefresh, isRefreshing }) {
  return (
    <header className="dashboard-header">
      <div className="header-brand">
        <div className="brand-icon" aria-hidden="true">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div>
          <h1 className="header-title">Employee Management System</h1>
          <p className="header-subtitle">
            Manage your organization&apos;s workforce, departments, and payroll
          </p>
        </div>
      </div>

      <div className="header-actions">
        <div
          className={`db-pill ${
            dbStatus?.connected ? "db-pill-success" : "db-pill-warning"
          }`}
          title={
            dbStatus?.connected
              ? `Connected to MySQL (${dbStatus.database || "employee_management"})`
              : "Checking database connection..."
          }
        >
          <span className="status-dot" aria-hidden="true" />
          <span className="status-text">
            {dbStatus?.connected ? "Database Online" : "Checking DB"}
          </span>
        </div>

        <button
          type="button"
          className="btn-refresh"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh employee list"
          title="Refresh employee data"
        >
          <svg
            className={`refresh-icon ${isRefreshing ? "spin" : ""}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          <span className="refresh-label">Refresh</span>
        </button>
      </div>
    </header>
  );
}
