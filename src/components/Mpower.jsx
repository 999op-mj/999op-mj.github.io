import AutoPlayVideo from "./AutoPlayVideo"
import Reveal from "./Reveal"
import { ArrowUpRight } from "lucide-react"
import { profile } from "../data/profile"

export default function Mpower() {
  const { mpower } = profile

  return (
    <section id="mpower" className="section mpower">
      <AutoPlayVideo
        className="mpower__video"
        src="/assets/about-car-vertical.mp4"
        hevcSrc="/assets/about-4k.hevc.mp4"
        previewSrc="/assets/instant/about-instant-30fps.mp4"
        ariaLabel="宝马 M 驾驶影片"
      />
      <div className="mpower__veil" aria-hidden="true" />
      <div className="mpower__screen-meta" aria-hidden="true">
        <span>FIELD / 003</span>
        <span>BMW M · 4K</span>
      </div>

      <div className="container mpower__inner">
        <div className="section-frame--mpower">
          <div className="mpower__head">
            <div className="mpower__copy">
              <p className="eyebrow">{mpower.eyebrow}</p>
              <h2 className="mpower__title">{mpower.title}</h2>
              <p className="mpower__lead">{mpower.lead}</p>
              <p className="mpower__paragraph">{mpower.paragraph}</p>
            </div>

            <div className="mpower__stats">
              {mpower.stats.map((stat, index) => (
                <div
                  className="mpower__stat"
                  key={stat.label}
                  style={{ "--i": index }}
                >
                  <span className="mpower__stat-value">{stat.value}</span>
                  <span className="mpower__stat-label">{stat.label}</span>
                </div>
              ))}
            </div>

            <Reveal className="mpower__channels" threshold={0.45}>
              {mpower.channels.map((channel, index) => (
                <a
                  key={channel.label}
                  className="mpower__channel"
                  href={channel.href}
                  style={{ "--i": index }}
                >
                  <span>{channel.label}</span>
                  <strong>{channel.value}</strong>
                  <ArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </Reveal>
          </div>
        </div>
      </div>

      <div className="mpower__screen-footer" aria-hidden="true">
        <span>SCROLL TO EXPLORE</span>
      </div>
    </section>
  )
}
