import { useEffect, useRef, useState } from "react"
import { videoUrl } from "../lib/mediaUrl"

// HEVC 同码率画质约为 H.264 的两倍，但并非所有浏览器都能解。先探测再决定用哪个源。
const HEVC_TYPES = [
  'video/mp4; codecs="hvc1.1.6.L150.B0"',
  'video/mp4; codecs="hev1.1.6.L150.B0"',
]
let hevcSupport = null

// index.html 里的启动层（纯 HTML，不等 JS/CSS）。React 这边一旦真的出画就把它关掉，
// 避免两层视频同时解码，同时保证从启动层切到正片是"接上"而不是"闪一下"。
// 先 is-fading 淡出、再 is-off 移除：直接 display:none 是硬切，肉眼就是"抽一下"。
const BOOT_FADE_MS = 450
function dismissBoot() {
  if (typeof document === "undefined") return
  const boot = document.getElementById("boot")
  if (!boot || boot.classList.contains("is-off") || boot.classList.contains("is-fading")) return
  boot.classList.add("is-fading")
  boot.querySelector("video")?.pause()
  window.setTimeout(() => boot.classList.add("is-off"), BOOT_FADE_MS + 30)
}

function supportsHevc() {
  if (hevcSupport !== null) return hevcSupport
  if (typeof document === "undefined") return false
  const probe = document.createElement("video")
  hevcSupport = HEVC_TYPES.some((type) => probe.canPlayType(type) !== "")
  return hevcSupport
}

