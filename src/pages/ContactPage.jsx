import { ArrowUpRight } from "lucide-react"
import { profile } from "../data/profile"

export default function ContactPage() {
  const { contact, brand } = profile

  return (
    <section className="team-page team-page--contact">
      <div className="team-page__bgimage" aria-hidden="true" />
      <div className="team-page__veil" aria-hidden="true" />
      <div className="team-page__frame" aria-hidden="true" />

      <header className="container team-page__top">
        <a className="team-page__back" href="#/">← 返回首页</a>
      </header>

      <div className="container team-page__hero">
        <p className="team-page__eyebrow">{contact.eyebrow}</p>
        <h1 className="team-page__title">联系</h1>
        <p className="team-page__lead">{contact.title}</p>
        <span className="team-page__hint">GET IN TOUCH</span>
      </div>

      <article className="container team-page__body">
        <div>
          <p className="eyebrow">CONTACT / 联系方式</p>
          <h2 className="team-page__section-title">写给我</h2>
        </div>
        <p className="team-page__desc">{contact.note}</p>
      </article>

      <div className="container team-page__nav">
        <a className="team-page__nav-link" href={`mailto:${contact.email}`}>
          <span>01 / EMAIL</span>
          <strong>{contact.email}</strong>
          <ArrowUpRight aria-hidden="true" />
        </a>
        {contact.channels.map((channel) => (
          <a key={channel.href} className="team-page__nav-link" href={channel.href}>
            <span>{channel.label}</span>
            <strong>{channel.value}</strong>
            <ArrowUpRight aria-hidden="true" />
          </a>
        ))}
      </div>

      <footer className="container team-page__footer">
        <span>© 2026 — {brand}</span>
        <a href="#/">BACK TO HOME ↑</a>
      </footer>
    </section>
  )
}
