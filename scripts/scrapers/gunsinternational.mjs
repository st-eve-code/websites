import { parsePrice, stripTags } from "../common.mjs"
import { normalizeCategory, inferSubCategory } from "./categories.mjs"

const LISTING_RE = /<div class="box listing_guts"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g

function absUrl(href) {
  const m = href.match(/https?:\/\/[^/]+\/web\/\d+\/(?:https?:)?\/{0,2}(.*)$/)
  if (m && m[1]) return `https://${m[1]}`
  return href
}

function cleanImage(src) {
  const m = src.match(/im_\/(https?:.*)$/)
  if (m) return m[1].replace(/^http:/, "https:")
  return src.replace(/^http:/, "https:")
}

export function parseGunsInternationalHTML(html, defaultCategory = "other") {
  const guns = []
  const seen = new Set()

  for (const block of html.matchAll(LISTING_RE)) {
    const b = block[0]

    const titleMatch = b.match(/class="title_link[^"]*"[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/)
    const hrefMatch = b.match(/<a href="([^"]+)"[\s\S]*?class="img-container"/) ||
      b.match(/class="title_link title_list"[^>]*>\s*<a href="([^"]+)"/)
    const imgMatch = b.match(/<img[^>]*src="([^"]+)"[^>]*class=""/)
    const priceMatch = b.match(/class="price-top"[\s\S]*?>\s*\$([\d,]+(?:\.\d+)?)/) ||
      b.match(/price-inline[\s\S]*?\$\s?([\d,]+(?:\.\d+)?)/)
    const giMatch = b.match(/<strong>GI#:<\/strong>\s*(\d+)/)
    const descMatch = b.match(/class="desc-block">([\s\S]*?)<a href=/)
    const sellerMatch = b.match(/<strong>Seller:\s*<a[^>]*>([\s\S]*?)<\/a>/)

    const title = titleMatch ? stripTags(titleMatch[1]) : ""
    const href = hrefMatch ? absUrl(hrefMatch[1]) : ""
    if (!title || !href) continue

    const gunId = giMatch ? giMatch[1] : (href.match(/gun_id=(\d+)/) ?? [])[1] ?? ""
    if (!gunId || seen.has(gunId)) continue
    seen.add(gunId)

    const urlPath = href.replace("https://www.gunsinternational.com/", "")
    const catRaw = (urlPath.match(/^guns-for-sale-online\/([a-z0-9-]+)/) ?? [])[1] ?? ""
    const category = normalizeCategory(catRaw || title || defaultCategory)

    const image = imgMatch ? cleanImage(imgMatch[1]) : ""
    const price = priceMatch ? parsePrice(priceMatch[1]) : null
    const description = descMatch ? stripTags(descMatch[1]) : ""
    const seller = sellerMatch ? stripTags(sellerMatch[1]) : ""

    guns.push({
      id: `gi-${gunId}`,
      name: title,
      manufacturer: "",
      model: title,
      category,
      subCategory: inferSubCategory(title),
      price: price ?? 0,
      condition: /nib\b|new in box/i.test(title) ? "new" : "used",
      conditionNote: /nib\b|new in box/i.test(title) ? "NIB" : undefined,
      image,
      gallery: image ? [image] : [],
      specs: {},
      description,
      source: "gunsinternational",
      sourceUrl: href,
      seller: seller || undefined,
      tags: [
        ...title.toLowerCase().split(/[^a-z0-9]+/),
        catRaw,
        inferSubCategory(title).toLowerCase(),
      ].filter((t) => t.length > 1),
    })
  }

  return guns
}
