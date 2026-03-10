import React from 'react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isLoading = false,
  type = 'primary', // primary, danger, success
}) {
  if (!isOpen) return null;

  const typeClasses = {
    primary: 'bg-slate-900 hover:bg-slate-800',
    danger: 'bg-rose-600 hover:bg-rose-700',
    success: 'bg-emerald-600 hover:bg-emerald-700',
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Overlay: Làm mờ nền */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={isLoading ? null : onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600 text-[15px] leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 border-t border-slate-100">
          <button
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all shadow-sm flex items-center justify-center gap-2 ${typeClasses[type]} disabled:opacity-50`}
          >
            {isLoading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
