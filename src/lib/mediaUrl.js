// GitHub Pages 在国内带宽很差（实测 130KB/s~1MB/s 且抖动），视频改走可达的代理。
// Cloudflare Pages 上视频就放在本域，直连更快，不需要代理。
const PROXY_BASE =
  "https://gh-proxy.com/https://raw.githubusercontent.com/999op-mj/999op-mj.github.io/main/public"

function needsProxy() {
  if (import.meta.env.DEV) return false
  if (typeof window === "undefined") return false
  return window.location.hostname.endsWith("github.io")
}

export function videoUrl(path) {
  if (!path || !needsProxy()) return path
  const clean = path.split("?")[0]
  return clean.startsWith("/assets/") ? PROXY_BASE + clean : path
}
