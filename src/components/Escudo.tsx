'use client'

export function Escudo({ src, alt, size = 20 }: { src: string | null; alt: string; size?: number }) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={{ width: size, height: size }}
        className="rounded-full bg-gray-700 shrink-0"
      />
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="object-contain shrink-0"
      style={{ width: size, height: size }}
    />
  )
}
