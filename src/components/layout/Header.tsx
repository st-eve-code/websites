import Link from "next/link"
import { CATEGORIES } from "@/lib/categories"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-100">
          <span className="text-amber-400">▪</span> Arsenal
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-300 md:flex">
          <Link href="/firearms" className="transition-colors hover:text-amber-400">
            All Firearms
          </Link>
          {CATEGORIES.slice(0, 4).map((c) => (
            <Link
              key={c.slug}
              href={`/firearms/category/${c.slug}`}
              className="transition-colors hover:text-amber-400"
            >
              {c.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
