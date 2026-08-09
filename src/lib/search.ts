import type { Category, Condition, Gun } from "@/types/gun"

export interface FilterState {
  category?: Category
  query?: string
  manufacturer?: string[]
  calibers?: string[]
  conditions?: Condition[]
  priceMin?: number
  priceMax?: number
  source?: Gun["source"]
}

export function extractCaliber(gun: Gun): string {
  const c = gun.specs["Caliber"] ?? gun.specs["caliber"] ?? ""
  return c.toUpperCase()
}

export function filterGuns(guns: Gun[], f: FilterState): Gun[] {
  let out = guns

  if (f.category) out = out.filter((g) => g.category === f.category)

  if (f.source) out = out.filter((g) => g.source === f.source)

  if (f.manufacturer?.length) {
    const m = f.manufacturer.map((x) => x.toUpperCase())
    out = out.filter((g) => m.includes(g.manufacturer.toUpperCase()))
  }

  if (f.conditions?.length) out = out.filter((g) => f.conditions!.includes(g.condition))

  if (f.calibers?.length) {
    const c = f.calibers.map((x) => x.toUpperCase())
    out = out.filter((g) => c.some((x) => extractCaliber(g).includes(x)))
  }

  if (f.priceMin != null) out = out.filter((g) => g.price >= f.priceMin!)
  if (f.priceMax != null) out = out.filter((g) => g.price <= f.priceMax!)

  if (f.query) {
    const q = f.query.toLowerCase()
    out = out.filter((g) => {
      return (
        g.name.toLowerCase().includes(q) ||
        g.manufacturer.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }

  return out
}

export type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc" | "rating"

export function sortGuns(guns: Gun[], key: SortKey): Gun[] {
  const out = [...guns]
  switch (key) {
    case "price-asc":
      return out.sort((a, b) => a.price - b.price)
    case "price-desc":
      return out.sort((a, b) => b.price - a.price)
    case "name-asc":
      return out.sort((a, b) => a.name.localeCompare(b.name))
    case "rating":
      return out.sort((a, b) => (b.rating?.value ?? 0) - (a.rating?.value ?? 0))
    case "featured":
    default:
      return out.sort((a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0))
  }
}
