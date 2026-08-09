import type { Category, Gun } from "@/types/gun"

export interface CategoryMeta {
  slug: Category
  label: string
  description: string
  image?: string
}

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "handguns",
    label: "Handguns",
    description: "Pistols, revolvers and semiautomatic sidearms for defense, duty and sport.",
  },
  {
    slug: "rifles",
    label: "Rifles",
    description: "Bolt-action, lever-action, AR-platform and precision rifles for hunting and marksmanship.",
  },
  {
    slug: "shotguns",
    label: "Shotguns",
    description: "Pump, semi-auto, break-action and over/under shotguns for sport and hunting.",
  },
  {
    slug: "blackpowder",
    label: "Blackpowder",
    description: "Muzzleloaders and antique blackpowder arms for collectors and reenactors.",
  },
  {
    slug: "air-guns",
    label: "Air Guns",
    description: "Air rifles and air pistols for plinking and target practice.",
  },
  {
    slug: "other",
    label: "Other",
    description: "Frame parts, lowers, and firearms that don't fit the standard categories.",
  },
]

export const CATEGORY_MAP: Record<Category, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<Category, CategoryMeta>

export function normalizeCategory(raw: string): Category {
  const v = raw.toLowerCase()
  if (/hand|pistol|revolver|semi-auto/.test(v)) return "handguns"
  if (/rifle/.test(v)) return "rifles"
  if (/shotgun|gauge|gague/.test(v)) return "shotguns"
  if (/blackpowder|muzzle|antique|flintlock/.test(v)) return "blackpowder"
  if (/air/.test(v)) return "air-guns"
  return "other"
}

export function groupByCategory(guns: Gun[]): Partial<Record<Category, Gun[]>> {
  const groups: Partial<Record<Category, Gun[]>> = {}
  for (const gun of guns) {
    ;(groups[gun.category] ??= []).push(gun)
  }
  return groups
}
