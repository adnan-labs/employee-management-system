import { useCallback, useEffect, useState } from "react";
import "./App.css";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import EmployeeModal from "./components/EmployeeModal";
import EmployeeTable from "./components/EmployeeTable";
import FilterBar from "./components/FilterBar";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import ToastNotification from "./components/ToastNotification";
import { employeeService } from "./services/employeeService";

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    avgSalary: 0,
    totalPayroll: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [dbStatus, setDbStatus] = useState({ connected: false, database: "" });

  // Server-side query parameters state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Search input state with debounce
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal states
  const [employeeModal, setEmployeeModal] = useState({
    isOpen: false,
    employee: null,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    employee: null,
  });

  // Notification state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Debounce search input (300ms delay) and reset page to 1 on search change
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      setDebouncedSearch((prev) => {
        if (prev !== trimmed) {
          setPage(1);
        }
        return trimmed;
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle department filter change and reset page to 1
  function handleDepartmentChange(dept) {
    setSelectedDepartment(dept);
    setPage(1);
  }

  // Clear search input immediately without debounce delay
  function handleClearSearch() {
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
  }

  // Clear all filters
  function handleClearFilters() {
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedDepartment("");
    setPage(1);
  }

  // Fetch paginated data whenever query params change
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;

    employeeService
      .getAll({
        page,
        limit: pageSize,
        search: debouncedSearch,
        department: selectedDepartment,
      })
      .then((data) => {
        if (ignore) return;
        setEmployees(data.employees || []);
        if (data.pagination) setPagination(data.pagination);
        if (data.departments) setDepartments(data.departments);
        if (data.stats) setStats(data.stats);
        setFetchError("");
      })
      .catch((err) => {
        if (ignore) return;
        setFetchError(err.message || "Failed to load employees");
      })
      .finally(() => {
        if (ignore) return;
        setIsLoading(false);
        setIsRefreshing(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, pageSize, debouncedSearch, selectedDepartment, reloadTrigger]);

  // Check database connectivity on mount
  useEffect(() => {
    let ignore = false;
    employeeService
      .testDbConnection()
      .then((res) => {
        if (!ignore) {
          setDbStatus({
            connected: true,
            database: res.database || "employee_management",
          });
        }
      })
      .catch(() => {
        if (!ignore) {
          setDbStatus({ connected: false, database: "" });
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Manual refresh trigger
  function handleRefresh() {
    setIsRefreshing(true);
    setReloadTrigger((prev) => prev + 1);
  }

  // Page navigation handlers
  function handlePageChange(newPage) {
    if (newPage < 1 || (pagination.totalPages > 0 && newPage > pagination.totalPages)) {
      return;
    }
    setIsLoading(true);
    setPage(newPage);
  }

  function handlePageSizeChange(newSize) {
    setIsLoading(true);
    setPageSize(newSize);
    setPage(1);
  }

  // Save (Add or Edit) submission
  async function handleSaveEmployee(payload, existingId) {
    if (existingId) {
      await employeeService.update(existingId, payload);
      showToast(`Employee "${payload.name}" updated successfully.`, "success");
      setReloadTrigger((prev) => prev + 1);
    } else {
      await employeeService.create(payload);
      showToast(`Employee "${payload.name}" registered successfully.`, "success");
      // Reset to first page to see the newly created record
      setPage(1);
      setReloadTrigger((prev) => prev + 1);
    }
  }

  // Delete employee confirmation
  async function handleConfirmDelete(id) {
    const targetEmployee = employees.find((e) => e.id === id);
    await employeeService.delete(id);
    showToast(
      `Employee ${
        targetEmployee ? `"${targetEmployee.name}"` : `#${id}`
      } was deleted.`,
      "success"
    );

    // If deleting the last item on a page higher than 1, move back a page
    if (employees.length === 1 && page > 1) {
      setPage((prev) => prev - 1);
    } else {
      setReloadTrigger((prev) => prev + 1);
    }
  }

  function handleOpenAddModal() {
    setEmployeeModal({ isOpen: true, employee: null });
  }

  function handleOpenEditModal(emp) {
    setEmployeeModal({ isOpen: true, employee: emp });
  }

  function handleCloseEmployeeModal() {
    setEmployeeModal({ isOpen: false, employee: null });
  }

  function handleOpenDeleteModal(emp) {
    setDeleteModal({ isOpen: true, employee: emp });
  }

  function handleCloseDeleteModal() {
    setDeleteModal({ isOpen: false, employee: null });
  }

  return (
    <div className="app-layout">
      <Header
        dbStatus={dbStatus}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <main className="dashboard-content">
        <StatsCards stats={stats} employees={employees} />

        <FilterBar
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          onClearSearch={handleClearSearch}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={handleDepartmentChange}
          departments={departments}
          onClearFilters={handleClearFilters}
          onOpenAddModal={handleOpenAddModal}
          totalRecords={pagination.totalRecords}
        />

        <EmployeeTable
          employees={employees}
          isLoading={isLoading}
          error={fetchError}
          onRetry={handleRefresh}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
          onOpenAddModal={handleOpenAddModal}
          isFiltered={Boolean(debouncedSearch || selectedDepartment)}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </main>

      {employeeModal.isOpen && (
        <EmployeeModal
          key={employeeModal.employee ? `edit-${employeeModal.employee.id}` : "add-new"}
          isOpen={employeeModal.isOpen}
          onClose={handleCloseEmployeeModal}
          onSubmit={handleSaveEmployee}
          employee={employeeModal.employee}
          availableDepartments={departments}
        />
      )}

      {deleteModal.isOpen && (
        <DeleteConfirmModal
          key={deleteModal.employee ? `delete-${deleteModal.employee.id}` : "delete-none"}
          isOpen={deleteModal.isOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          employee={deleteModal.employee}
        />
      )}

      <ToastNotification toast={toast} onClose={hideToast} />
    </div>
  );
}
