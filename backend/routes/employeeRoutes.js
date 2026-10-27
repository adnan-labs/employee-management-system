const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");

/**
 * Employee API Routes
 * Maps HTTP methods and endpoint paths to controller actions.
 * Mounted at `/api/employees` in server.js.
 */

// GET /api/employees - Fetch paginated employees with optional search & filtering
router.get("/", employeeController.getEmployees);

// POST /api/employees - Create a new employee
router.post("/", employeeController.createEmployee);

// PUT /api/employees/:id - Update an employee by ID
router.put("/:id", employeeController.updateEmployee);

// DELETE /api/employees/:id - Delete an employee by ID
router.delete("/:id", employeeController.deleteEmployee);

module.exports = router;
