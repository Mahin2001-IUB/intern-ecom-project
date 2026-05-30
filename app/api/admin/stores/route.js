import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const storesRaw = await prisma.store.findMany({
      include: {
        user: true,
        Product: true,
        Order: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const stores = storesRaw.map((store) => ({
      ...store,
      products: store.Product,
      orders: store.Order,
    }));

    return NextResponse.json({
      success: true,
      stores,
    });
  } catch (error) {
    console.error("GET_ADMIN_STORES_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch stores",
        error: error.message,
      },
      { status: 500 }
    );
  }
}