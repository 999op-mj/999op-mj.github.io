import { useEffect, useState } from "react"
import {
  ArrowUpRight,
  Camera,
  Car,
  Flag,
  Mail,
  MonitorPlay,
  Pencil,
  Phone,
  Play,
  Shield,
  Star,
  Zap,
} from "lucide-react"
import AutoPlayVideo from "./AutoPlayVideo"
import {
  HERO_CHANNEL_EDIT_EVENT,
  HERO_CHANNEL_UPDATE_EVENT,
  loadHeroChannels,
} from "../data/siteConfig"

const CHANNEL_ICONS = {
  ferrari: Car,
  redbull: Zap,
  "aston-martin": Shield,
  mclaren: Flag,
  mercedes: Star,
  email: Mail,
  phone: Phone,
  instagram: Camera,
  bilibili: Play,
  youtube: MonitorPlay,
}

const CHANNEL_BADGES = {
  ferrari: "/images/channels/ferrari-badge.png",
  redbull: "/images/channels/redbull-badge.png",
  "aston-martin": "/images/channels/aston-martin-badge.png",
  mclaren: "/images/channels/mclaren-badge.png",
  mercedes: "/images/channels/mercedes-badge.png",
}

const CHANNEL_COLORS = {
  ferrari: "#FF2800",
  redbull: "#2B4CFF",
  "aston-martin": "#00A88E",
  mclaren: "#FF8000",
  mercedes: "#00D2BE",
}

const REV_LIGHTS = [0, 1, 2, 3, 4, 5]

function channelStyle(id, index) {
  const color = CHANNEL_COLORS[id]
  return color ? { "--c": color, "--i": index } : { "--i": index }
}

export default function Hero() {
  const [channels, setChannels] = useState(loadHeroChannels)

  useEffect(() => {
    const onUpdate = () => setChannels(loadHeroChannels())
    window.addEventListener(HERO_CHANNEL_UPDATE_EVENT, onUpdate)
    window.addEventListener("storage", onUpdate)
    return () => {
      window.removeEventListener(HERO_CHANNEL_UPDATE_EVENT, onUpdate)
      window.removeEventListener("storage", onUpdate)
    }
  }, [])

  const openChannelEditor = () => {
    window.dispatchEvent(new CustomEvent(HERO_CHANNEL_EDIT_EVENT))
  }

  return (
    <section id="top" className="targo-hero relative w-full overflow-hidden">
      <AutoPlayVideo
        className="targo-hero__video absolute inset-0 h-full w-full"
        src="/assets/targo-hero-40s-4k-light.mp4"
        hevcSrc="/assets/hero-4k.hevc.mp4"
        previewSrc="/assets/instant/hero-instant-1080p-lite.mp4"
        poster="/assets/hero-poster-4k.jpg"
        ariaLabel="汽车驾驶影片"
        eager
      />
      <div className="targo-hero__veil" aria-hidden="true" />

      <nav className="targo-hero__channels container" aria-label="联系渠道">
          {channels.map((channel, index) => {
            const Icon = CHANNEL_ICONS[channel.id]
            const href = channel.href.trim()
            const external = /^https?:\/\//i.test(href)
            const hasHref = Boolean(href)
            const content = (
              <>
                <span className="targo-hero__channel-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="targo-hero__channel-sweep" aria-hidden="true" />
                <span className="targo-hero__channel-icon" aria-hidden="true">
                  {CHANNEL_BADGES[channel.id] ? (
                    <img
                      className="targo-hero__channel-badge"
                      src={CHANNEL_BADGES[channel.id]}
                      alt=""
                      draggable={false}
                    />
                  ) : Icon ? (
                    <Icon size={16} strokeWidth={1.5} />
                  ) : null}
                </span>
                <span className="targo-hero__channel-meta">
                  <small>{channel.label}</small>
                  <strong>{channel.value}</strong>
                </span>
                <span className="targo-hero__rev" aria-hidden="true">
                  {REV_LIGHTS.map((tick) => (
                    <i key={tick} />
                  ))}
                </span>
                {hasHref ? (
                  <ArrowUpRight className="targo-hero__channel-arrow" size={14} strokeWidth={2} />
                ) : (
                  <Pencil className="targo-hero__channel-arrow" size={14} strokeWidth={2} />
                )}
              </>
            )

            return hasHref ? (
              <a
                key={channel.id}
                className="targo-hero__channel"
                style={channelStyle(channel.id, index)}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                title={`${channel.label} — ${channel.value}`}
              >
                {content}
              </a>
            ) : (
              <button
                key={channel.id}
                type="button"
                className="targo-hero__channel"
                style={channelStyle(channel.id, index)}
                onClick={openChannelEditor}
                title={`${channel.label} — 点击编辑渠道`}
              >
                {content}
              </button>
            )
          })}
      </nav>

      <div className="targo-hero__scroll" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>

    </section>
  )
}
