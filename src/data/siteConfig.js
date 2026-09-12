export const CONTACT_STORAGE_KEY = "car-portfolio-contact-card-v1"
export const CONTACT_UPDATE_EVENT = "car-portfolio-contact-updated"
export const HERO_CHANNELS_STORAGE_KEY = "car-portfolio-hero-channels-v4"
export const HERO_CHANNEL_UPDATE_EVENT = "car-portfolio-hero-channels-updated"
export const HERO_CHANNEL_EDIT_EVENT = "car-portfolio-open-hero-channel-editor"

export const DEFAULT_CONTACT_CARD = {
  label: "Free Consultation",
  title: "Book a Free Consultation",
  button: "Book a Call",
  phone: "+86 138 0000 0000",
  phoneHref: "tel:+8613800000000",
}

export const DEFAULT_HERO_CHANNELS = [
  {
    id: "ferrari",
    label: "FERRARI",
    value: "法拉利车队",
    href: "#/teams/ferrari",
  },
  {
    id: "redbull",
    label: "RED BULL",
    value: "红牛车队",
    href: "#/teams/redbull",
  },
  {
    id: "aston-martin",
    label: "ASTON MARTIN",
    value: "阿斯顿马丁车队",
    href: "#/teams/aston-martin",
  },
  {
    id: "mclaren",
    label: "MCLAREN",
    value: "迈凯轮车队",
    href: "#/teams/mclaren",
  },
  {
    id: "mercedes",
    label: "MERCEDES",
    value: "梅赛德斯车队",
    href: "#/teams/mercedes",
  },
]

export function loadContactCard() {
  if (typeof window === "undefined") return { ...DEFAULT_CONTACT_CARD }

  try {
    const stored = window.localStorage.getItem(CONTACT_STORAGE_KEY)
    if (!stored) return { ...DEFAULT_CONTACT_CARD }

    const parsed = JSON.parse(stored)
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_CONTACT_CARD }

    return {
      label: typeof parsed.label === "string" ? parsed.label : DEFAULT_CONTACT_CARD.label,
      title: typeof parsed.title === "string" ? parsed.title : DEFAULT_CONTACT_CARD.title,
      button: typeof parsed.button === "string" ? parsed.button : DEFAULT_CONTACT_CARD.button,
      phone: typeof parsed.phone === "string" ? parsed.phone : DEFAULT_CONTACT_CARD.phone,
      phoneHref:
        typeof parsed.phoneHref === "string"
          ? parsed.phoneHref
          : DEFAULT_CONTACT_CARD.phoneHref,
    }
  } catch {
    return { ...DEFAULT_CONTACT_CARD }
  }
}

export function saveContactCard(config) {
  const next = { ...config }
  if (typeof window === "undefined") return next

  window.localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(CONTACT_UPDATE_EVENT))
  return next
}

export function loadHeroChannels() {
  if (typeof window === "undefined") {
    return DEFAULT_HERO_CHANNELS.map((channel) => ({ ...channel }))
  }

  try {
    const stored = window.localStorage.getItem(HERO_CHANNELS_STORAGE_KEY)
    if (!stored) return DEFAULT_HERO_CHANNELS.map((channel) => ({ ...channel }))

    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return DEFAULT_HERO_CHANNELS.map((channel) => ({ ...channel }))

    const channels = parsed
      .map((channel, index) => ({
        id: String(channel.id || `channel-${index}`),
        label: String(channel.label || ""),
        value: String(channel.value || ""),
        href: String(channel.href || ""),
      }))
      .filter((channel) => channel.label.trim())

    return channels.length ? channels : DEFAULT_HERO_CHANNELS.map((channel) => ({ ...channel }))
  } catch {
    return DEFAULT_HERO_CHANNELS.map((channel) => ({ ...channel }))
  }
}

export function saveHeroChannels(channels) {
  const next = channels.map((channel) => ({ ...channel }))
  if (typeof window === "undefined") return next

  window.localStorage.setItem(HERO_CHANNELS_STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(HERO_CHANNEL_UPDATE_EVENT))
  return next
}
