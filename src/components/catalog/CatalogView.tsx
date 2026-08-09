"use client"

import { useMemo, useState } from "react"
import type { Condition, Gun } from "@/types/gun"
import { filterGuns, sortGuns, type SortKey } from "@/lib/search"
import GunCard from "./GunCard"
import Reveal from "@/components/animations/Reveal"

interface CatalogViewProps {
  guns: Gun[]
}

export default function CatalogView({ guns }: CatalogViewProps) {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("featured")
  const [manufacturers, setManufacturers] = useState<string[]>([])
  const [conditions, setConditions] = useState<Condition[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])

  const manufacturersList = useMemo(() => {
    const set = new Set(guns.map((g) => g.manufacturer).filter(Boolean))
    return [...set].sort()
  }, [guns])

  const calibersList = useMemo(() => {
    const set = new Set(
      guns
        .map((g) => g.specs["Caliber"] ?? g.specs["caliber"] ?? "")
        .filter(Boolean)
        .map((c) => c.toUpperCase()),
    )
    return [...set].sort()
  }, [guns])

  const [calibers, setCalibers] = useState<string[]>([])

  const toggle = <T,>(list: T[], value: T, setter: (v: T[]) => void) => {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  const results = useMemo(() => {
    const filtered = filterGuns(guns, {
      query,
      manufacturer: manufacturers,
      conditions,
      calibers,
      priceMin: priceRange[0],
      priceMax: priceRange[1],
    })
    return sortGuns(filtered, sort)
  }, [guns, query, sort, manufacturers, conditions, calibers, priceRange])

  const clearAll = () => {
    setQuery("")
    setManufacturers([])
    setConditions([])
    setCalibers([])
    setPriceRange([0, 100000])
  }

  const hasActiveFilters =
    query !== "" || manufacturers.length > 0 || conditions.length > 0 || calibers.length > 0

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-6 lg:sticky lg:top-20 lg:h-fit">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guns…"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
        />

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Condition</h3>
          <div className="space-y-1.5">
            {(["new", "used"] as Condition[]).map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={conditions.includes(c)}
                  onChange={() => toggle(conditions, c, setConditions)}
                  className="accent-amber-500"
                />
                {c === "new" ? "New" : "Used"}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Manufacturer</h3>
          <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {manufacturersList.map((m) => (
              <label key={m} className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={manufacturers.includes(m)}
                  onChange={() => toggle(manufacturers, m, setManufacturers)}
                  className="accent-amber-500"
                />
                {m}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Caliber</h3>
          <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
            {calibersList.slice(0, 60).map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={calibers.includes(c)}
                  onChange={() => toggle(calibers, c, setCalibers)}
                  className="accent-amber-500"
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-sm font-medium text-amber-400 hover:text-amber-300"
          >
            Clear all filters
          </button>
        )}
      </aside>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {results.length} {results.length === 1 ? "firearm" : "firearms"}
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        {results.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((gun, i) => (
              <Reveal key={gun.id} delay={Math.min(i * 0.03, 0.3)}>
                <GunCard gun={gun} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 text-center text-sm text-zinc-500">
            No firearms match the current filters.
          </p>
        )}
      </div>
    </div>
  )
}
