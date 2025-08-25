export interface Category {
  id: string
  name: string
  description: string
  slug: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  stock: number
  featured: boolean
  slug: string
  categoryId: string
  category?: Category
}
