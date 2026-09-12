import { ArrowUpRight } from "lucide-react"
import { profile } from "../data/profile"
import Reveal from "./Reveal"
import SplitText from "./SplitText/SplitText"

export default function Contact() {
  const { contact, brand } = profile

  return (
    <section
      id="contact"
      className="contact"
    >
      {/* AVIF 比原 JPG 小 3 倍多（1074KB → 340KB）。JPG 留着做 <picture> 回退，
          不支持 AVIF 的浏览器拿到的还是原来那张，肉眼无差别。 */}
      <picture>
        <source srcSet="/images/mpower/contact-bg-clean.avif" type="image/avif" />
        <img
          className="contact__bg"
          src="/images/mpower/contact-bg-clean.jpg"
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className="contact__veil" aria-hidden="true" />
      <div className="contact__grid" aria-hidden="true" />
      <div className="contact__glow" aria-hidden="true" />

      <div className="container contact__inner">
        <div className="section-frame--contact">
          <p className="eyebrow">{contact.eyebrow}</p>

          <div className="contact__statement">
            <span className="contact__statement-line" aria-hidden="true" />
            <p className="contact__statement-sub text-fire">{contact.note}</p>
          </div>

          <Reveal className="contact__channels">
            {contact.channels.map((channel, index) => (
              <a
                key={channel.label}
                className="contact__channel"
                href={channel.href}
                style={{ "--i": index }}
              >
                <span className="contact__channel-scan" aria-hidden="true" />
                <span className="contact__channel-num" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="contact__channel-label">{channel.label}</span>
                <SplitText
                  tag="strong"
                  className="contact__channel-value"
                  text={channel.value}
                  delay={45}
                  duration={0.85}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 26 }}
                  to={{ opacity: 1, y: 0 }}
                  textAlign="left"
                  threshold={0.1}
                  rootMargin="-60px"
                />
                <ArrowUpRight aria-hidden="true" />
              </a>
            ))}
          </Reveal>

        </div>
      </div>

      <footer className="container contact__footer">
        <span>© 2026 — {brand}</span>
        <span>DESIGNED WITH RESTRAINT.</span>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </section>
  )
}
