import { type NextRequest, NextResponse } from "next/server"
import { mockProducts } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")
    const search = searchParams.get("search")
    const limit = searchParams.get("limit")

    let filteredProducts = [...mockProducts]

    // Filter by category
    if (category) {
      filteredProducts = filteredProducts.filter((product) => product.categoryId === category)
    }

    // Filter by featured
    if (featured === "true") {
      filteredProducts = filteredProducts.filter((product) => product.featured)
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) || product.description.toLowerCase().includes(searchLower),
      )
    }

    // Limit results
    if (limit) {
      const limitNum = Number.parseInt(limit, 10)
      filteredProducts = filteredProducts.slice(0, limitNum)
    }

    return NextResponse.json({
      products: filteredProducts,
      total: filteredProducts.length,
    })
  } catch (error) {
    console.error("Products API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
