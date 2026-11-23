import { useState } from 'react'

type GalleryProps = {
  images: string[]
  alt: string
}

export function Gallery({ images, alt }: GalleryProps) {
  const [index, setIndex] = useState(0)

  if (!images.length) {
    return <div className="gallery-empty">Нет изображения</div>
  }

  const currentIndex = Math.min(index, images.length - 1)
  const current = images[currentIndex]

  return (
    <div className="gallery">
      <div className="gallery-stage">
        <img src={current} alt={`${alt}, фото ${currentIndex + 1} из ${images.length}`} />
        {images.length > 1 && (
          <div className="gallery-nav">
            <button
              type="button"
              onClick={() => setIndex((currentImage) => (currentImage - 1 + images.length) % images.length)}
              aria-label="Предыдущее фото"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setIndex((currentImage) => (currentImage + 1) % images.length)}
              aria-label="Следующее фото"
            >
              ›
            </button>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((src, imageIndex) => (
            <button
              key={`${src}-${imageIndex}`}
              type="button"
              aria-label={`Показать фото ${imageIndex + 1}`}
              aria-current={imageIndex === currentIndex ? 'true' : undefined}
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
