// Mock data for development when no database is connected
export const mockCategories = [
  {
    id: "1",
    name: "Electronics",
    description: "Latest gadgets and electronic devices",
    slug: "electronics",
  },
  {
    id: "2",
    name: "Clothing",
    description: "Fashion and apparel for all occasions",
    slug: "clothing",
  },
  {
    id: "3",
    name: "Home & Garden",
    description: "Everything for your home and garden",
    slug: "home-garden",
  },
  {
    id: "4",
    name: "Sports",
    description: "Sports equipment and fitness gear",
    slug: "sports",
  },
]

export const mockProducts = [
  {
    id: "1",
    name: "Wireless Headphones",
    description: "Premium noise-cancelling wireless headphones with 30-hour battery life",
    price: 299.99,
    image: "/wireless-headphones.png",
    stock: 25,
    featured: true,
    slug: "wireless-headphones",
    categoryId: "1",
    category: mockCategories[0],
  },
  {
    id: "2",
    name: "Smart Watch",
    description: "Advanced fitness tracking smartwatch with heart rate monitor",
    price: 399.99,
    image: "/smartwatch-lifestyle.png",
    stock: 15,
    featured: true,
    slug: "smart-watch",
    categoryId: "1",
    category: mockCategories[0],
  },
  {
    id: "3",
    name: "Designer T-Shirt",
    description: "Premium cotton t-shirt with modern design",
    price: 49.99,
    image: "/designer-t-shirt.png",
    stock: 50,
    featured: false,
    slug: "designer-t-shirt",
    categoryId: "2",
    category: mockCategories[1],
  },
  {
    id: "4",
    name: "Running Shoes",
    description: "Lightweight running shoes with advanced cushioning",
    price: 129.99,
    image: "/running-shoes-on-track.png",
    stock: 30,
    featured: true,
    slug: "running-shoes",
    categoryId: "4",
    category: mockCategories[3],
  },
  {
    id: "5",
    name: "Coffee Maker",
    description: "Programmable coffee maker with thermal carafe",
    price: 89.99,
    image: "/modern-coffee-maker.png",
    stock: 20,
    featured: false,
    slug: "coffee-maker",
    categoryId: "3",
    category: mockCategories[2],
  },
  {
    id: "6",
    name: "Yoga Mat",
    description: "Non-slip yoga mat with carrying strap",
    price: 39.99,
    image: "/rolled-yoga-mat.png",
    stock: 40,
    featured: false,
    slug: "yoga-mat",
    categoryId: "4",
    category: mockCategories[3],
  },
]

export const mockUsers = [
  {
    id: "1",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    password: "hashedpassword123",
    role: "USER",
  },
  {
    id: "2",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    password: "hashedpassword123",
    role: "ADMIN",
  },
]

// Helper functions for mock data
export function getProductById(id: string) {
  return mockProducts.find((product) => product.id === id)
}

export function getProductsByCategory(categoryId: string) {
  return mockProducts.filter((product) => product.categoryId === categoryId)
}

export function getFeaturedProducts() {
  return mockProducts.filter((product) => product.featured)
}

export function searchProducts(query: string) {
  const lowercaseQuery = query.toLowerCase()
  return mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) || product.description.toLowerCase().includes(lowercaseQuery),
  )
}
