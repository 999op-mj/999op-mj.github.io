import { useEffect, useRef, useState } from "react"
import { videoUrl } from "../lib/mediaUrl"

export default function RaceVideoCard({
  src,
  title,
  caption,
  className = "",
}) {
  const videoRef = useRef(null)
  const [failed, setFailed] = useState(false)
  const resolvedSrc = videoUrl(src)

  useEffect(() => {
    setFailed(false)
  }, [src])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined
    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    video.setAttribute("muted", "")
    video.setAttribute("playsinline", "")
    video.play().catch(() => {})
    return undefined
  }, [src])

  return (
    <figure className={`race-card ${className}`}>
      <div className="race-card__media">
        <video
          ref={videoRef}
          src={failed ? src : resolvedSrc}
          onError={() => setFailed(true)}
          autoPlay muted loop playsInline preload="metadata" />
        <span className="race-card__tag">ON TRACK</span>
      </div>
      <figcaption className="race-card__meta">
        <span className="race-card__title">{title}</span>
        <span className="race-card__caption">{caption}</span>
      </figcaption>
    </figure>
  )
}
