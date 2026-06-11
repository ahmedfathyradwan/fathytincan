'use client';

import { useState, useEffect } from 'react';
import { CAN_SIZES, COMPANIES, STATUSES } from '@/lib/constants';
import styles from './OrderModal.module.css';

export default function OrderModal({ isOpen, onClose, onSubmit, order, mode }) {
  const [formData, setFormData] = useState({
    companyName: '',
    quantity: '',
    sizeValue: '',
    sizeLabel: '',
    canName: '',
    status: 'غير متاح',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && order) {
      setFormData({
        companyName: order.companyName || '',
        quantity: order.quantity?.toString() || '',
        sizeValue: order.sizeValue?.toString() || '',
        sizeLabel: order.sizeLabel || '',
        canName: order.canName || '',
        status: order.status || 'غير متاح',
      });
    } else {
      setFormData({
        companyName: '',
        quantity: '',
        sizeValue: '',
        sizeLabel: '',
        canName: '',
        status: 'غير متاح',
      });
    }
    setErrors({});
  }, [isOpen, mode, order]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.companyName) newErrors.companyName = 'اختر اسم الشركة';
    if (!formData.quantity || isNaN(formData.quantity) || parseInt(formData.quantity) <= 0) {
      newErrors.quantity = 'أدخل كمية صحيحة';
    }
    if (!formData.sizeValue) newErrors.sizeValue = 'اختر مقاس العبوة';
    if (!formData.canName || !formData.canName.trim()) newErrors.canName = 'أدخل اسم العبوة';
    if (!formData.status) newErrors.status = 'اختر الحالة';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSizeChange = (e) => {
    const value = e.target.value;
    const size = CAN_SIZES.find((s) => s.value.toString() === value);
    setFormData((prev) => ({
      ...prev,
      sizeValue: value,
      sizeLabel: size ? size.label : '',
    }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        canName: formData.canName.trim(),
        quantity: parseInt(formData.quantity),
        sizeValue: parseFloat(formData.sizeValue),
        ...(mode === 'edit' && order ? { id: order.id } : {}),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {mode === 'edit' ? 'تعديل الطلب' : 'إضافة طلب جديد'}
          </h2>
          <button className={styles.closeButton} onClick={onClose} type="button">✕</button>
        </div>

        <div className={styles.modalBody}>
          {/* Company Name */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>اسم الشركة</label>
            <select
              id="company-select"
              className={styles.formSelect}
              value={formData.companyName}
              onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
            >
              <option value="">-- اختر الشركة --</option>
              {COMPANIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.companyName && <p className={styles.errorText}>{errors.companyName}</p>}
          </div>

          {/* Quantity */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>الكمية (ألف عبوة)</label>
            <div className={styles.quantityWrapper}>
              <input
                id="quantity-input"
                className={styles.formInput}
                type="number"
                min="1"
                placeholder="أدخل الكمية"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
              />
              <span className={styles.quantityUnit}>ألف</span>
            </div>
            {errors.quantity && <p className={styles.errorText}>{errors.quantity}</p>}
          </div>

          {/* Can Size */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>مقاس العبوة</label>
            <select
              id="size-select"
              className={styles.formSelect}
              value={formData.sizeValue}
              onChange={handleSizeChange}
            >
              <option value="">-- اختر المقاس --</option>
              {CAN_SIZES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {errors.sizeValue && <p className={styles.errorText}>{errors.sizeValue}</p>}
          </div>

          {/* Can Name */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>اسم العبوة</label>
            <input
              id="canname-input"
              className={styles.formInput}
              type="text"
              placeholder="أدخل اسم العبوة (مثال: عبوة دهانات)"
              value={formData.canName}
              onChange={(e) => setFormData((prev) => ({ ...prev, canName: e.target.value }))}
            />
            {errors.canName && <p className={styles.errorText}>{errors.canName}</p>}
          </div>

          {/* Status */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>الحالة</label>
            <select
              id="status-select"
              className={styles.formSelect}
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.value}</option>
              ))}
            </select>
            {errors.status && <p className={styles.errorText}>{errors.status}</p>}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            id="submit-order-btn"
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={loading}
            type="button"
          >
            {loading ? 'جاري الحفظ...' : mode === 'edit' ? 'تحديث' : 'حفظ'}
          </button>
          <button className={styles.cancelButton} onClick={onClose} type="button">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
