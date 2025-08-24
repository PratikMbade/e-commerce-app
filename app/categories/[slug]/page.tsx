"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockCategories, mockProducts } from "@/lib/mock-data"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  stock: number
  featured: boolean
  slug: string
  categoryId: string
}

interface Category {
  id: string
  name: string
  description: string
  slug: string
}

export default function CategoryPage() {
  const params = useParams()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState<string>("name")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.slug) {
      loadCategoryData(params.slug as string)
    }
  }, [params.slug])

  const loadCategoryData = async (slug: string) => {
    try {
      // Find category by slug
      const foundCategory = mockCategories.find((cat) => cat.slug === slug)
      if (!foundCategory) {
        setCategory(null)
        setProducts([])
        setLoading(false)
        return
      }

      setCategory(foundCategory)

      // Get products for this category
      const categoryProducts = mockProducts.filter((product) => product.categoryId === foundCategory.id)
      setProducts(categoryProducts)
    } catch (error) {
      console.error("Failed to load category:", error)
      setCategory(null)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "name":
      default:
        return a.name.localeCompare(b.name)
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
            <Button asChild>
              <a href="/categories">Browse Categories</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8 animate-in fade-in-0 duration-500">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-white">{category.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <p className="text-gray-600">{category.description}</p>
            </div>
          </div>
          <p className="text-gray-600">
            {products.length} product{products.length === 1 ? "" : "s"} available
          </p>
        </div>

        {/* Sort Controls */}
        {products.length > 0 && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-500 delay-200">
            <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
              <span className="font-medium">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-in fade-in-0 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-in fade-in-0 duration-500">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-gray-400">{category.name.charAt(0)}</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">No Products Available</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We don't have any products in this category yet. Check back soon for new arrivals!
            </p>
            <Button asChild>
              <a href="/products">Browse All Products</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
