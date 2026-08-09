import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import {
  fetchWaybackRedirect,
  httpGet,
  loadExisting,
  saveGuns,
  sleep,
  withRetry,
  CDX,
  RAW_DIR,
  ensureDir,
} from "./common.mjs"
import { parseGunsComHTML } from "./scrapers/gunscom.mjs"
import { parseGunsInternationalHTML } from "./scrapers/gunsinternational.mjs"
import { parseReliableGunHTML } from "./scrapers/reliablegun.mjs"

const CACHE_DIR = path.join(RAW_DIR, "pages")

function parseArgs() {
  const args = process.argv.slice(2)
  const get = (name) => {
    const i = args.indexOf(`--${name}`)
    return i >= 0 ? args[i + 1] : undefined
  }
  return {
    source: get("source") ?? "all",
    limitUrls: get("limit-urls") ? Number(get("limit-urls")) : 120,
    fresh: args.includes("--fresh"),
  }
}

const GUNS_COM_LISTINGS = [
  "https://www.guns.com/",
  "https://www.guns.com/firearms",
  "https://www.guns.com/firearms/all",
  "https://www.guns.com/firearms/1911",
  "https://www.guns.com/firearms/2011",
  "https://www.guns.com/firearms/ak-47-rifles",
  "https://www.guns.com/firearms/4th-of-july-gun-deals",
  "https://www.guns.com/firearms/all?product.category=HANDGUNS",
  "https://www.guns.com/firearms/all?product.category=RIFLES",
  "https://www.guns.com/firearms/all?product.category=SHOTGUNS",
  "https://www.guns.com/firearms/all?product.manufacturer=GLOCK",
  "https://www.guns.com/firearms/all?product.manufacturer=SMITH%20%26%20WESSON%2CSMITH%20AND%20WESSON",
  "https://www.guns.com/firearms/all?product.manufacturer=SIG%20SAUER",
  "https://www.guns.com/firearms/all?product.manufacturer=RUGER",
  "https://www.guns.com/firearms/all?product.manufacturer=BERETTA",
  "https://www.guns.com/firearms/all?product.manufacturer=KIMBER",
  "https://www.guns.com/firearms/all?product.manufacturer=SPRINGFIELD%2CSPRINGFIELD%20ARMORY&product.category=RIFLES",
  "https://www.guns.com/firearms/all?product.manufacturer=CZ%2CCZ-USA&product.category=RIFLES",
  "https://www.guns.com/firearms/1911?page=1",
  "https://www.guns.com/firearms/1911?page=2",
  "https://www.guns.com/used-guns",
  "https://www.guns.com/used-guns/new-arrivals",
  "https://www.guns.com/used-guns/certified-used",
  "https://www.guns.com/deals/fee-free",
  "https://www.guns.com/handguns",
  "https://www.guns.com/rifles",
  "https://www.guns.com/shotguns",
]

const GI_CATEGORIES = [
  "https://www.gunsinternational.com/",
  "https://www.gunsinternational.com/guns-for-sale-online/new-guns-for-sale-today.cfm",
  "https://www.gunsinternational.com/guns-for-sale-online/handguns-for-sale.cfm?gid=4",
  "https://www.gunsinternational.com/guns-for-sale-online/pistols-for-sale.cfm?gid=7",
  "https://www.gunsinternational.com/guns-for-sale-online/revolvers-for-sale.cfm?gid=8",
  "https://www.gunsinternational.com/guns-for-sale-online/rifles.cfm?gid=5",
  "https://www.gunsinternational.com/guns-for-sale-online/rifles-for-sale.cfm?gid=5",
  "https://www.gunsinternational.com/guns-for-sale-online/shotguns.cfm?gid=6",
  "https://www.gunsinternational.com/guns-for-sale-online/shotguns-for-sale.cfm?gid=6",
  "https://www.gunsinternational.com/guns-for-sale-online/nfa.cfm?gid=1764",
  "https://www.gunsinternational.com/guns-for-sale-online/gun-parts-accessories.cfm?gid=2",
  "https://www.gunsinternational.com/guns-for-sale-online/new-guns-for-sale-this-week.cfm",
]

