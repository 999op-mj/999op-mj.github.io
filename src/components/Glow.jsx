import BorderGlow from "./BorderGlow"

const GLOW_PROPS = {
  edgeSensitivity: 3,
  glowColor: "40 80 80",
  backgroundColor: "#120F17",
  borderRadius: 0,
  glowRadius: 10,
  glowIntensity: 3,
  coneSpread: 25,
  animated: false,
  colors: ["#c084fc", "#f472b6", "#38bdf8"],
}

export default function Glow({ children, className = "", ...props }) {
  return (
    <BorderGlow className={className} {...GLOW_PROPS} {...props}>
      {children}
    </BorderGlow>
  )
}
