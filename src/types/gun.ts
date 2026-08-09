export type Category =
  | "handguns"
  | "rifles"
  | "shotguns"
  | "blackpowder"
  | "air-guns"
  | "other"

export type Condition = "new" | "used"

export type Source = "gunsinternational" | "guns" | "reliablegun"

export interface GunRating {
  value: number
  count: number
}

export interface Gun {
  id: string
  name: string
  manufacturer: string
  model: string
  category: Category
  subCategory: string
  price: number
  msrp?: number
  condition: Condition
  conditionNote?: string
  image: string
  gallery?: string[]
  specs: Record<string, string>
  description: string
  rating?: GunRating
  source: Source
  sourceUrl: string
  location?: string
  seller?: string
  tags: string[]
  updatedAt?: string
}
