import { AdminLayout } from "@/components/admin/admin-layout"
import { ProductsTable } from "@/components/admin/products-table"
import { getUserIdFromToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"


async function getProductsDB() {
  const cookieStore = cookies()
  const token = (await cookieStore).get("auth-token")?.value
  const userId = await (token ? getUserIdFromToken(token) : null)
  console.log('auth-token:', userId);

  if (!userId) {
    return { products: [], adminId: null };
  }

  const products = await prisma.product.findMany({
    where: {
      productSellerId: userId,
    },
    include:{
      category: true
    }
  })

  const adminId = userId

  return { products , adminId }
}


export default async function ProductsPage() {
  const { products, adminId } = await getProductsDB()
  console.log('Fetched products:', products);
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-2">Manage your product catalog</p>
          </div>
        </div>
        <ProductsTable productsDB={products} adminId={adminId!} />
      </div>
    </AdminLayout>
  )
}
