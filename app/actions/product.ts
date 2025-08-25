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