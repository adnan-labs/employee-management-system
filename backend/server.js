require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// Global Middleware
app.use(cors());
app.use(express.json());

// API health/welcome endpoint
app.get("/", (req, res) => {
  res.send("Employee Management API is running!");
});

// MySQL Database connectivity test endpoint
app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DATABASE() AS databaseName");

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

// Mount Employee Routes under /api/employees
app.use("/api/employees", employeeRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
