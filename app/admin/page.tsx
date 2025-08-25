import { AdminLayout } from "@/components/admin/admin-layout"
import { DashboardOverview } from "@/components/admin/dashboard-overview"
import { getUserIdFromToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { getAdminCategories, getAdminCurrentSales, getAdminMonthlyRevenue, getAdminProducts } from "../actions/admin"
import Link from "next/dist/client/link"
import { Button } from "@/components/ui/button"

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

export default async function AdminDashboard() {
  const { adminId } = await getProductsDB()

  if (!adminId) {
    return <div className="min-h-screen flex flex-col items-center justify-center">
      <p>Unauthorized</p>
      <Link href="/admin/login" className="text-blue-500">
      <Button>
        Login
      </Button>
      </Link>
    </div>
  }

  const adminProducts = await getAdminProducts(adminId)
  const adminSales = await getAdminCurrentSales(adminId)
  const adminCategoriesLength = await getAdminCategories();
  const adminMonthlyRevenue = await getAdminMonthlyRevenue(adminId);
  


  return (
    <AdminLayout>
      <DashboardOverview adminProducts={adminProducts.totalProducts} adminOutOfStock={adminProducts.outOfStock} adminSales={adminSales.totalSales} adminCategoriesLength={adminCategoriesLength.totalCategories} adminMonthlyRevenue={adminMonthlyRevenue.currentMonth} />
    </AdminLayout>
  )
}
