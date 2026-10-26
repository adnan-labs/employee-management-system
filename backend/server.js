
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Test the API
app.get("/", (req, res) => {
  res.send("Employee Management API is running!");
});

// Test the MySQL connection
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DATABASE() AS databaseName"
    );

    res.json({
      message: "MySQL connection successful",
      database: rows[0].databaseName,
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

// Get employees with server-side pagination, search, and department filtering
app.get("/api/employees", async (req, res) => {
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

    // Validate limit parameter (sensible maximum: 100)
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

    // Build parameterized WHERE clauses
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

    // 1. Get total count matching current filters
    const countSQL = `SELECT COUNT(*) AS total FROM employees ${whereSQL}`;
    const [countRows] = await pool.query(countSQL, queryParams);
    const totalRecords = Number(countRows[0].total || 0);

    // Calculate total pages and offset
    const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / limitNum) : 1;
    const offset = (pageNum - 1) * limitNum;

    // 2. Fetch paginated records using parameterized LIMIT and OFFSET
    const selectSQL = `SELECT * FROM employees ${whereSQL} ORDER BY id DESC LIMIT ? OFFSET ?`;
    const [employees] = await pool.query(selectSQL, [
      ...queryParams,
      limitNum,
      offset,
    ]);

    // 3. Fetch global distinct departments for filter dropdown
    const [deptRows] = await pool.query(
      "SELECT DISTINCT department FROM employees WHERE department IS NOT NULL AND TRIM(department) != '' ORDER BY department ASC"
    );
    const allDepartments = deptRows
      .map((row) => row.department.trim())
      .filter(Boolean);

    // 4. Fetch global organizational stats
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

    res.json({
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
    });
  } catch (error) {
    console.error("Failed to fetch employees:", error.message);
    res.status(500).json({
      message: "Failed to fetch employees",
    });
  }
});
app.post("/api/employees", async (req, res) => {
  try {
    const { name, email, department, salary } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const [result] = await pool.execute(
      `INSERT INTO employees (name, email, department, salary)
       VALUES (?, ?, ?, ?)`,
      [trimmedName, trimmedEmail, department ? String(department).trim() : null, parsedSalary]
    );

    res.status(201).json({
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
    res.status(500).json({
      message: "Failed to create employee",
    });
  }
});


app.put("/api/employees/:id", async (req, res) => {
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const [result] = await pool.execute(
      `UPDATE employees
       SET name = ?, email = ?, department = ?, salary = ?
       WHERE id = ?`,
      [trimmedName, trimmedEmail, department ? String(department).trim() : null, parsedSalary, id]
    );

    if (result.affectedRows === 0) {
      const [rows] = await pool.execute(
        "SELECT id FROM employees WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message: "Employee not found",
        });
      }
    }

    res.json({
      message: "Employee updated successfully",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "That email is already in use",
      });
    }

    console.error("Failed to update employee:", error.message);
    res.status(500).json({
      message: "Failed to update employee",
    });
  }
});

app.delete("/api/employees/:id", async (req, res) => {
  try {
    // Step 1: Get the employee ID from the URL
    const id = Number(req.params.id);

    // Step 2: Validate the ID
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid employee ID",
      });
    }

    // Step 3: Delete the employee from MySQL
    const [result] = await pool.execute(
      "DELETE FROM employees WHERE id = ?",
      [id]
    );

    // Step 4: Check whether the employee existed
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Step 5: Send the success response
    res.status(200).json({
      message: "Employee deleted successfully",
    });

  } catch (error) {
    console.error("Failed to delete employee:", error.message);

    res.status(500).json({
      message: "Failed to delete employee",
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

