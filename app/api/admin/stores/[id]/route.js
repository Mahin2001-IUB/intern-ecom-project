import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData = {};

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    if (body.status) {
      updateData.status = body.status;
    }

    const store = await prisma.store.update({
      where: {
        id,
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Store updated successfully",
      store,
    });
  } catch (error) {
    console.error("UPDATE_ADMIN_STORE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update store",
        error: error.message,
      },
      { status: 500 }
    );
  }
}