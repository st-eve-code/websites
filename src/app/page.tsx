import Link from "next/link"
import Reveal from "@/components/animations/Reveal"
import Hero from "@/components/home/Hero"
import GunCard from "@/components/catalog/GunCard"
import { CATEGORIES } from "@/lib/categories"
import { getAllGuns, getFeaturedGuns } from "@/lib/guns"

export default function Home() {
  const featured = getFeaturedGuns(8)
  const total = getAllGuns().length

  return (
    <div>
      <Hero total={total} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">Browse by Category</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Handguns, rifles, shotguns and more — organized the way collectors think.
              </p>
            </div>
            <Link href="/firearms" className="text-sm font-medium text-amber-400 hover:text-amber-300">
              View all →
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.slug} delay={i * 0.05}>
              <Link
                href={`/firearms/category/${cat.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-all duration-300 hover:border-amber-500/60"
              >
                <div>
                  <h3 className="text-lg font-bold text-zinc-100 group-hover:text-amber-300">
                    {cat.label}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500">{cat.description}</p>
                </div>
                <span className="mt-6 text-sm font-semibold text-amber-400">Explore →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">Top Rated</h2>
              <p className="mt-1 text-sm text-zinc-500">Highest-rated firearms in the catalog.</p>
            </div>
            <Link href="/firearms" className="text-sm font-medium text-amber-400 hover:text-amber-300">
              View all →
            </Link>
          </div>
        </Reveal>

        {featured.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((gun, i) => (
              <Reveal key={gun.id} delay={i * 0.05}>
                <GunCard gun={gun} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center text-sm text-zinc-500">
            Catalog is empty — run the scrape pipeline to populate it.
          </p>
        )}
      </section>
    </div>
  )
}
