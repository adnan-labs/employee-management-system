/**
 * StatsCards displays high-level workforce metrics:
 * Total employees, active departments, and payroll overview.
 */
export default function StatsCards({ stats, employees = [] }) {
  const totalEmployees =
    stats?.totalEmployees !== undefined ? stats.totalEmployees : employees.length;

  const departmentCount =
    stats?.totalDepartments !== undefined
      ? stats.totalDepartments
      : new Set(
          employees
            .map((e) => (e.department ? e.department.trim() : ""))
            .filter((dept) => dept.length > 0)
        ).size;

  const avgSalary =
    stats?.avgSalary !== undefined
      ? stats.avgSalary
      : (() => {
          const validSalaries = employees
            .map((e) =>
              e.salary !== null && e.salary !== undefined ? Number(e.salary) : NaN
            )
            .filter((s) => !isNaN(s) && s >= 0);
          return validSalaries.length > 0
            ? Math.round(
                validSalaries.reduce((sum, curr) => sum + curr, 0) /
                  validSalaries.length
              )
            : 0;
        })();

  const totalPayroll =
    stats?.totalPayroll !== undefined
      ? stats.totalPayroll
      : employees
          .map((e) =>
            e.salary !== null && e.salary !== undefined ? Number(e.salary) : 0
          )
          .filter((s) => !isNaN(s) && s >= 0)
          .reduce((sum, curr) => sum + curr, 0);

  return (
    <section className="stats-grid" aria-label="Workforce Metrics Summary">
      <div className="stat-card">
        <div className="stat-icon stat-icon-blue" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div className="stat-content">
          <span className="stat-label">Total Employees</span>
          <span className="stat-value">{totalEmployees}</span>
          <span className="stat-subtext">Registered workforce</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon stat-icon-indigo" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>
        <div className="stat-content">
          <span className="stat-label">Departments</span>
          <span className="stat-value">{departmentCount}</span>
          <span className="stat-subtext">Active functional areas</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon stat-icon-emerald" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div className="stat-content">
          <span className="stat-label">Average Salary</span>
          <span className="stat-value">
            {avgSalary > 0 ? `₹${avgSalary.toLocaleString("en-IN")}` : "—"}
          </span>
          <span className="stat-subtext">
            Total: ₹{totalPayroll.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </section>
  );
}
