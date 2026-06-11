'use client';

import styles from './ConfirmModal.module.css';

export default function ConfirmModal({ isOpen, onClose, onConfirm, loading }) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.warningIcon}>⚠️</div>
        <h3 className={styles.title}>هل أنت متأكد من حذف هذا الطلب؟</h3>
        <div className={styles.buttons}>
          <button
            id="confirm-delete-btn"
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={loading}
            type="button"
          >
            {loading ? 'جاري الحذف...' : 'تأكيد'}
          </button>
          <button
            id="cancel-delete-btn"
            className={styles.cancelButton}
            onClick={onClose}
            type="button"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
