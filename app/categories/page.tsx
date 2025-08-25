import CategoriesSection from "@/components/products/category-section";
import { getAllProducts } from "../actions/product";




export default async function CategoriesPage() {

  const products = await getAllProducts();

  if(!products) {
    return (
      <div className="text-center">
        <h1>No products found</h1>
      </div>
    )
  }

  return (
    <>
    <CategoriesSection productsDB={products} />
    </>
  )

}
