import type { Metadata } from "next"
import CatalogView from "@/components/catalog/CatalogView"
import { getAllGuns } from "@/lib/guns"

export const metadata: Metadata = {
  title: "All Firearms",
  description: "Browse the full firearm catalog with specifications, pricing and descriptions.",
}

export default async function FirearmsPage() {
  const guns = getAllGuns()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">All Firearms</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Filter, sort and search the full catalog.
        </p>
      </div>
      <CatalogView guns={guns} />
    </div>
  )
}