async function discoverReliableGunUrls(maxResults = 30) {
  const params = new URLSearchParams({
    url: "www.reliablegun.com/firearms",
    matchType: "prefix",
    output: "json",
    filter: "statuscode:200",
    fl: "original",
    collapse: "urlkey",
    limit: String(maxResults),
  })
  const rows = JSON.parse(await withRetry(() => httpGet(`${CDX}?${params.toString()}`)))
  return (Array.isArray(rows) ? rows.slice(1).map((r) => r[0]) : [])
    .filter((u) => /^https:\/\/(www\.)?reliablegun\.com\/firearms/.test(u))
}

function giPaginationLinks(html) {
  const links = new Set()
  for (const m of html.matchAll(/href="([^"]*guns-for-sale-online\/[^"]*_p\d+_o\d+\.cfm)"/g)) {
    links.add(m[1].replace(/^.*?web\.archive\.org\/web\/\d+\//, ""))
  }
  for (const m of html.matchAll(/href="([^"]*guns-for-sale-online\/[a-z0-9-]+\.cfm\?gid=\d+)"/g)) {
    links.add(m[1].replace(/^.*?web\.archive\.org\/web\/\d+\//, ""))
  }
  return [...links]
}

function cachePath(url) {
  const h = crypto.createHash("sha1").update(url).digest("hex").slice(0, 20)
  return path.join(CACHE_DIR, `${h}.html`)
}

async function loadPage(url, src, useCache = true) {
  const file = cachePath(url)
  if (useCache && fs.existsSync(file)) {
    return fs.readFileSync(file, "utf-8")
  }
  const year = src === "guns" ? "2025" : src === "gunsinternational" ? "2026" : "2026"
  const { html } = await fetchWaybackRedirect(url, year)
  ensureDir(CACHE_DIR)
  fs.writeFileSync(file, html)
  await sleep(1500)
  return html
}

async function run() {
  const opts = parseArgs()
  ensureDir(CACHE_DIR)

  const merged = new Map((opts.fresh ? [] : loadExisting()).map((g) => [g.id, g]))
  const queue = []
  const seen = new Set()
  const sources = opts.source === "all" ? ["guns", "gunsinternational", "reliablegun"] : opts.source.split(",")

  if (sources.includes("guns")) {
    for (const u of GUNS_COM_LISTINGS) queue.push({ url: u, src: "guns" })
  }
  if (sources.includes("gunsinternational")) {
    for (const u of GI_CATEGORIES) queue.push({ url: u, src: "gunsinternational" })
  }
  if (sources.includes("reliablegun")) {
    const urls = await discoverReliableGunUrls()
    for (const u of urls) queue.push({ url: u, src: "reliablegun" })
    queue.push({ url: "https://www.reliablegun.com/firearms", src: "reliablegun" })
    console.log(`[reliablegun] discovered ${urls.length} archived URLs`)
  }

  let fetched = 0
  while (queue.length > 0 && fetched < opts.limitUrls) {
    const { url, src } = queue.shift()
    if (seen.has(url)) continue
    seen.add(url)
    fetched++

    try {
      const html = await loadPage(url, src)
      let guns = []
      if (src === "guns") guns = parseGunsComHTML(html)
      else if (src === "gunsinternational") {
        guns = parseGunsInternationalHTML(html)
        for (const link of giPaginationLinks(html)) {
          if (!seen.has(link) && queue.length < opts.limitUrls * 2) {
            queue.push({ url: link, src })
          }
        }
      } else if (src === "reliablegun") guns = parseReliableGunHTML(html)

      let added = 0
      for (const g of guns) {
        if (!merged.has(g.id)) {
          merged.set(g.id, g)
          added++
        }
      }
      console.log(
        `[${src}] (${fetched}/${opts.limitUrls}) ${url.slice(0, 90)} → ${guns.length} parsed, ${added} new (catalog: ${merged.size})`,
      )
    } catch (err) {
      console.log(`[${src}] (${fetched}/${opts.limitUrls}) ${url.slice(0, 90)} → skip: ${err.message}`)
    }
  }

  console.log(`\nDone. Fetched ${fetched} pages, catalog has ${merged.size} guns.`)
  saveGuns([...merged.values()])
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
