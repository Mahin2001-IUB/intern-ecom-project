import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData = {};

    if (typeof body.inStock === "boolean") {
      updateData.inStock = body.inStock;
    }

    if (body.name !== undefined) {
      updateData.name = body.name;
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.category !== undefined) {
      updateData.category = body.category;
    }

    if (body.mrp !== undefined) {
      updateData.mrp = Number(body.mrp);
    }

    if (body.price !== undefined) {
      updateData.price = Number(body.price);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("UPDATE_PRODUCT_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    await prisma.rating.deleteMany({
      where: { productId: id },
    });

    await prisma.orderItem.deleteMany({
      where: { productId: id },
    });

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE_PRODUCT_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product",
      },
      { status: 500 }
    );
  }
}