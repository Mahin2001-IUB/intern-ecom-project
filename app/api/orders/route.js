import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();

    const userId = "user_1";
    const storeId = "store_1";

    const { items, addressId, paymentMethod, coupon } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!addressId) {
      return NextResponse.json(
        { success: false, message: "Address is required" },
        { status: 400 }
      );
    }

    const productIds = items.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        inStock: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, message: "Some products are unavailable" },
        { status: 400 }
      );
    }

    let subtotal = 0;

    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);

      const quantity = Number(item.quantity);

      subtotal += product.price * quantity;

      return {
        productId: product.id,
        quantity,
        price: product.price,
      };
    });

    let finalTotal = subtotal;

    if (coupon && coupon.discount) {
      finalTotal = subtotal - (coupon.discount / 100) * subtotal;
    }

    const order = await prisma.order.create({
      data: {
        total: finalTotal,
        userId,
        storeId,
        addressId,
        isPaid: paymentMethod === "STRIPE" ? false : false,
        paymentMethod,
        isCouponUsed: Boolean(coupon && coupon.code),
        coupon: coupon || {},
        orderItems: {
          create: orderItems,
        },
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
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("PLACE_ORDER_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to place order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const userId = "user_1";

    const orders = await prisma.order.findMany({
      where: {
        userId,
      },
      include: {
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
    console.error("GET_USER_ORDERS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      },
      { status: 500 }
    );
  }
}