const pool = require("../config/db");

/**
 * Employee Model
 * Handles all database operations (SQL queries and executions) for employees.
 * This layer does NOT interact with HTTP request (req) or response (res) objects.
 */
const employeeModel = {
  /**
   * Fetch employees with server-side pagination, search, and department filtering.
   * Also returns global distinct departments and overall company statistics.
   *
   * @param {Object} options
   * @param {number} options.pageNum - Current page number (1-based)
   * @param {number} options.limitNum - Records per page
   * @param {string} [options.search] - Search term for name or email
   * @param {string} [options.department] - Department filter
   * @returns {Promise<Object>} Aggregated employee data, pagination metadata, departments, and stats
   */
  async findAll({ pageNum = 1, limitNum = 10, search, department } = {}) {
    const whereClauses = [];
    const queryParams = [];

    if (typeof search === "string" && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      whereClauses.push("(name LIKE ? OR email LIKE ?)");
      queryParams.push(searchPattern, searchPattern);
    }

    if (typeof department === "string" && department.trim() !== "") {
      whereClauses.push("department = ?");
      queryParams.push(department.trim());
    }

    const whereSQL =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // 1. Get total record count matching filters
    const countSQL = `SELECT COUNT(*) AS total FROM employees ${whereSQL}`;
    const [countRows] = await pool.query(countSQL, queryParams);
    const totalRecords = Number(countRows[0].total || 0);

    // Calculate total pages and offset
    const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / limitNum) : 1;
    const offset = (pageNum - 1) * limitNum;

    // 2. Fetch paginated records ordered by newest first
    const selectSQL = `SELECT * FROM employees ${whereSQL} ORDER BY id DESC LIMIT ? OFFSET ?`;
    const [employees] = await pool.query(selectSQL, [
      ...queryParams,
      limitNum,
      offset,
    ]);

    // 3. Fetch global distinct departments for the filter dropdown
    const [deptRows] = await pool.query(
      "SELECT DISTINCT department FROM employees WHERE department IS NOT NULL AND TRIM(department) != '' ORDER BY department ASC"
    );
    const allDepartments = deptRows
      .map((row) => row.department.trim())
      .filter(Boolean);

    // 4. Fetch organizational stats
    const [statsRows] = await pool.query(
      `SELECT 
        COUNT(*) AS totalEmployees,
        COUNT(DISTINCT CASE WHEN department IS NOT NULL AND TRIM(department) != '' THEN department END) AS totalDepartments,
        COALESCE(ROUND(AVG(CASE WHEN salary >= 0 THEN salary END)), 0) AS avgSalary,
        COALESCE(SUM(CASE WHEN salary >= 0 THEN salary END), 0) AS totalPayroll
       FROM employees`
    );
    const globalStats = {
      totalEmployees: Number(statsRows[0].totalEmployees || 0),
      totalDepartments: Number(statsRows[0].totalDepartments || 0),
      avgSalary: Number(statsRows[0].avgSalary || 0),
      totalPayroll: Number(statsRows[0].totalPayroll || 0),
    };

    return {
      employees,
      pagination: {
        totalRecords,
        currentPage: pageNum,
        pageSize: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      departments: allDepartments,
      stats: globalStats,
    };
  },

  /**
   * Find a single employee by their ID.
   *
   * @param {number} id - Employee ID
   * @returns {Promise<Object|null>} The employee record or null if not found
   */
  async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM employees WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  },

  /**
   * Insert a new employee record into the database.
   *
   * @param {Object} employeeData
   * @param {string} employeeData.name
   * @param {string} employeeData.email
   * @param {string|null} employeeData.department
   * @param {number|null} employeeData.salary
   * @returns {Promise<{ insertId: number }>}
   */
  async create({ name, email, department, salary }) {
    const [result] = await pool.execute(
      `INSERT INTO employees (name, email, department, salary)
       VALUES (?, ?, ?, ?)`,
      [name, email, department, salary]
    );
    return { insertId: result.insertId };
  },

  /**
   * Update an existing employee record.
   *
   * @param {number} id - Employee ID
   * @param {Object} employeeData
   * @param {string} employeeData.name
   * @param {string} employeeData.email
   * @param {string|null} employeeData.department
   * @param {number|null} employeeData.salary
   * @returns {Promise<Object>} MySQL result header containing affectedRows
   */
  async update(id, { name, email, department, salary }) {
    const [result] = await pool.execute(
      `UPDATE employees
       SET name = ?, email = ?, department = ?, salary = ?
       WHERE id = ?`,
      [name, email, department, salary, id]
    );
    return result;
  },

  /**
   * Delete an employee record by ID.
   *
   * @param {number} id - Employee ID
   * @returns {Promise<Object>} MySQL result header containing affectedRows
   */
  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM employees WHERE id = ?",
      [id]
    );
    return result;
  },
};

module.exports = employeeModel;
