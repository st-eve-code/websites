import "server-only"

import fs from "node:fs"
import path from "node:path"
import type { Category, Gun } from "@/types/gun"

let cache: Gun[] | null = null

const DATA_FILE = path.join(process.cwd(), "data", "guns.json")

function load(): Gun[] {
  if (cache) return cache
  if (!fs.existsSync(DATA_FILE)) return []
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8")
    cache = JSON.parse(raw) as Gun[]
  } catch {
    cache = []
  }
  return cache
}

export function getAllGuns(): Gun[] {
  return load()
}

export function getGunById(id: string): Gun | undefined {
  return load().find((g) => g.id === id)
}

export function getGunsByCategory(category: Category): Gun[] {
  return load().filter((g) => g.category === category)
}

export function getGunsBySource(source: Gun["source"]): Gun[] {
  return load().filter((g) => g.source === source)
}

export function getManufacturers(): string[] {
  const set = new Set(load().map((g) => g.manufacturer).filter(Boolean))
  return [...set].sort()
}

export function getFeaturedGuns(count = 8): Gun[] {
  return [...load()]
    .sort((a, b) => (b.rating?.value ?? 0) - (a.rating?.value ?? 0))
    .slice(0, count)
}
