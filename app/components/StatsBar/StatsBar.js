'use client';

import { CAN_SIZES } from '@/lib/constants';
import styles from './StatsBar.module.css';

export default function StatsBar({ orders }) {
  // Calculate totals for each size
  const sizeTotals = CAN_SIZES.map((size) => {
    const total = orders
      .filter((order) => parseFloat(order.sizeValue) === size.value)
      .reduce((sum, order) => sum + (order.quantity || 0), 0);
    return { label: size.label, total };
  });

  // Grand total
  const grandTotal = orders.reduce((sum, order) => sum + (order.quantity || 0), 0);

  return (
    <div className={styles.statsBar} id="stats-bar">
      <div className={styles.statsInner}>
        {sizeTotals.map((item) => (
          <div key={item.label} className={styles.statCard}>
            <span className={styles.statLabel}>{item.label}</span>
            <span className={styles.statValue}>{item.total.toLocaleString('ar-EG')}</span>
            <span className={styles.statUnit}>ألف</span>
          </div>
        ))}
        <div className={`${styles.statCard} ${styles.totalCard}`}>
          <span className={styles.statLabel}>الإجمالي العام</span>
          <span className={styles.statValue}>{grandTotal.toLocaleString('ar-EG')}</span>
          <span className={styles.statUnit}>ألف عبوة</span>
        </div>
      </div>
    </div>
  );
}
