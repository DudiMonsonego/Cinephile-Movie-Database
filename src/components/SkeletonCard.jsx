import styles from './SkeletonCard.module.css';

export default function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={`${styles.shimmer} ${styles.poster}`} />
      <div className={styles.info}>
        <div className={`${styles.shimmer} ${styles.titleLine}`} />
        <div className={`${styles.shimmer} ${styles.metaLine}`} />
      </div>
    </div>
  );
}
