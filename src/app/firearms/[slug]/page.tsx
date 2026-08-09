import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Reveal from "@/components/animations/Reveal"
import { getAllGuns, getGunById } from "@/lib/guns"
import { CATEGORY_MAP } from "@/lib/categories"
import { formatPrice } from "@/lib/format"

const SOURCE_LABELS: Record<string, string> = {
  guns: "Guns.com",
  gunsinternational: "Guns International",
  reliablegun: "Reliable Gun",
}

export function generateStaticParams() {
  return getAllGuns().map((gun) => ({ slug: gun.id }))
}

export async function generateMetadata(props: PageProps<"/firearms/[slug]">): Promise<Metadata> {
  const { slug } = await props.params
  const gun = getGunById(slug)
  if (!gun) return { title: "Not found" }
  return { title: `${gun.manufacturer} ${gun.model}` }
}

export default async function GunDetailPage(props: PageProps<"/firearms/[slug]">) {
  const { slug } = await props.params
  const gun = getGunById(slug)
  if (!gun) notFound()

  const specEntries = Object.entries(gun.specs).filter(([, v]) => v !== "" && v != null)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-amber-400">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/firearms" className="hover:text-amber-400">Firearms</Link>
        <span className="mx-2">/</span>
        <Link href={`/firearms/category/${gun.category}`} className="hover:text-amber-400">
          {CATEGORY_MAP[gun.category]?.label ?? gun.category}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <Reveal>
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            {gun.image ? (
              <Image src={gun.image} alt={gun.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-4" />
            ) : (
              <div className="flex h-full items-center justify-center text-8xl text-zinc-700">▪</div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              {gun.manufacturer}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-zinc-100">{gun.model}</h1>
            <p className="mt-1 text-zinc-400">{gun.name}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`rounded px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                  gun.condition === "new" ? "bg-emerald-600/90 text-white" : "bg-sky-600/90 text-white"
                }`}
              >
                {gun.condition === "new" ? "New" : gun.conditionNote || "Used"}
              </span>
              <span className="rounded bg-zinc-800 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-300">
                {CATEGORY_MAP[gun.category]?.label}
              </span>
              {gun.subCategory && (
                <span className="rounded bg-zinc-800 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-300">
                  {gun.subCategory}
                </span>
              )}
              {gun.rating?.count ? (
                <span className="flex items-center gap-1 rounded bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                  <span className="text-amber-400">★</span> {gun.rating.value.toFixed(1)} ({gun.rating.count})
                </span>
              ) : null}
            </div>

            <div className="mt-6 flex items-end gap-4">
              <span className="text-4xl font-extrabold text-zinc-50">{formatPrice(gun.price)}</span>
              {gun.msrp && gun.msrp > gun.price ? (
                <span className="pb-1 text-lg text-zinc-500 line-through">{formatPrice(gun.msrp)}</span>
              ) : null}
            </div>

            {gun.seller || gun.location ? (
              <p className="mt-3 text-sm text-zinc-500">
                {[gun.seller, gun.location].filter(Boolean).join(" · ")}
              </p>
            ) : null}

            <p className="mt-6 text-sm leading-7 text-zinc-300">{gun.description}</p>

            <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-xs text-zinc-500">
              Listed from{" "}
              <a
                href={gun.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-amber-400 hover:text-amber-300"
              >
                {SOURCE_LABELS[gun.source] ?? gun.source}
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      {specEntries.length > 0 && (
        <Reveal className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-zinc-100">Specifications</h2>
          <div className="grid gap-px overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800 sm:grid-cols-2">
            {specEntries.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between bg-zinc-900 px-4 py-3">
                <span className="text-sm text-zinc-500">{label}</span>
                <span className="text-sm font-medium text-zinc-200">{value}</span>
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  )
}
