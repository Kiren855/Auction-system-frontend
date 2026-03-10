import React from 'react';

function ToastItem({ item, onClose }) {
  const styles = {
    success: {
      wrapper: 'border-emerald-200 bg-emerald-50',
      icon: 'bg-emerald-100 text-emerald-700',
      title: 'text-emerald-900',
      message: 'text-emerald-700',
      button: 'text-emerald-600 hover:bg-emerald-100',
    },
    error: {
      wrapper: 'border-rose-200 bg-rose-50',
      icon: 'bg-rose-100 text-rose-700',
      title: 'text-rose-900',
      message: 'text-rose-700',
      button: 'text-rose-600 hover:bg-rose-100',
    },
    warning: {
      wrapper: 'border-amber-200 bg-amber-50',
      icon: 'bg-amber-100 text-amber-700',
      title: 'text-amber-900',
      message: 'text-amber-700',
      button: 'text-amber-600 hover:bg-amber-100',
    },
    info: {
      wrapper: 'border-sky-200 bg-sky-50',
      icon: 'bg-sky-100 text-sky-700',
      title: 'text-sky-900',
      message: 'text-sky-700',
      button: 'text-sky-600 hover:bg-sky-100',
    },
  };

  const style = styles[item.type] || styles.info;

  return (
    <div
      className={`w-full max-w-sm rounded-2xl border shadow-lg shadow-slate-200/60 p-4 ${style.wrapper} animate-in slide-in-from-right-5 fade-in duration-300`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.icon}`}
        >
          {item.type === 'success' && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}

          {item.type === 'error' && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          )}

          {item.type === 'warning' && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
          )}

          {item.type === 'info' && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className={`text-sm font-semibold ${style.title}`}>
            {item.title}
          </div>
          <div className={`text-sm mt-1 leading-6 ${style.message}`}>
            {item.message}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onClose(item.id)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${style.button}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function NotificationToast({ items = [], onClose }) {
  if (!items.length) return null;

  return (
    <div className="fixed top-4 right-4 z-90 flex flex-col gap-3 w-[calc(100vw-2rem)] max-w-sm pointer-events-none">
      {items.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <ToastItem item={item} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
