/**
 * Service module for Employee Management API.
 * Centralizes all network requests, error handling, and response processing.
 */

const API_BASE_URL = "http://localhost:5001/api";

/**
 * Helper to handle HTTP responses and format descriptive errors.
 * @param {Response} response
 * @returns {Promise<any>}
 */
async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage =
      (data && data.message) ||
      `Request failed with status ${response.status}: ${response.statusText}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const employeeService = {
  /**
   * Fetch employees with server-side pagination, search, and department filtering.
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {number} [params.limit=10]
   * @param {string} [params.search=""]
   * @param {string} [params.department=""]
   * @returns {Promise<{
   *   employees: Array,
   *   pagination: {
   *     totalRecords: number,
   *     currentPage: number,
   *     pageSize: number,
   *     totalPages: number,
   *     hasNextPage: boolean,
   *     hasPrevPage: boolean
   *   },
   *   departments: Array<string>,
   *   stats: {
   *     totalEmployees: number,
   *     totalDepartments: number,
   *     avgSalary: number,
   *     totalPayroll: number
   *   }
   * }>}
   */
  async getAll({ page = 1, limit = 10, search = "", department = "" } = {}) {
    const query = new URLSearchParams();

    if (page !== undefined && page !== null && page !== "") {
      query.set("page", String(page));
    }
    if (limit !== undefined && limit !== null && limit !== "") {
      query.set("limit", String(limit));
    }
    if (typeof search === "string" && search.trim() !== "") {
      query.set("search", search.trim());
    }
    if (typeof department === "string" && department.trim() !== "") {
      query.set("department", department.trim());
    }

    const queryString = query.toString();
    const url = `${API_BASE_URL}/employees${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    return handleResponse(response);
  },

  /**
   * Create a new employee record.
   * @param {Object} employeeData - { name, email, department, salary }
   * @returns {Promise<{ message: string, id: number }>}
   */
  async create(employeeData) {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(employeeData),
    });
    return handleResponse(response);
  },

  /**
   * Update an existing employee record by ID.
   * @param {number|string} id - Employee ID
   * @param {Object} employeeData - { name, email, department, salary }
   * @returns {Promise<{ message: string }>}
   */
  async update(id, employeeData) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(employeeData),
    });
    return handleResponse(response);
  },

  /**
   * Delete an employee record by ID.
   * @param {number|string} id - Employee ID
   * @returns {Promise<{ message: string }>}
   */
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });
    return handleResponse(response);
  },

  /**
   * Test the backend MySQL database connectivity.
   * @returns {Promise<{ message: string, database: string }>}
   */
  async testDbConnection() {
    const response = await fetch(`${API_BASE_URL}/db-test`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    return handleResponse(response);
  },
};
