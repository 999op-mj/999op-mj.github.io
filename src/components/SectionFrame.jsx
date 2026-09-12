import Glow from "./Glow"

export default function SectionFrame({ children, className = "" }) {
  return (
    <Glow
      animated
      backgroundColor="transparent"
      fillOpacity={0}
      className={`section-frame ${className}`.trim()}
    >
      {children}
    </Glow>
  )
}
