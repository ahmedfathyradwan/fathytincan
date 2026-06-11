'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import OrderModal from '../components/OrderModal/OrderModal';
import ConfirmModal from '../components/ConfirmModal/ConfirmModal';
import Toast, { useToast } from '../components/Toast/Toast';
import StatsBar from '../components/StatsBar/StatsBar';

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  // Modals state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderModalMode, setOrderModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  // Authentication check
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/check');
        if (!res.ok) {
          router.replace('/login');
        } else {
          setAuthChecking(false);
          fetchOrders();
        }
      } catch {
        router.replace('/login');
      }
    }
    checkAuth();
  }, [router]);

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        addToast('حدث خطأ أثناء تحميل الطلبات', 'error');
      }
    } catch (err) {
      addToast('فشل الاتصال بالخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.replace('/login');
      } else {
        addToast('فشل تسجيل الخروج', 'error');
      }
    } catch {
      addToast('حدث خطأ أثناء الاتصال بالخادم', 'error');
    }
  };

  // Add or Edit order submission
  const handleOrderSubmit = async (formData) => {
    try {
      const method = orderModalMode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch('/api/orders', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        addToast(data.message || 'تمت العملية بنجاح', 'success');
        setIsOrderModalOpen(false);
        fetchOrders();
      } else {
        addToast(data.error || 'حدث خطأ ما', 'error');
      }
    } catch {
      addToast('حدث خطأ في الشبكة', 'error');
    }
  };

  // Open Edit Modal
  const openEditModal = (order) => {
    setSelectedOrder(order);
    setOrderModalMode('edit');
    setIsOrderModalOpen(true);
  };

  // Open Add Modal
  const openAddModal = () => {
    setSelectedOrder(null);
    setOrderModalMode('add');
    setIsOrderModalOpen(true);
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/orders?id=${orderToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        addToast(data.message || 'تم حذف الطلب بنجاح', 'success');
        setIsDeleteModalOpen(false);
        setOrderToDelete(null);
        fetchOrders();
      } else {
        addToast(data.error || 'فشل حذف الطلب', 'error');
      }
    } catch {
      addToast('حدث خطأ في الشبكة', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format Date to DD/MM/YYYY
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Get status class based on arabic value
  const getStatusClass = (status) => {
    if (status === 'غير متاح') return styles.statusRed;
    if (status === 'تحت الطباعة') return styles.statusYellow;
    if (status === 'جاهز للتشغيل') return styles.statusGreen;
    return '';
  };

  // Get size badge class based on numeric value
  const getSizeClass = (sizeValue) => {
    const val = parseFloat(sizeValue);
    if (val === 0.125) return `${styles.sizeBadge} ${styles.size_0_125}`;
    if (val === 0.250) return `${styles.sizeBadge} ${styles.size_0_250}`;
    if (val === 0.500) return `${styles.sizeBadge} ${styles.size_0_500}`;
    if (val === 0.750) return `${styles.sizeBadge} ${styles.size_0_750}`;
    if (val === 1.000) return `${styles.sizeBadge} ${styles.size_1_000}`;
    if (val === 2.000) return `${styles.sizeBadge} ${styles.size_2_000}`;
    if (val === 3.000) return `${styles.sizeBadge} ${styles.size_3_000}`;
    return styles.sizeBadge;
  };

  if (authChecking) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Toast notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div style={{ width: '80px' }}>
            {/* Empty block to balance the logout button in RTL layout if title is centered */}
          </div>

          <div className={styles.headerTitle} style={{ margin: '0 auto' }}>
            <span className={styles.headerIcon}>🏭</span>
            <div className={styles.headerText} style={{ textAlign: 'center' }}>
              <h1>نظام إدارة أوامر الإنتاج</h1>
              <p>Fathy Tin Can Co.</p>
            </div>
          </div>

          <button id="logout-btn" className={styles.logoutButton} onClick={handleLogout} type="button">
            <span className={styles.logoutIcon}>🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </header>

      {/* Main dashboard content */}
      <main className={styles.main}>
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>قائمة أوامر الإنتاج الحالية</h2>
            <span className={styles.orderCount}>عدد الأوامر: {orders.length}</span>
          </div>

          {loading && orders.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.spinner} style={{ margin: '0 auto 16px' }}></div>
              <p className={styles.emptyTitle}>جاري تحميل البيانات...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📦</div>
              <h3 className={styles.emptyTitle}>لا توجد أوامر إنتاج حالياً</h3>
              <p className={styles.emptyDescription}>اضغط على الزر العائم في الأسفل لإضافة أول أمر.</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>م</th>
                    <th>اسم الشركة</th>
                    <th>الكمية (بالألف)</th>
                    <th>مقاس العبوة</th>
                    <th>اسم العبوة</th>
                    <th>حالة الطلب</th>
                    <th>تاريخ الإنشاء</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span className={styles.orderNumber}>{order.orderNumber}</span>
                      </td>
                      <td>{order.companyName}</td>
                      <td style={{ fontWeight: '700' }}>
                        {order.quantity.toLocaleString('ar-EG')} ألف
                      </td>
                      <td>
                        <span className={getSizeClass(order.sizeValue)}>{order.sizeLabel}</span>
                      </td>
                      <td>{order.canName}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            id={`edit-btn-${order.id}`}
                            className={styles.editButton}
                            onClick={() => openEditModal(order)}
                            title="تعديل"
                            type="button"
                          >
                            ✏️
                          </button>
                          <button
                            id={`delete-btn-${order.id}`}
                            className={styles.deleteButton}
                            onClick={() => openDeleteModal(order)}
                            title="حذف"
                            type="button"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button (bottom-right) */}
      <button
        id="add-order-btn"
        className={styles.fab}
        onClick={openAddModal}
        title="إضافة أمر إنتاج"
        type="button"
      >
        ➕
      </button>

      {/* Statistics Bar at the bottom */}
      <StatsBar orders={orders} />

      {/* Order Modal (Add/Edit) */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSubmit={handleOrderSubmit}
        order={selectedOrder}
        mode={orderModalMode}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
