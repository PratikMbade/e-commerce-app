'use server';

import { prisma } from "@/lib/db";


export async function getFeaturedProducts() {
    try {

        const featuredProducts = await prisma.product.findMany({
            where: {
                featured: true,
                stock: {
                    gt: 0,
                },
            },
            include: {
                category: true,
            },
        })

        return featuredProducts
    } catch (error) {
        console.error("Error fetching featured products:", error)
        throw new Error("Failed to fetch featured products")
    }

}

export async function getAllProducts() {
    try {
        const allProducts = await prisma.product.findMany({
            include: {
                category: true,
            },
        })

        return allProducts
    } catch (error) {
        console.error("Error fetching all products:", error)
        throw new Error("Failed to fetch all products")
    }
}