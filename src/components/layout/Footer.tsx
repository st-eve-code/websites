import Link from "next/link"
import { CATEGORIES } from "@/lib/categories"

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-bold text-zinc-100">Arsenal</p>
          <p className="mt-2 text-sm text-zinc-400">
            A catalog of firearms with specifications, pricing and details aggregated from public sources.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Categories</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/firearms/category/${c.slug}`} className="transition-colors hover:text-amber-400">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Sources</p>
          <p className="mt-3 text-sm text-zinc-400">
            Data aggregated for reference and informational purposes.
          </p>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Arsenal. Reference catalog only.
      </div>
    </footer>
  )
}
