// 把 GitHub Pages 站点首屏的关键资源改写到 CDN。
//
// 背景：GitHub Pages 在国内实测 25~85KB/s，一张 1MB 的 CSS 背景图要 40 秒以上，
// 190KB 的首屏 JS 要 2~3 秒。改走 CDN 后同一张图 0.9 秒、JS 0.7 秒。
//
// 分两个阶段，因为 CSS 必须在推送到 CDN 分支之前就改写好：
//   node scripts/cdn-rewrite.mjs css   只改写 CSS 里的 url()（只需 MEDIA_BASE）
//   node scripts/cdn-rewrite.mjs html  只改写 index.html（需要 JS_BASE）
//
// 本地 build 不带环境变量，脚本直接跳过，dev 与本地预览不受影响。
import { readFileSync, writeFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

const mode = process.argv[2] || "all"
const JS_BASE = process.env.CDN_JS_BASE // 构建产物所在的 CDN 前缀
const MEDIA_BASE = process.env.CDN_MEDIA_BASE // public/assets 的 CDN 前缀

const dist = "dist"
const stats = { html: 0, css: 0 }

// CDN 挂掉时自动回退到本站原始路径，避免整站白屏
const BOOTSTRAP =
  "<script>window.__cdnFallback=function(p){var s=document.createElement('script');" +
  "s.type='module';s.crossOrigin='';s.src=p;document.head.appendChild(s)};</script>"

function rewriteCss() {
  if (!MEDIA_BASE) return console.log("[cdn-rewrite] 缺 CDN_MEDIA_BASE，跳过 CSS")
  for (const file of readdirSync(join(dist, "assets"))) {
    if (!file.endsWith(".css")) continue
    const path = join(dist, "assets", file)
    // 必须同时覆盖 /assets/ 与 /images/：CSS 托管在 CDN 上时，
    // 根相对路径会按 CSS 自己的域名解析（cdn.jsdelivr.net/images/... → 404）。
    const next = readFileSync(path, "utf8").replace(
      /url\(\s*(["']?)\/(assets|images)\//g,
      (_, quote, dir) => {
        stats.css += 1
        return `url(${quote}${MEDIA_BASE}/${dir}/`
      },
    )
    writeFileSync(path, next)
  }
  console.log(`[cdn-rewrite] CSS ${stats.css} 处`)
}

function rewriteHtml() {
  if (!JS_BASE || !MEDIA_BASE) return console.log("[cdn-rewrite] 缺 CDN 环境变量，跳过 html")
  const indexHtml = join(dist, "index.html")
  let html = readFileSync(indexHtml, "utf8")

  // 1) 统一改写：入口 js/css 走产物 CDN，图片等静态资源走媒体 CDN
  html = html.replace(/(["'])\/(assets|images)\/([^"']+)\1/g, (_, quote, dir, file) => {
    stats.html += 1
    const base = dir === "assets" && /\.(?:js|css)$/.test(file) ? JS_BASE : MEDIA_BASE
    return `${quote}${base}/${dir}/${file}${quote}`
  })

  // 2) 入口资源加回退；必须在第 1 步之后，否则回退路径会被再次改写
  const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  html = html.replace(
    new RegExp(`(<script[^>]*?src=")${escape(JS_BASE)}/([^"]+)"`, "g"),
    (_, prefix, file) =>
      `${prefix}${JS_BASE}/${file}" ` +
      `onerror="window.__cdnFallback&&window.__cdnFallback('/assets/${file}')"`,
  )
  html = html.replace(
    new RegExp(`(<link[^>]*?href=")${escape(JS_BASE)}/([^"]+)"`, "g"),
    (_, prefix, file) =>
      `${prefix}${JS_BASE}/${file}" onerror="this.onerror=null;this.href='/assets/${file}'"`,
  )

  if (!html.includes("__cdnFallback=function")) {
    html = html.replace("<head>", `<head>\n    ${BOOTSTRAP}`)
  }

  writeFileSync(indexHtml, html)
  console.log(`[cdn-rewrite] index.html ${stats.html} 处`)
}

if (mode === "css" || mode === "all") rewriteCss()
if (mode === "html" || mode === "all") rewriteHtml()
