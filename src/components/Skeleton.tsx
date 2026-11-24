import styles from './Skeleton.module.css'

type BoneProps = {
  className: string
}

function Bone({ className }: BoneProps) {
  return <span className={`${styles.bone} ${className}`} />
}

export function CatalogSkeleton() {
  return (
    <div className={styles.page} aria-busy="true">
      <h1 className={styles.srOnly}>Загрузка каталога</h1>
      <Bone className={styles.title} />
      <div className={styles.filters}>
        <Bone className={styles.field} />
        <Bone className={styles.fieldShort} />
        <Bone className={styles.fieldShort} />
      </div>
      <ul className={styles.grid}>
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index} className={styles.card}>
            <Bone className={styles.media} />
            <Bone className={styles.line} />
            <Bone className={styles.lineShort} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProductSkeleton() {
  return (
    <div aria-busy="true">
      <h1 className={styles.srOnly}>Загрузка товара</h1>
      <div className={styles.product}>
        <Bone className={styles.media} />
        <div className={styles.copy}>
          <Bone className={styles.lineShort} />
          <Bone className={styles.title} />
          <Bone className={styles.line} />
          <Bone className={styles.line} />
          <Bone className={styles.fieldShort} />
        </div>
      </div>
    </div>
  )
}

export function CartSkeleton() {
  return (
    <div aria-busy="true">
      <h1 className={styles.srOnly}>Загрузка корзины</h1>
      <Bone className={styles.title} />
      <ul className={styles.cart}>
        {Array.from({ length: 2 }, (_, index) => (
          <li key={index} className={styles.cartLine}>
            <Bone className={styles.thumb} />
            <div className={styles.copy}>
              <Bone className={styles.line} />
              <Bone className={styles.lineShort} />
              <Bone className={styles.lineShort} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
