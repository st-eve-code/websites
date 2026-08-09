import Link from "next/link"
import Image from "next/image"
import type { Gun } from "@/types/gun"
import { formatPrice } from "@/lib/format"

interface GunCardProps {
  gun: Gun
  priority?: boolean
}

export default function GunCard({ gun, priority = false }: GunCardProps) {
  const specLine = [gun.specs["Caliber"], gun.specs["Action"]].filter(Boolean).join(" · ")

  return (
    <Link
      href={`/firearms/${gun.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800">
        {gun.image ? (
          <Image
            src={gun.image}
            alt={gun.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-zinc-700">▪</div>
        )}
        <span
          className={`absolute left-3 top-3 rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
            gun.condition === "new"
              ? "bg-emerald-600/90 text-white"
              : "bg-sky-600/90 text-white"
          }`}
        >
          {gun.condition === "new" ? "New" : gun.conditionNote || "Used"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
          {gun.manufacturer}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-zinc-100 group-hover:text-amber-300">
          {gun.model}
        </h3>
        {specLine && <p className="mt-1 text-xs text-zinc-500">{specLine}</p>}

        <div className="mt-3 flex items-end justify-between border-t border-zinc-800 pt-3">
          <span className="text-lg font-bold text-zinc-100">{formatPrice(gun.price)}</span>
          {gun.rating?.count ? (
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <span className="text-amber-400">★</span>
              {gun.rating.value.toFixed(1)}
              <span className="text-zinc-600">({gun.rating.count})</span>
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
