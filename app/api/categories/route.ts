import { NextResponse } from "next/server"
import { mockCategories } from "@/lib/mock-data"

export async function GET() {
  try {
    return NextResponse.json({
      categories: mockCategories,
      total: mockCategories.length,
    })
  } catch (error) {
    console.error("Categories API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
