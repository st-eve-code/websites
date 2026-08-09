import { decodeEntities, parsePrice, slugify, stripTags } from "../common.mjs"
import { normalizeCategory } from "./categories.mjs"

const DATA_ATTR_RE = /:data="([^"]+)"/g

export function extractJsonBlobs(html) {
  const blobs = []
  for (const m of html.matchAll(DATA_ATTR_RE)) {
    const raw = decodeEntities(m[1])
    try {
      blobs.push(JSON.parse(raw))
    } catch {
      /* skip malformed blobs */
    }
  }
  return blobs
}

export function parseGunsComHTML(html, sourceUrlBase = "https://www.guns.com") {
  const guns = []
  const seen = new Set()

  for (const blob of extractJsonBlobs(html)) {
    const items = Array.isArray(blob.items) ? blob.items : []
    for (const item of items) {
      const p = item.product
      if (!p || !p.name || !item.price) continue
      if (p.product_type && p.product_type !== "firearms") continue
      if (p.category && /suppressor|silencer|parts|accessor|magazine|ammo/i.test(p.category)) continue

      const listingId = String(item.listingId ?? item.gsin ?? p.productId ?? p.sku ?? "")
      const key = listingId
      if (!key || seen.has(key)) continue
      seen.add(key)

      const specs = p.specs ?? {}
      const conditionNote = item.sub_condition || undefined
      const msrp = parsePrice(p.msrp)
      const promoOld = item.promotion?.oldPrice ? parsePrice(item.promotion.oldPrice) : null

      const id = `guns-${slugify(`${p.manufacturer}-${p.model}-${key}`)}`

      const tags = [
        ...(p.collections ?? []),
        p.category,
        p.subCategory,
        p.manufacturer,
        specs["Caliber"],
        specs["Action"],
      ]
        .filter(Boolean)
        .map((t) => String(t).toLowerCase())

      guns.push({
        id,
        name: p.name,
        manufacturer: p.manufacturer ?? "",
        model: p.model ?? p.name,
        category: normalizeCategory(p.category ?? p.name),
        subCategory: p.subCategory ?? "",
        price: parsePrice(item.price),
        msrp: msrp ?? promoOld ?? undefined,
        condition: item.condition === "new" ? "new" : "used",
        conditionNote,
        image: (item.img ?? p.img ?? "").replace(/^http:/, "https:"),
        gallery: [item.img, p.img].filter(Boolean).map((u) => u.replace(/^http:/, "https:")),
        specs,
        description: stripTags(p.description).replace(/\s+/g, " ").trim(),
        rating: p.rating?.count ? { value: p.rating.value, count: p.rating.count } : undefined,
        source: "guns",
        sourceUrl: `${sourceUrlBase}${p.link ?? ""}`,
        seller: item.dealer || undefined,
        location: undefined,
        tags,
        updatedAt: item.createdDate || undefined,
      })
    }
  }

  return guns
}
