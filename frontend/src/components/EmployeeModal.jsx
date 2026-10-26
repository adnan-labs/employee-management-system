import { useEffect, useRef, useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COMMON_DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Human Resources",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "IT Support",
];

export default function EmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  employee = null, // null = Add mode, Object = Edit mode
  availableDepartments = [],
}) {
  const isEditMode = Boolean(employee && employee.id);

  const [formData, setFormData] = useState(() => ({
    name: employee?.name || "",
    email: employee?.email || "",
    department: employee?.department || "",
    salary:
      employee?.salary !== null && employee?.salary !== undefined
        ? String(employee.salary)
        : "",
  }));

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef(null);

  // Combine unique department choices for autocomplete
  const departmentOptions = Array.from(
    new Set([...availableDepartments, ...COMMON_DEPARTMENTS])
  ).filter(Boolean);

  // Focus the first input on initial mount
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Handle ESC key press to close dialog
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) {
      setServerError("");
    }
  }

  function validate() {
    const newErrors = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = "Full name is required";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Full name must be at least 2 characters";
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Email address is required";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address (e.g., name@company.com)";
    }

    if (formData.salary !== "") {
      const numSalary = Number(formData.salary);
      if (isNaN(numSalary)) {
        newErrors.salary = "Salary must be a numeric value";
      } else if (numSalary < 0) {
        newErrors.salary = "Salary must be a non-negative number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError("");

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      department: formData.department.trim() || null,
      salary: formData.salary !== "" ? Number(formData.salary) : null,
    };

    try {
      await onSubmit(payload, employee?.id);
      onClose();
    } catch (err) {
      setServerError(
        err.message || "An unexpected error occurred while saving. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <h2 id="modal-title" className="modal-title">
              {isEditMode ? "Edit Employee" : "Add New Employee"}
            </h2>
            <p className="modal-subtitle">
              {isEditMode
                ? "Update existing employee details and payroll information"
                : "Enter details to register a new employee record"}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            title="Close"
          >
            &times;
          </button>
        </div>

        {serverError && (
          <div className="modal-error-alert" role="alert">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="modal-form">
          <div className="form-group">
            <label htmlFor="field-name" className="form-label">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              id="field-name"
              ref={nameInputRef}
              type="text"
              name="name"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              placeholder="e.g. Aditi Sharma"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="name"
              required
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="field-email" className="form-label">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              id="field-email"
              type="email"
              name="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              placeholder="e.g. aditi@company.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              autoComplete="email"
              required
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="field-department" className="form-label">
                Department
              </label>
              <input
                id="field-department"
                list="department-suggestions"
                type="text"
                name="department"
                className="form-control"
                placeholder="e.g. Engineering"
                value={formData.department}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <datalist id="department-suggestions">
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept} />
                ))}
              </datalist>
              <span className="field-hint">
                Choose from suggested or type a new department
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="field-salary" className="form-label">
                Monthly Salary (₹)
              </label>
              <input
                id="field-salary"
                type="number"
                name="salary"
                min="0"
                step="500"
                className={`form-control ${errors.salary ? "is-invalid" : ""}`}
                placeholder="e.g. 50000"
                value={formData.salary}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.salary ? (
                <span className="field-error">{errors.salary}</span>
              ) : (
                <span className="field-hint">Enter a non-negative amount</span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  <span>Saving...</span>
                </>
              ) : isEditMode ? (
                "Update Employee"
              ) : (
                "Save Employee"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
