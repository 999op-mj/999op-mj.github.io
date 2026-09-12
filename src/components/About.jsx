import Reveal from "./Reveal"
import SectionFrame from "./SectionFrame"
import AutoPlayVideo from "./AutoPlayVideo"
import { ArrowUpRight } from "lucide-react"
import { profile } from "../data/profile"

const QQ_MAIL_URL = "https://mail.qq.com"

function copyEmail(contact) {
  if (!contact.href.startsWith("mailto:")) return
  navigator.clipboard?.writeText(contact.value).catch(() => {})
}

export default function About() {
  const { about } = profile

  return (
    <section id="about" className="about about--cinema">
      <AutoPlayVideo
        className="about__video"
        src="/assets/about-car-vertical.mp4?v=smooth-15s"
        previewSrc="/assets/instant/about-instant-720p.mp4"
        ariaLabel="汽车驾驶视频"
      />
      <div className="about__veil" aria-hidden="true" />
      <div className="about__screen-meta" aria-hidden="true">
        <span>FIELD / 001</span>
        <span>FULL FRAME · 4K</span>
      </div>

      <div className="container about__grid">
        <Reveal className="about__visual">
          <div className="about__stamp" aria-hidden="true">
            A/<span>01</span>
          </div>
          <p className="about__caption">
            <span>视线，是理解一辆车的第一步。</span>
            <span>NIGHT DRIVE</span>
          </p>
        </Reveal>

        <div className="about__body">
          <SectionFrame className="section-frame--about">
            <Reveal as="header" className="section-head">
              <p className="eyebrow">{about.eyebrow}</p>
              <h2 className="section-title">{about.title}</h2>
              <p className="section-lead">{about.lead}</p>
            </Reveal>

            <Reveal delay={120} className="about__copy">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </Reveal>

            <div className="about__contacts">
              {about.contacts.map((contact) => (
                <a
                  key={contact.label}
                  className="about__contact-link"
                  href={contact.href.startsWith("mailto:") ? QQ_MAIL_URL : contact.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => copyEmail(contact)}
                >
                  <span>{contact.label}</span>
                  <strong>{contact.value}</strong>
                  <ArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </div>
          </SectionFrame>
        </div>
      </div>

      <div className="about__screen-footer" aria-hidden="true">
        <span>ONGOING</span>
        <span>SCROLL TO EXPLORE</span>
      </div>
    </section>
  )
}
