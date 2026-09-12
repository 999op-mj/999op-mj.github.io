import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function HeroMotion({ children }) {
  const rootRef = useRef(null)

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return undefined

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return undefined
      }

      const media = root.querySelector(".targo-hero__video")
      const frame = root.querySelector(".section-frame--hero")
      const content = root.querySelector(".targo-hero__parallax")
      const eyebrow = root.querySelector(".targo-hero__eyebrow")
      const lines = root.querySelectorAll(".targo-hero__title-line > span")
      const cta = root.querySelector(".targo-hero__parallax .clip-corner")
      const scroll = root.querySelector(".targo-hero__scroll")

      if (!media || !frame || !content || !cta || !lines.length) return undefined

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } })
      intro
        .fromTo(
          media,
          { scale: 1.06, filter: "brightness(0.78) saturate(0.82)" },
          { scale: 1.018, filter: "brightness(0.98) saturate(0.94)", duration: 2.6, ease: "power2.out" },
          0,
        )
        .fromTo(
          eyebrow,
          { autoAlpha: 0, y: 18, filter: "blur(6px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1 },
          0.25,
        )
        .fromTo(
          lines,
          { autoAlpha: 0, yPercent: 112, filter: "blur(8px)" },
          { autoAlpha: 1, yPercent: 0, filter: "blur(0px)", duration: 1.2, stagger: 0.09 },
          0.36,
        )
        .fromTo(
          cta,
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.9 },
          0.92,
        )
        .fromTo(
          scroll,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.7 },
          1.18,
        )
        .call(
          () => gsap.set([eyebrow, lines, media], { clearProps: "filter" }),
          undefined,
          ">",
        )

      const mediaX = gsap.quickTo(media, "x", { duration: 1.1, ease: "power3.out" })
      const mediaY = gsap.quickTo(media, "y", { duration: 1.1, ease: "power3.out" })
      const frameX = gsap.quickTo(frame, "x", { duration: 0.9, ease: "power3.out" })
      const frameY = gsap.quickTo(frame, "y", { duration: 0.9, ease: "power3.out" })

      const onPointerMove = (event) => {
        const rect = root.getBoundingClientRect()
        const nx = (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5
        const ny = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5
        mediaX(nx * 9)
        mediaY(ny * 6)
        frameX(nx * -5)
        frameY(ny * -3)
      }

      const onPointerLeave = () => {
        mediaX(0)
        mediaY(0)
        frameX(0)
        frameY(0)
      }

      root.addEventListener("pointermove", onPointerMove, { passive: true })
      root.addEventListener("pointerleave", onPointerLeave, { passive: true })

      const scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: 0.75,
        },
        defaults: { ease: "none" },
      })
      scrollTimeline
        .to(media, { scale: 1.08, yPercent: 5 }, 0)
        .to(content, { y: -84, autoAlpha: 0.3 }, 0)
        .to(scroll, { autoAlpha: 0, y: 14 }, 0)

      return () => {
        root.removeEventListener("pointermove", onPointerMove)
        root.removeEventListener("pointerleave", onPointerLeave)
      }
    },
    { scope: rootRef },
  )

  return <div ref={rootRef} className="targo-hero__motion">{children}</div>
}
