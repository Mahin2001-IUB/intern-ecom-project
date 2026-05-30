import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const storeId = "store_1";

    const orders = await prisma.order.findMany({
      where: {
        storeId,
      },
      include: {
        user: true,
        address: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("STORE_ORDERS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch store orders",
        error: error.message,
      },
      { status: 500 }
    );
  }
}