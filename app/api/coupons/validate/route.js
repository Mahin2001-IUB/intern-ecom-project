import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const code = body.code?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code is required",
        },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: {
        code,
      },
    });

    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coupon code",
        },
        { status: 404 }
      );
    }

    if (!coupon.isPublic) {
      return NextResponse.json(
        {
          success: false,
          message: "This coupon is not available",
        },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon has expired",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon applied successfully",
      coupon,
    });
  } catch (error) {
    console.error("VALIDATE_COUPON_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to validate coupon",
        error: error.message,
      },
      { status: 500 }
    );
  }
}