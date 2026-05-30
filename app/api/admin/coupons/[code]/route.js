import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, { params }) {
  try {
    const { code } = await params;
    const couponCode = decodeURIComponent(code).toUpperCase();

    await prisma.coupon.delete({
      where: {
        code: couponCode,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("DELETE_ADMIN_COUPON_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete coupon",
        error: error.message,
      },
      { status: 500 }
    );
  }
}