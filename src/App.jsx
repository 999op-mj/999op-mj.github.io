import { lazy, Suspense, useEffect, useState } from "react"
import Hero from "./components/Hero"
import Mpower from "./components/Mpower"
import Contact from "./components/Contact"
import Navigation from "./components/Navigation"
import SplashCursor from "./components/SplashCursor"
// 首页只带首页要用的代码：车队副页有 68KB 源码，跟着入口包一起下会拖慢首屏。
const TeamPage = lazy(() => import("./pages/TeamPage"))
const ContactPage = lazy(() => import("./pages/ContactPage"))

// 副页分包有 188KB。慢网络下要几十秒，而以前 Suspense 的 fallback 是 null，
// 下载期间整页全白——看着就是"点进去网页没了"。给一个加载态，并且鼠标移到
// 车队入口就先开始下载，点进去时通常已经就绪。
function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span className="route-loading__bar" aria-hidden="true" />
      <p className="route-loading__label">LOADING</p>
    </div>
  )
}

const CURSOR_PROPS = {
  RAINBOW_MODE: true,
  DENSITY_DISSIPATION: 2.5,
  CURL: 5,
  SPLAT_RADIUS: 0.34,
  SPLAT_FORCE: 10500,
  COLOR_UPDATE_SPEED: 45,
}

export default function App() {
  const [route, setRoute] = useState(() => window.location.hash)

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash)
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  useEffect(() => {
    // 重复 import 会被模块系统去重，不必自己记状态。
    const warm = (event) => {
      const link = event.target.closest && event.target.closest('a[href*="#/teams/"]')
      if (link) import("./pages/TeamPage")
    }
    window.addEventListener("pointerover", warm, { passive: true })
    window.addEventListener("focusin", warm)
    return () => {
      window.removeEventListener("pointerover", warm)
      window.removeEventListener("focusin", warm)
    }
  }, [])

  const teamMatch = route.match(/^#\/teams\/([^/]+)/i)
  const isContactPage = /^#\/contact\b/i.test(route)

  if (teamMatch) {
    return (
      <>
        <Suspense fallback={<RouteLoading />}>
          <TeamPage slug={teamMatch[1]} />
        </Suspense>
        <SplashCursor {...CURSOR_PROPS} />
      </>
    )
  }

  if (isContactPage) {
    return (
      <>
        <Suspense fallback={<RouteLoading />}>
          <ContactPage />
        </Suspense>
        <SplashCursor {...CURSOR_PROPS} />
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Mpower />
        <Contact />
      </main>
      <SplashCursor {...CURSOR_PROPS} />
    </>
  )
}
