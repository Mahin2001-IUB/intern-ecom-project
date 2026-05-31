import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found in Clerk",
        },
        { status: 404 }
      );
    }

    const email =
      clerkUser.emailAddresses?.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ||
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      "";

    const name =
      clerkUser.fullName ||
      `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
      "User";

    const image = clerkUser.imageUrl || "";

    const user = await prisma.user.upsert({
      where: {
        id: userId,
      },
      update: {
        name,
        email,
        image,
      },
      create: {
        id: userId,
        name,
        email,
        image,
        role: "CUSTOMER",
        cart: {},
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("SYNC_USER_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to sync user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}