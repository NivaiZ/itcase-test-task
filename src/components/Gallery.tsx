import { useState } from 'react'
import styles from './Gallery.module.css'

type GalleryProps = {
  images: string[]
  alt: string
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M14.5 5.5 L8 12 L14.5 18.5' : 'M9.5 5.5 L16 12 L9.5 18.5'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Gallery({ images, alt }: GalleryProps) {
  const [index, setIndex] = useState(0)

  if (!images.length) {
    return <div className={styles.empty}>Нет изображения</div>
  }

  const currentIndex = Math.min(index, images.length - 1)
  const current = images[currentIndex]

  return (
    <div className={styles.gallery}>
      <div className={styles.stage}>
        <img src={current} alt={`${alt}, фото ${currentIndex + 1} из ${images.length}`} />
        {images.length > 1 && (
          <div className={styles.nav}>
            <button
              type="button"
              onClick={() => setIndex((currentImage) => (currentImage - 1 + images.length) % images.length)}
              aria-label="Предыдущее фото"
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((currentImage) => (currentImage + 1) % images.length)}
              aria-label="Следующее фото"
            >
              <Chevron direction="right" />
            </button>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className={styles.thumbs}>
          {images.map((src, imageIndex) => (
            <button
              key={`${src}-${imageIndex}`}
              type="button"
              aria-label={`Показать фото ${imageIndex + 1}`}
              aria-current={imageIndex === currentIndex ? 'true' : undefined}
              className={imageIndex === currentIndex ? styles.current : undefined}
              onClick={() => setIndex(imageIndex)}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