export default function AutoPlayVideo({
  src,
  hevcSrc,
  previewSrc,
  poster,
  className = "",
  ariaLabel = "汽车背景影片",
  eager = false,
}) {
  const previewRef = useRef(null)
  const hdRef = useRef(null)
  const activeRef = useRef(eager)
  const hdReadyRef = useRef(false)
  const hdVisibleRef = useRef(false)
  const previewHiddenRef = useRef(false)
  const [hdReady, setHdReady] = useState(false)
  const [previewHidden, setPreviewHidden] = useState(false)
  // 正片层是否真的出画。首屏在这之前保持全透明，好让 index.html 的启动层一直露着——
  // 否则交接瞬间就是硬切（旧帧跳到新帧，肉眼就是"卡一下"）。
  const [live, setLive] = useState(false)
  const [hdFailed, setHdFailed] = useState(false)
  const [previewFailed, setPreviewFailed] = useState(false)

  // 支持 HEVC 就用高清版；onError 时回落到 src（全平台可播的 H.264）
  const preferredSrc = hevcSrc && supportsHevc() ? hevcSrc : src
  const resolvedSrc = videoUrl(preferredSrc)
  const resolvedPreview = videoUrl(previewSrc)
  const resolvedPoster = videoUrl(poster)

  useEffect(() => {
    setHdFailed(false)
    setPreviewFailed(false)
  }, [src, hevcSrc, previewSrc])

  const tryPlay = (video) => {
    if (!video) return
    const promise = video.play()
    if (promise) promise.catch(() => {})
  }
  useEffect(() => {
    const preview = previewRef.current
    const hd = hdRef.current
    if (!hd) return undefined
    if (!preview) activeRef.current = true

    const timers = []
    let hdStarted = false
    let previewLoaded = false

    const configure = (video, preload) => {
      if (!video) return
      video.muted = true
      video.defaultMuted = true
      video.playsInline = true
      video.setAttribute("muted", "")
      video.setAttribute("playsinline", "")
      video.preload = preload
    }

    const tryPlayActive = () => {
      if (!activeRef.current) return
      if (preview) tryPlay(preview)
      if (hdReadyRef.current) tryPlay(hd)
    }

    // 只在第一次真的需要时才起播预览层；重复 load() 会把已经在播的画面打断重来，
    // 滚动时来回触发就会看起来一顿一顿的。
    const ensurePreview = () => {
      if (previewLoaded || !preview) return
      previewLoaded = true
      preview.preload = "auto"
      preview.load()
      tryPlayActive()
    }

    // 先让几百 KB 的预览层缓冲出余量，再放高清片下载。
    // 两个一起下时小文件会被几十 MB 的大文件抢死。
    // 另外刚进页面那几秒是"看起来卡不卡"的关键期，先让 HTML/JS/字体/小图把带宽用完。
    const HD_SETTLE_MS = 5000
    let activeSince = 0

    const startHd = () => {
      if (!hdStarted) {
        hdStarted = true
        hdReadyRef.current = true
        hd.preload = "auto"
        hd.load()
      }
      tryPlayActive()
    }

    const queueHdStart = () => {
      if (!activeSince) activeSince = performance.now()
      if (hdStarted) return
      const kick = () => {
        if (hdStarted) return
        if (performance.now() - activeSince < HD_SETTLE_MS) {
          timers.push(window.setTimeout(kick, 400))
          return
        }
        if (!preview) return startHd()
        const ahead = preview.buffered.length
          ? preview.buffered.end(preview.buffered.length - 1) - preview.currentTime
          : 0
        if (ahead >= 3 || preview.error) return startHd()
        timers.push(window.setTimeout(kick, 400))
      }
      timers.push(window.setTimeout(kick, 400))
    }

    const hidePreview = () => {
      if (previewHiddenRef.current) return
      previewHiddenRef.current = true
      timers.push(
        window.setTimeout(() => {
          if (!previewHiddenRef.current) return
          preview?.pause()
          setPreviewHidden(true)
        }, 1000),
      )
    }

    const restorePreview = () => {
      if (!previewHiddenRef.current) return
      previewHiddenRef.current = false
      setPreviewHidden(false)
      tryPlay(preview)
    }

    // 高清层码率经常高于当前带宽（首屏 4K 是 5.1Mbps），所以不能"能播就切"。
    // 只有真的缓冲出余量才把画面交给高清层，否则宁可停在流畅的预览层。
    const HD_BUFFER_AHEAD = 3

    const hdHealthy = () => {
      if (!hd || hd.paused || hd.readyState < 3 || hd.currentTime <= 0.08) return false
      const ahead = hd.buffered.length
        ? hd.buffered.end(hd.buffered.length - 1) - hd.currentTime
        : 0
      return ahead >= HD_BUFFER_AHEAD
    }

    const syncLayers = () => {
      if (!activeRef.current) return
      const healthy = hdHealthy()
      if (healthy !== hdVisibleRef.current) {
        hdVisibleRef.current = healthy
        setHdReady(healthy)
      }
      if (healthy) hidePreview()
      else restorePreview()
    }

    const handleHdCanPlay = () => {
      if (!activeRef.current) return
      hdReadyRef.current = true
      tryPlay(hd)
    }

    const handleHdTimeUpdate = () => {
      if (activeRef.current && hdReadyRef.current) syncLayers()
    }

    const handleHdStall = () => {
      if (activeRef.current) syncLayers()
    }

    const handlePreviewReady = () => {
      tryPlayActive()
    }

    // 交接：启动层淡出的同一帧把正片层淡入，两层重叠 0.45s 做交叉溶解。
    const markLive = () => {
      setLive(true)
      dismissBoot()
    }

    // 交接时机不能用 playing：它在"开始播"时就到，可能比第一帧真正画出来更早。
    // 那一刻启动层已经撤掉、正片层还没出画，中间就是一帧黑屏。
    // requestVideoFrameCallback 是"这一帧已经上屏"的回调，用它才接得上。
    const markLiveOnPaint = (video) => {
      if (!video) return
      if (typeof video.requestVideoFrameCallback !== "function") {
        video.addEventListener("playing", markLive)
        return
      }
      video.requestVideoFrameCallback(() => markLive())
    }

    const handleFirstInteraction = () => {
      tryPlayActive()
      window.removeEventListener("pointerdown", handleFirstInteraction)
    }

    // 非首屏的预览层先只取元数据，滚到跟前再真正开下，别让第二页在首页阶段就抢带宽。
    configure(preview, eager ? "auto" : "metadata")
    configure(hd, "metadata")
    preview?.addEventListener("loadeddata", handlePreviewReady)
    preview?.addEventListener("canplay", handlePreviewReady)
    markLiveOnPaint(preview)
    hd.addEventListener("canplay", handleHdCanPlay)
    markLiveOnPaint(hd)
    hd.addEventListener("timeupdate", handleHdTimeUpdate)
    hd.addEventListener("progress", handleHdStall)
    hd.addEventListener("waiting", handleHdStall)
    hd.addEventListener("stalled", handleHdStall)
    window.addEventListener("pointerdown", handleFirstInteraction)

    activeRef.current = eager

    // 提前一屏开始准备，等滚到跟前时已经在播，而不是到了才下载。
    // 只做"开始"，不做"停止"：一旦开始下载就不中途掐断，
    // 否则来回滚动会把几十 MB 的高清片反复从头下，越滑越卡。
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        activeRef.current = true
        ensurePreview()
        tryPlayActive()
        queueHdStart()
      },
      { threshold: 0, rootMargin: "100% 0px" },
    )
    nearObserver.observe(preview || hd)

    ;[300, 800, 1500].forEach((delay) => {
      timers.push(
        window.setTimeout(() => {
          if (activeRef.current) tryPlayActive()
        }, delay),
      )
    })

    if (eager) {
      ensurePreview()
      queueHdStart()
    }

    return () => {
      nearObserver.disconnect()
      timers.forEach((timer) => window.clearTimeout(timer))
      window.removeEventListener("pointerdown", handleFirstInteraction)
      preview?.removeEventListener("loadeddata", handlePreviewReady)
      preview?.removeEventListener("canplay", handlePreviewReady)
      preview?.removeEventListener("playing", markLive)
      hd.removeEventListener("canplay", handleHdCanPlay)
      hd.removeEventListener("playing", markLive)
      hd.removeEventListener("timeupdate", handleHdTimeUpdate)
      hd.removeEventListener("progress", handleHdStall)
      hd.removeEventListener("waiting", handleHdStall)
      hd.removeEventListener("stalled", handleHdStall)
    }
  }, [eager, resolvedSrc, resolvedPreview])

  const mediaClass = "progressive-video__media progressive-video__media--"

  return (
    <div className={`progressive-video ${live ? "is-live" : ""} ${className}`}>
      {previewSrc && (
        <video
          ref={previewRef}
          className={`${mediaClass}preview ${previewHidden ? "is-hidden" : ""}`}
          src={previewFailed ? previewSrc : resolvedPreview}
          onError={() => setPreviewFailed(true)}
          aria-hidden="true"
          autoPlay={eager}
          muted
          defaultMuted
          loop
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          tabIndex={-1}
        />
      )}
      <video
        ref={hdRef}
        className={`${mediaClass}hd ${hdReady ? "is-ready" : ""}`}
        src={hdFailed ? src : resolvedSrc}
        onError={() => setHdFailed(true)}
        poster={resolvedPoster}
        aria-label={ariaLabel}
        muted
        defaultMuted
        loop
        playsInline
        preload={eager ? "auto" : "metadata"}
        controls={false}
        disablePictureInPicture
        tabIndex={-1}
      />
    </div>
  )
}
