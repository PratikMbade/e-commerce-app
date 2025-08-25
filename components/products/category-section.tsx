"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockCategories, mockProducts } from "@/lib/mock-data"
import { ProductWithCategory } from "../admin/products-table"

interface Category {
  id: string
  name: string
  description: string
  slug: string
}

type Props = {
  productsDB: ProductWithCategory[]
}
export default function CategoriesSection({ productsDB }: Props) {
  const [categories] = useState<Category[]>(mockCategories)

  const getProductCount = async(categorySlug: string) => {
    return productsDB .filter((product) => product.category.slug === categorySlug).length
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Shop by Category</h1>
          <p className="text-gray-600">Explore our organized product categories to find exactly what you need</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="animate-in fade-in-0 duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Link href={`/categories/${category.slug}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl font-bold text-white">{category.name.charAt(0)}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{category.description}</p>
                    <Badge variant="secondary" className="group-hover:bg-blue-100 transition-colors">
                      {getProductCount(category.slug)} products
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
