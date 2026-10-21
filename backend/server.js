
const express = require("express");

const app = express();
const PORT = 5001;

// Middleware: allow Express to read JSON request bodies
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Employee Management API is running!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
