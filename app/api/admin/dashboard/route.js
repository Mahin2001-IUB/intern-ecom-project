import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalProducts = await prisma.product.count();

    const totalOrders = await prisma.order.count();

    const totalStores = await prisma.store.count();

    const revenueData = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
    });

    const allOrders = await prisma.order.findMany({
      include: {
        user: true,
        store: true,
        address: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      dashboardData: {
        products: totalProducts,
        revenue: revenueData._sum.total || 0,
        orders: totalOrders,
        stores: totalStores,
        allOrders,
      },
    });
  } catch (error) {
    console.error("ADMIN_DASHBOARD_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch admin dashboard data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}