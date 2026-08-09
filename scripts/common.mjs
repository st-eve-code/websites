import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(__dirname, "..")
export const DATA_DIR = path.join(ROOT, "data")
export const RAW_DIR = path.join(DATA_DIR, "raw")
export const OUT_FILE = path.join(DATA_DIR, "guns.json")

export const WAYBACK = "https://web.archive.org"
export const CDX = "https://web.archive.org/cdx/search/cdx"

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

export function decodeEntities(str) {
  return str
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ")
}

export function stripTags(str) {
  return (str ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export async function httpGet(url, headers = {}, timeoutMs = 45000) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, ...headers }, signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    return await res.text()
  } finally {
    clearTimeout(t)
  }
}

export async function httpGetBuffer(url, timeoutMs = 60000) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    return Buffer.from(await res.arrayBuffer())
  } finally {
    clearTimeout(t)
  }
}

export async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function withRetry(fn, retries = 3, baseDelay = 3000) {
  let lastErr
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      await sleep(baseDelay * (i + 1))
    }
  }
  throw lastErr
}

export async function closestSnapshot(originalUrl, opts = {}) {
  const { from, to, limit = 20, minTimestamp } = opts
  const params = new URLSearchParams({
    url: originalUrl,
    output: "json",
    filter: "statuscode:200",
    fl: "timestamp,original",
    limit: String(limit),
  })
  if (from) params.set("from", from)
  if (to) params.set("to", to)

  const rows = await withRetry(async () => {
    const text = await httpGet(`${CDX}?${params.toString()}`)
    const parsed = JSON.parse(text)
    return parsed
  })

  if (!Array.isArray(rows) || rows.length < 2) return null
  let candidates = rows.slice(1).map((r) => ({ timestamp: r[0], original: r[1] }))
  if (minTimestamp) candidates = candidates.filter((c) => c.timestamp >= minTimestamp)
  if (candidates.length === 0) return null
  candidates.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  return candidates[candidates.length - 1]
}

export async function fetchWayback(originalUrl, opts = {}) {
  const snap = opts.snapshot ?? (await closestSnapshot(originalUrl, opts))
  if (!snap) throw new Error(`No snapshot found for ${originalUrl}`)
  const snapshotUrl = `${WAYBACK}/web/${snap.timestamp}/${snap.original}`
  const html = await withRetry(() => httpGet(snapshotUrl))
  return { html, snapshotUrl, timestamp: snap.timestamp, originalUrl }
}

const SNAP_TS_RE = /\/web\/(\d{14})/

export async function fetchWaybackRedirect(originalUrl, year = "2") {
  const snapshotUrl = `${WAYBACK}/web/${year}/${originalUrl}`
  const res = await withRetry(async () => {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 60000)
    try {
      const r = await fetch(snapshotUrl, {
        redirect: "follow",
        headers: { "User-Agent": UA },
        signal: ctrl.signal,
      })
      if (!r.ok) throw new Error(`HTTP ${r.status} for ${snapshotUrl}`)
      return { url: r.url, text: await r.text() }
    } finally {
      clearTimeout(t)
    }
  })
  const ts = res.url.match(SNAP_TS_RE)?.[1] ?? ""
  return { html: res.text, snapshotUrl: res.url, timestamp: ts, originalUrl }
}

export function parsePrice(raw) {
  if (raw == null) return null
  if (typeof raw === "number") return raw
  const m = String(raw).replace(/,/g, "").match(/(\d+(?:\.\d+)?)/)
  return m ? Number(m[1]) : null
}

export function slugify(text) {
  return (text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
}

export function writeJson(file, data) {
  ensureDir(path.dirname(file))
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

export function loadExisting() {
  if (!fs.existsSync(OUT_FILE)) return []
  try {
    return JSON.parse(fs.readFileSync(OUT_FILE, "utf-8"))
  } catch {
    return []
  }
}

export function saveGuns(guns) {
  const seen = new Set()
  const deduped = guns.filter((g) => {
    if (seen.has(g.id)) return false
    seen.add(g.id)
    return true
  })
  deduped.sort((a, b) => a.name.localeCompare(b.name))
  writeJson(OUT_FILE, deduped)
  console.log(`Saved ${deduped.length} guns to ${OUT_FILE}`)
  return deduped
}
