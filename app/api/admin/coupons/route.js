import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("GET_ADMIN_COUPONS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch coupons",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const code = body.code?.trim().toUpperCase();
    const description = body.description?.trim();
    const discount = Number(body.discount);
    const expiresAt = body.expiresAt;

    if (!code || !description || !discount || !expiresAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Code, description, discount and expiry date are required",
        },
        { status: 400 }
      );
    }

    if (discount < 1 || discount > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Discount must be between 1 and 100",
        },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        description,
        discount,
        forNewUser: Boolean(body.forNewUser),
        forMember: Boolean(body.forMember),
        isPublic: Boolean(body.isPublic),
        expiresAt: new Date(expiresAt),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Coupon added successfully",
      coupon,
    });
  } catch (error) {
    console.error("CREATE_ADMIN_COUPON_ERROR:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "Coupon code already exists",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add coupon",
        error: error.message,
      },
      { status: 500 }
    );
  }
}