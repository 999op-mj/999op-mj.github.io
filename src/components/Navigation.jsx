import { useEffect, useRef, useState } from "react"
import {
  Check,
  Menu,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react"
import { profile } from "../data/profile"
import {
  DEFAULT_CONTACT_CARD,
  DEFAULT_HERO_CHANNELS,
  HERO_CHANNEL_EDIT_EVENT,
  loadContactCard,
  loadHeroChannels,
  saveContactCard,
  saveHeroChannels,
} from "../data/siteConfig"

const NAV_STORAGE_KEY = "car-portfolio-nav-v1"
const DEFAULT_NAV = [
  { id: "home", label: "首页", href: "#top" },
  { id: "capabilities", label: "能力", href: "#capabilities" },
]
const REMOVED_NAV_IDS = new Set(["about", "projects", "contact"])

function loadStoredNav() {
  if (typeof window === "undefined") return DEFAULT_NAV

  try {
    const stored = window.localStorage.getItem(NAV_STORAGE_KEY)
    if (!stored) return DEFAULT_NAV

    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return DEFAULT_NAV

    const items = parsed
      .map((item, index) => ({
        id: String(item.id || `nav-${index}`),
        label: String(item.label || ""),
        href: String(item.href || ""),
      }))
      .filter((item) => !REMOVED_NAV_IDS.has(item.id))
      .filter((item) => item.label.trim() && item.href.trim())

    return items.length ? items : DEFAULT_NAV
  } catch {
    return DEFAULT_NAV
  }
}

function normalizeHref(value) {
  const href = value.trim()
  if (!href) return "#"
  if (href.startsWith("#") || /^https?:\/\//i.test(href)) return href
  return `#${href.replace(/^\/+/, "")}`
}

export default function Navigation() {
  const [items, setItems] = useState(loadStoredNav)
  const [contactDraft, setContactDraft] = useState(loadContactCard)
  const [channelDraft, setChannelDraft] = useState(loadHeroChannels)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const navRef = useRef(null)
  const spotRef = useRef(null)

  useEffect(() => {
    const nav = navRef.current
    const spot = spotRef.current
    if (!nav || !spot) return undefined

    let frame = 0
    const onMove = (event) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = nav.getBoundingClientRect()
        spot.style.transform = `translateX(${event.clientX - rect.left}px) translateX(-50%)`
      })
    }

    nav.addEventListener("pointermove", onMove)
    return () => {
      nav.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false)
        setEditing(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  useEffect(() => {
    const onEditChannels = () => {
      setContactDraft(loadContactCard())
      setChannelDraft(loadHeroChannels())
      setEditing(true)
      setOpen(true)
    }

    window.addEventListener(HERO_CHANNEL_EDIT_EVENT, onEditChannels)
    return () => window.removeEventListener(HERO_CHANNEL_EDIT_EVENT, onEditChannels)
  }, [items])

  const closeMenu = () => {
    setOpen(false)
    setEditing(false)
  }

  const openEditor = () => {
    setContactDraft(loadContactCard())
    setChannelDraft(loadHeroChannels())
    setEditing(true)
    setOpen(true)
  }

  const updateContact = (field, value) => {
    setContactDraft((current) => ({ ...current, [field]: value }))
  }

  const updateChannel = (id, field, value) => {
    setChannelDraft((current) =>
      current.map((channel) => (channel.id === id ? { ...channel, [field]: value } : channel)),
    )
  }

  const addChannel = () => {
    setChannelDraft((current) => [
      ...current,
      {
        id: `channel-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        label: "新渠道",
        value: "待填写",
        href: "",
      },
    ])
  }

  const removeChannel = (id) => {
    setChannelDraft((current) => current.filter((channel) => channel.id !== id))
  }

  const saveSettings = () => {
    const next = items
      .filter((item) => item.label.trim() && item.href.trim())
      .map((item) => ({
        ...item,
        label: item.label.trim(),
        href: normalizeHref(item.href),
      }))

    if (!next.length) return

    const nextChannels = channelDraft
      .map((channel) => ({
        ...channel,
        label: channel.label.trim(),
        value: channel.value.trim(),
        href: channel.href.trim(),
      }))
      .filter((channel) => channel.label)

    const phoneHref = contactDraft.phone.trim()
      ? `tel:${contactDraft.phone.replace(/[^\d+]/g, "")}`
      : ""

    setItems(next)
    window.localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(next))
    saveContactCard({ ...contactDraft, phoneHref })
    saveHeroChannels(nextChannels)
    setEditing(false)
    setOpen(false)
  }

  const resetContact = () => {
    if (!window.confirm("确认恢复默认电话栏？")) return
    const next = { ...DEFAULT_CONTACT_CARD }
    setContactDraft(next)
    saveContactCard(next)
  }

  const resetChannels = () => {
    if (!window.confirm("确认恢复默认首页渠道栏？")) return
    const next = DEFAULT_HERO_CHANNELS.map((channel) => ({ ...channel }))
    setChannelDraft(next)
    saveHeroChannels(next)
  }

  return (
    <>
      <header ref={navRef} className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
        <span className="site-nav__spot" ref={spotRef} aria-hidden="true" />
        <div className="container site-nav__inner">
          <a className="brand" href="#top" onClick={closeMenu}>
            <img className="brand__logo" src="/personal-logo.svg" alt="个人 logo" />
            <span>{profile.brand}</span>
          </a>

          <nav className="site-nav__links" aria-label="主导航">
            {items.map((item) => {
              const external = /^https?:\/\//i.test(item.href)
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  onClick={closeMenu}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>

          <div className="site-nav__actions">
            <button
              type="button"
              className="site-nav__edit"
              onClick={openEditor}
              aria-label="编辑导航、电话栏与首页渠道栏"
            >
              <Pencil size={14} strokeWidth={2} />
              <span>编辑导航</span>
            </button>
          </div>

          <button
            type="button"
            className="site-nav__menu"
            onClick={() => setOpen(true)}
            aria-label="打开导航菜单"
          >
            <Menu size={20} strokeWidth={2} />
          </button>
        </div>
      </header>

      {open && (
        <div
          className="nav-menu-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="导航、电话栏与首页渠道栏菜单"
          onClick={closeMenu}
        >
          <section className="nav-menu-panel" onClick={(event) => event.stopPropagation()}>
            <header className="nav-menu-head">
              <div>
                <span className="nav-menu-eyebrow">SITE CONTROL</span>
                <h2>{editing ? "编辑导航 / 电话 / 渠道栏" : "导航菜单"}</h2>
              </div>
              <button
                type="button"
                className="nav-menu-close"
                onClick={closeMenu}
                aria-label="关闭导航菜单"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </header>

            {!editing ? (
              <>
                <nav className="nav-menu-list" aria-label="页面导航">
                  {items.map((item, index) => {
                    const external = /^https?:\/\//i.test(item.href)
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                        onClick={closeMenu}
                      >
                        <span>
                          <i>{String(index + 1).padStart(2, "0")}</i>
                          {item.label}
                        </span>
                        <small>{item.href}</small>
                      </a>
                    )
                  })}
                </nav>

                <div className="nav-menu-actions">
                  <button
                    type="button"
                    className="nav-menu-button nav-menu-button--primary"
                    onClick={openEditor}
                  >
                    <Pencil size={15} strokeWidth={2} />
                    <span>修改导航 / 电话 / 首页渠道栏</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="nav-editor">
                <div className="nav-editor-section">
                  <div className="nav-editor-section-head">
                    <h3>首页渠道栏</h3>
                    <span>修改渠道名称、显示文字与点击地址</span>
                  </div>

                  <div className="nav-editor-list">
                    {channelDraft.map((channel) => (
                      <div
                        className="nav-editor-row nav-editor-row--channel"
                        key={channel.id}
                      >
                        <input
                          value={channel.label}
                          onChange={(event) => updateChannel(channel.id, "label", event.target.value)}
                          placeholder="渠道名称"
                          aria-label="渠道名称"
                        />
                        <input
                          value={channel.value}
                          onChange={(event) => updateChannel(channel.id, "value", event.target.value)}
                          placeholder="显示文字"
                          aria-label="显示文字"
                        />
                        <input
                          value={channel.href}
                          onChange={(event) => updateChannel(channel.id, "href", event.target.value)}
                          placeholder="https://... 留空则点击打开编辑"
                          aria-label="点击地址"
                        />
                        <button
                          type="button"
                          className="nav-editor-delete"
                          onClick={() => removeChannel(channel.id)}
                          aria-label="删除渠道"
                        >
                          <Trash2 size={15} strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="nav-menu-actions nav-editor-actions">
                    <button type="button" className="nav-menu-button" onClick={addChannel}>
                      <Plus size={15} strokeWidth={2} />
                      <span>添加渠道</span>
                    </button>
                    <button type="button" className="nav-menu-button" onClick={resetChannels}>
                      <RotateCcw size={15} strokeWidth={2} />
                      <span>恢复渠道</span>
                    </button>
                  </div>
                </div>

                <div className="nav-editor-section">
                  <div className="nav-editor-section-head">
                    <h3>电话栏</h3>
                    <span>首页右下角的咨询卡片</span>
                  </div>

                  <div className="contact-editor">
                    <div className="contact-editor-row">
                      <label htmlFor="contact-title">主标题</label>
                      <input
                        id="contact-title"
                        value={contactDraft.title}
                        onChange={(event) => updateContact("title", event.target.value)}
                        placeholder="Book a Free Consultation"
                      />
                    </div>
                    <div className="contact-editor-row">
                      <label htmlFor="contact-phone">联系电话</label>
                      <input
                        id="contact-phone"
                        value={contactDraft.phone}
                        onChange={(event) => updateContact("phone", event.target.value)}
                        placeholder="+86 138 0000 0000"
                      />
                    </div>
                  </div>

                  <div className="nav-menu-actions nav-editor-actions">
                    <button type="button" className="nav-menu-button" onClick={resetContact}>
                      <RotateCcw size={15} strokeWidth={2} />
                      <span>恢复电话栏</span>
                    </button>
                  </div>
                </div>

                <div className="nav-menu-actions nav-editor-actions nav-editor-footer">
                  <button
                    type="button"
                    className="nav-menu-button"
                    onClick={() => {
                      setContactDraft(loadContactCard())
                      setEditing(false)
                    }}
                  >
                    <X size={15} strokeWidth={2} />
                    <span>取消</span>
                  </button>
                  <button
                    type="button"
                    className="nav-menu-button nav-menu-button--primary"
                    onClick={saveSettings}
                  >
                    <Check size={15} strokeWidth={2} />
                    <span>保存修改</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  )
}
