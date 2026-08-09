"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"

interface HeroProps {
  total: number
}

export default function Hero({ total }: HeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
    tl.fromTo(titleRef.current, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 1 })
      .fromTo(subRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
      .fromTo(ctaRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
  }, [])

  return (
    <section className="relative overflow-hidden border-b border-zinc-800 bg-zinc-900/40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.12),transparent_60%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <h1
          ref={titleRef}
          className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-zinc-50 sm:text-6xl"
        >
          The Firearms Reference Catalog
        </h1>
        <p ref={subRef} className="mt-6 max-w-2xl text-lg text-zinc-400">
          {total > 0
            ? `${total.toLocaleString()} firearms with full specifications, pricing and descriptions.`
            : "Full specifications, pricing and descriptions — ready to be populated."}
        </p>
        <div ref={ctaRef} className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/firearms"
            className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
          >
            Browse Firearms
          </Link>
          <Link
            href="/firearms/category/handguns"
            className="rounded-lg border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-amber-500/60 hover:text-amber-300"
          >
            Shop Handguns
          </Link>
        </div>
      </div>
    </section>
  )
}
