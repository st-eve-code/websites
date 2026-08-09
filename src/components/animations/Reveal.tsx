"use client"

import { useRef, type ReactNode, useEffect } from "react"
import gsap from "gsap"

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}

export default function Reveal({ children, className, delay = 0, y = 32, once = true }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    gsap.fromTo(
      el,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        ease: "power3.out",
        paused: false,
      },
    )

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
            if (once) observer.unobserve(el)
          } else if (!once) {
            gsap.to(el, { opacity: 0, y })
          }
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [y, once, delay])

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}
