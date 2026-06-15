'use client';

import { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return { toasts, addToast, removeToast };
}

export default function Toast({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} />;
      case 'error':   return <XCircle size={18} />;
      case 'info':    return <Info size={18} />;
      default:        return <CheckCircle2 size={18} />;
    }
  };

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]} ${toast.exiting ? styles.exiting : ''}`}
        >
          <span className={styles.toastIcon}>{getIcon(toast.type)}</span>
          <span className={styles.toastMessage}>{toast.message}</span>
          <button className={styles.toastClose} onClick={() => onRemove(toast.id)} type="button">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
