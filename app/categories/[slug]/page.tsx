import { getAllProducts } from "@/app/actions/product"
import CategorySlugSection from "@/components/products/category-slug-section"


export default async function CategoriesSlugPage(){

  const products = await getAllProducts()

  if(!products || products.length === 0) {
    return (
      <div>
        <h1>No Products Found</h1>
      </div>
    )
  }

  return(
    <div>
      <CategorySlugSection productsDB={products} />
    </div>
  )
}