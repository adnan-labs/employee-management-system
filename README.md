# Employee Management System

A full-stack Employee Management System built with React, Node.js, Express, and MySQL. The application provides an interactive dashboard for managing employee records through CRUD operations, with a modular MVC architecture on the backend.

## Features

- **Dashboard:** View employee statistics, including total employees, departments, average salary, and payroll.
- **Employee Management:** Create, view, update, and delete employee records.
- **Search and Filtering:** Search employees by name or email and filter by department.
- **Form Validation:** Validate required fields, email addresses, and salary values.
- **Duplicate Email Handling:** Prevent duplicate employee email addresses.
- **Confirmation Dialogs:** Confirm employee deletion before removing records.
- **Notifications:** Display success and error messages.
- **Responsive UI:** Dashboard components adapt to different screen sizes.
- **MVC Architecture:** Separate backend models, controllers, and routes.
- **MySQL Integration:** Store employee records in a relational database.

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js
- MySQL2
- dotenv
- CORS

### Database
- MySQL 8

### Development Tools
- Git and GitHub
- npm
- ESLint
- Visual Studio Code

## Architecture

The backend follows the Model–View–Controller (MVC) pattern, with a separate React frontend.

```text
employee-management-system/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── employeeController.js
│   ├── models/
│   │   └── employeeModel.js
│   ├── routes/
│   │   └── employeeRoutes.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── .gitignore
```

### Backend MVC Responsibilities

- **Model:** Executes database queries and manages employee data.
- **Controller:** Handles requests, validation, business logic, and HTTP responses.
- **Routes:** Maps API endpoints to controller functions.
- **Configuration:** Manages the MySQL connection pool.
- **Server:** Configures Express middleware and mounts API routes.

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MySQL Server 8
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/adnan-labs/employee-management-system.git
cd employee-management-system
```

### 2. Set up the MySQL database

Open MySQL Workbench or your MySQL client and run:

```sql
CREATE DATABASE employee_management;

USE employee_management;

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    department VARCHAR(100),
    salary DECIMAL(10, 2)
);
```

### 3. Configure the backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with your local database configuration:

```env
PORT=5001
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=
DB_PORT=3306
```

Replace `your_mysql_password` with your own MySQL password. Never commit your actual `.env` file to GitHub.

Start the backend:

```bash
node server.js
```

The API should be available at:

`http://localhost:5001`

### 4. Start the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

## API Endpoints

Base URL: `http://localhost:5001`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees` | Retrieve employees |
| POST | `/api/employees` | Create an employee |
| PUT | `/api/employees/:id` | Update an employee |
| DELETE | `/api/employees/:id` | Delete an employee |
| GET | `/api/db-test` | Check database connectivity |

### Example Employee Object

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "department": "IT",
  "salary": 35000
}
```

## Validation and Error Handling

The backend supports validation for required employee fields, email format, non-negative salary values, and valid employee IDs.

Common HTTP status codes include:

- `200 OK` — Request completed successfully.
- `201 Created` — Employee created successfully.
- `400 Bad Request` — Invalid input.
- `404 Not Found` — Employee does not exist.
- `409 Conflict` — Duplicate email address.
- `500 Internal Server Error` — Unexpected server error.

## Testing

Run the frontend lint check:

```bash
cd frontend
npm run lint
```

Create a production build:

```bash
npm run build
```

You can also test API endpoints using PowerShell, Postman, or another HTTP client.

## Future Enhancements

- Authentication and role-based access control
- Server-side pagination and filtering
- CSV export and reporting
- Automated API tests
- Production deployment

## Learning Outcomes

This project demonstrates practical experience with:

- Full-stack application development
- REST API design
- CRUD operations
- MVC architecture
- Relational database integration
- React hooks and reusable components
- Input validation and error handling
- Git version control

## Author

**Adnan Shaikh**

GitHub: [adnan-labs](https://github.com/adnan-labs)

Repository: [Employee Management System](https://github.com/adnan-labs/employee-management-system)
