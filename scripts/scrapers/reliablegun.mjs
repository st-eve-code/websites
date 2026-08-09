import { parsePrice, stripTags } from "../common.mjs"
import { normalizeCategory, inferSubCategory } from "./categories.mjs"

const PRODUCT_RE = /<div class="product-item" data-productid="(\d+)">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g

function cleanImage(src) {
  const m = src.match(/im_\/(https?:.*)$/)
  if (m) return m[1].replace(/^http:/, "https:")
  return src.replace(/^http:/, "https:")
}

function cleanSourceUrl(href) {
  const m = href.match(/(?:https?:\/\/[^/]+\/)?web\/\d+\/(https?:\/\/.*)$/)
  if (m) return m[1]
  return href.replace(/^https?:\/\/[^/]+/, "")
}

export function parseReliableGunHTML(html) {
  const guns = []
  const seen = new Set()

  for (const m of html.matchAll(PRODUCT_RE)) {
    const pid = m[1]
    const b = m[2]
    if (!pid || seen.has(pid)) continue
    seen.add(pid)

    const titleMatch = b.match(/<h2 class="product-title">\s*<a[^>]*>([\s\S]*?)<\/a>/)
    const hrefMatch = b.match(/<h2 class="product-title">\s*<a href="([^"]+)"/)
    const imgMatch = b.match(/<img class="product-overview-img"[^>]*src="([^"]+)"/)
    const priceMatch = b.match(/<span class="price actual-price">([^<]+)<\/span>/)

    const title = titleMatch ? stripTags(titleMatch[1]) : ""
    if (!title) continue

    const href = hrefMatch ? hrefMatch[1] : ""
    const sourcePath = cleanSourceUrl(href)
    const image = imgMatch ? cleanImage(imgMatch[1]) : ""
    const price = priceMatch ? parsePrice(priceMatch[1]) : null
    const pathCat = (sourcePath.match(/\/firearms\/([a-z0-9-]+)\//) ?? [])[1] ?? ""

    const category = normalizeCategory(`${pathCat} ${title}`)

    guns.push({
      id: `rg-${pid}`,
      name: title,
      manufacturer: "",
      model: title,
      category,
      subCategory: inferSubCategory(title),
      price: price ?? 0,
      condition: /pre[- ]?order/i.test(title) ? "new" : "new",
      conditionNote: /pre[- ]?order/i.test(title) ? "Pre-Order" : undefined,
      image,
      gallery: image ? [image] : [],
      specs: {},
      description: "",
      source: "reliablegun",
      sourceUrl: sourcePath.startsWith("http") ? sourcePath : `https://www.reliablegun.com${sourcePath}`,
      tags: [
        ...title.toLowerCase().split(/[^a-z0-9]+/),
        pathCat,
        inferSubCategory(title).toLowerCase(),
      ].filter((t) => t.length > 1),
    })
  }

  return guns
}
