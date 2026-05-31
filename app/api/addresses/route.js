import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("GET_ADDRESSES_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch addresses",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const { name, email, street, city, state, zip, country, phone } = body;

    if (!name || !email || !street || !city || !state || !zip || !country || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "All address fields are required",
        },
        { status: 400 }
      );
    }

    const address = await prisma.address.create({
      data: {
        userId,
        name,
        email,
        street,
        city,
        state,
        zip: String(zip),
        country,
        phone,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.error("CREATE_ADDRESS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to add address",
        error: error.message,
      },
      { status: 500 }
    );
  }
}