import Link from "next/link"
import type { Metadata } from "next"
import CatalogView from "@/components/catalog/CatalogView"
import { getGunsByCategory } from "@/lib/guns"
import { CATEGORY_MAP } from "@/lib/categories"
import type { Category } from "@/types/gun"
import { notFound } from "next/navigation"

const VALID_CATEGORIES = Object.keys(CATEGORY_MAP) as Category[]

export function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({ category }))
}

export async function generateMetadata(props: PageProps<"/firearms/category/[category]">): Promise<Metadata> {
  const { category } = await props.params
  const meta = CATEGORY_MAP[category as Category]
  if (!meta) return { title: "Category not found" }
  return { title: meta.label, description: meta.description }
}

export default async function CategoryPage(props: PageProps<"/firearms/category/[category]">) {
  const { category } = await props.params
  const meta = CATEGORY_MAP[category as Category]
  if (!meta) notFound()

  const guns = getGunsByCategory(category as Category)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-4 text-sm text-zinc-500">
        <Link href="/" className="hover:text-amber-400">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/firearms" className="hover:text-amber-400">Firearms</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-300">{meta.label}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">{meta.label}</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">{meta.description}</p>
      </div>

      <CatalogView guns={guns} />
    </div>
  )
}
