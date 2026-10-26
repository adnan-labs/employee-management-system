import { useEffect, useState } from "react";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  employee,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleting, onClose]);

  if (!isOpen || !employee) return null;

  async function handleDelete() {
    setIsDeleting(true);
    setError("");

    try {
      await onConfirm(employee.id);
      onClose();
    } catch (err) {
      setError(
        err.message || "Failed to delete employee. Please try again."
      );
      setIsDeleting(false);
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget && !isDeleting) {
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
        className="modal-container delete-dialog-container"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
      >
        <div className="delete-dialog-icon" aria-hidden="true">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <div className="delete-dialog-body">
          <h2 id="delete-dialog-title" className="delete-dialog-title">
            Confirm Employee Deletion
          </h2>
          <p id="delete-dialog-desc" className="delete-dialog-desc">
            Are you sure you want to delete{" "}
            <strong>{employee.name}</strong> (ID: #{employee.id}
            {employee.department ? `, ${employee.department}` : ""})?
          </p>
          <p className="delete-warning-text">
            This action is permanent and cannot be undone. All database records associated with this employee will be deleted.
          </p>

          {error && (
            <div className="modal-error-alert" role="alert">
              <svg
                width="16"
                height="16"
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
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="modal-footer delete-dialog-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                <span>Deleting...</span>
              </>
            ) : (
              "Yes, Delete Record"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
