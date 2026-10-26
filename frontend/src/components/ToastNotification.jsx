import { useEffect } from "react";

export default function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`toast-container ${isSuccess ? "toast-success" : "toast-error"}`}
      role="status"
      aria-live="polite"
    >
      <div className="toast-icon" aria-hidden="true">
        {isSuccess ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </div>

      <div className="toast-content">
        <strong className="toast-title">
          {isSuccess ? "Success" : "Notice"}
        </strong>
        <p className="toast-message">{toast.message}</p>
      </div>

      <button
        type="button"
        className="toast-close-btn"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        &times;
      </button>
    </div>
  );
}
