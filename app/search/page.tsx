"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

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

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")

  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setSearchQuery(query)
      searchProducts(query)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const searchProducts = async (query: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`)
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("Search failed:", error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      searchProducts(searchQuery.trim())
      // Update URL without navigation
      window.history.pushState({}, "", `/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Products</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-12 text-lg"
              />
              <Button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                Search
              </Button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {searchQuery && (
              <div className="mb-6">
                <p className="text-gray-600">
                  {products.length > 0
                    ? `Found ${products.length} result${products.length === 1 ? "" : "s"} for "${searchQuery}"`
                    : `No results found for "${searchQuery}"`}
                </p>
              </div>
            )}

            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="animate-in fade-in-0 duration-300">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-16">
                <Search className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-4">No products found</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Try adjusting your search terms or browse our categories to find what you're looking for.
                </p>
                <Button asChild>
                  <a href="/products">Browse All Products</a>
                </Button>
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-4">Start Your Search</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Enter a search term above to find products in our catalog.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
