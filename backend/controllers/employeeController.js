const employeeModel = require("../models/employeeModel");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Employee Controller
 * Handles incoming HTTP requests, validates parameters/payloads,
 * invokes Model methods for database operations, and returns HTTP responses.
 */
const employeeController = {
  /**
   * GET /api/employees
   * Retrieves paginated employees with optional search and department filter.
   */
  async getEmployees(req, res) {
    try {
      const { page, limit, search, department } = req.query;

      // Validate page parameter
      let pageNum = 1;
      if (page !== undefined && page !== "") {
        const parsedPage = Number(page);
        if (!Number.isInteger(parsedPage) || parsedPage < 1) {
          return res.status(400).json({
            message: "Page must be a positive integer",
          });
        }
        pageNum = parsedPage;
      }

      // Validate limit parameter (maximum: 100)
      let limitNum = 10;
      if (limit !== undefined && limit !== "") {
        const parsedLimit = Number(limit);
        if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
          return res.status(400).json({
            message: "Limit must be a positive integer",
          });
        }
        if (parsedLimit > 100) {
          return res.status(400).json({
            message: "Limit cannot exceed 100",
          });
        }
        limitNum = parsedLimit;
      }

      const result = await employeeModel.findAll({
        pageNum,
        limitNum,
        search,
        department,
      });

      return res.json(result);
    } catch (error) {
      console.error("Failed to fetch employees:", error.message);
      return res.status(500).json({
        message: "Failed to fetch employees",
      });
    }
  },

  /**
   * POST /api/employees
   * Creates a new employee record after validating the request body.
   */
  async createEmployee(req, res) {
    try {
      const { name, email, department, salary } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          message: "Name and email are required",
        });
      }

      const trimmedName = String(name).trim();
      const trimmedEmail = String(email).trim().toLowerCase();

      if (!trimmedName) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({
          message: "Please provide a valid email address",
        });
      }

      let parsedSalary = null;
      if (salary !== undefined && salary !== null && salary !== "") {
        parsedSalary = Number(salary);
        if (isNaN(parsedSalary) || parsedSalary < 0) {
          return res.status(400).json({
            message: "Salary must be a non-negative number",
          });
        }
      }

      const result = await employeeModel.create({
        name: trimmedName,
        email: trimmedEmail,
        department: department ? String(department).trim() : null,
        salary: parsedSalary,
      });

      return res.status(201).json({
        message: "Employee created successfully",
        id: result.insertId,
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "An employee with this email already exists",
        });
      }

      console.error("Failed to create employee:", error.message);
      return res.status(500).json({
        message: "Failed to create employee",
      });
    }
  },

  /**
   * PUT /api/employees/:id
   * Updates an existing employee by ID after validating inputs.
   */
  async updateEmployee(req, res) {
    try {
      const id = Number(req.params.id);
      const { name, email, department, salary } = req.body;

      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
          message: "Invalid employee ID",
        });
      }

      if (!name || !email) {
        return res.status(400).json({
          message: "Name and email are required",
        });
      }

      const trimmedName = String(name).trim();
      const trimmedEmail = String(email).trim().toLowerCase();

      if (!trimmedName) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({
          message: "Please provide a valid email address",
        });
      }

      let parsedSalary = null;
      if (salary !== undefined && salary !== null && salary !== "") {
        parsedSalary = Number(salary);
        if (isNaN(parsedSalary) || parsedSalary < 0) {
          return res.status(400).json({
            message: "Salary must be a non-negative number",
          });
        }
      }

      const result = await employeeModel.update(id, {
        name: trimmedName,
        email: trimmedEmail,
        department: department ? String(department).trim() : null,
        salary: parsedSalary,
      });

      if (result.affectedRows === 0) {
        const existing = await employeeModel.findById(id);
        if (!existing) {
          return res.status(404).json({
            message: "Employee not found",
          });
        }
      }

      return res.json({
        message: "Employee updated successfully",
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "That email is already in use",
        });
      }

      console.error("Failed to update employee:", error.message);
      return res.status(500).json({
        message: "Failed to update employee",
      });
    }
  },

  /**
   * DELETE /api/employees/:id
   * Deletes an employee record by ID.
   */
  async deleteEmployee(req, res) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
          message: "Invalid employee ID",
        });
      }

      const result = await employeeModel.delete(id);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }

      return res.status(200).json({
        message: "Employee deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete employee:", error.message);
      return res.status(500).json({
        message: "Failed to delete employee",
      });
    }
  },
};

module.exports = employeeController;
