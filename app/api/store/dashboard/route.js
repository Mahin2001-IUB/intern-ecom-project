import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const storeId = "store_1";

    const totalProducts = await prisma.product.count({
      where: { storeId },
    });

    const totalOrders = await prisma.order.count({
      where: { storeId },
    });

    const totalEarningsData = await prisma.order.aggregate({
      where: { storeId },
      _sum: {
        total: true,
      },
    });

    const ratings = await prisma.rating.findMany({
      where: {
        product: {
          storeId,
        },
      },
      include: {
        user: true,
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      dashboardData: {
        totalProducts,
        totalOrders,
        totalEarnings: totalEarningsData._sum.total || 0,
        ratings,
      },
    });
  } catch (error) {
    console.error("STORE_DASHBOARD_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}