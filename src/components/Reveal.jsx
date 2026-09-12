import { useEffect, useRef } from "react"

export default function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  threshold = 0.04,
  children,
  ...props
}) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        node.classList.add("is-visible")
        observer.disconnect()
      },
      { threshold, rootMargin: "0px 0px 15% 0px" },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={{ "--delay": `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  )
}
