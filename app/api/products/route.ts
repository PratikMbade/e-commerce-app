import { type NextRequest, NextResponse } from "next/server"
import { mockProducts } from "@/lib/mock-data"
import { prisma } from "@/lib/db"
import { Prisma } from "@prisma/client"

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



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Allow client to send either categoryId OR categorySlug
    const {
      name,
      description,
      price,
      image,
      stock,
      featured = false,
      slug,
      categorySlug,
      productSellerId,
    } = body ?? {};

    console.log('Creating product:', { name, description, price, image, stock, featured, slug, categorySlug, productSellerId });


    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (price === undefined || isNaN(Number(price))) {
      return NextResponse.json({ error: "price is required (number)" }, { status: 400 });
    }
    if (stock === undefined || isNaN(Number(stock))) {
      return NextResponse.json({ error: "stock is required (number)" }, { status: 400 });
    }
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }
    if (!productSellerId) {
      return NextResponse.json({ error: "productSellerId is required" }, { status: 400 });
    }
    if (!categorySlug) {
      return NextResponse.json({ error: "Provide categoryId or categorySlug" }, { status: 400 });
    }
    let resolvedCategoryId: string | undefined;
    // Resolve categoryId if only slug was sent
    if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (!cat) {
        return NextResponse.json({ error: "Invalid categorySlug" }, { status: 400 });
      }
      resolvedCategoryId = cat.id;
    }

    // Create the product using relation connects
    const savedProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        image,
        stock: Number(stock),
        featured: Boolean(featured),
        slug,
        // Required relations provided via nested connect:
        category: { connect: { id: resolvedCategoryId! } },
        productSeller: { connect: { id: productSellerId } },
      },
      include: {
        category: true,
        productSeller: { select: { id: true, email: true } },
      },
    });

    return NextResponse.json(savedProduct, { status: 201 });
  } catch (err: unknown) {
    // Handle unique constraint on slug, etc.
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return NextResponse.json({ error: "Duplicate unique field (likely slug)" }, { status: 409 });
      }
    }
    console.error("Products API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request:NextRequest){
  try {

    const body = await request.json();

    const { id } = body;  

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Delete the product
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}