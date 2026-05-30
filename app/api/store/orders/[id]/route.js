import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const order = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status: body.status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("UPDATE_ORDER_STATUS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}