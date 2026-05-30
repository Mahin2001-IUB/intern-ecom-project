import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const userId = "user_1";

    const store = await prisma.store.findFirst({
      where: {
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      store,
      alreadySubmitted: Boolean(store),
      status: store?.status || "",
      message: store
        ? store.status === "approved"
          ? "Your store has been approved."
          : store.status === "rejected"
          ? "Your store application was rejected."
          : "Your store application is under review."
        : "",
    });
  } catch (error) {
    console.error("GET_STORE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch store status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const userId = "user_1";
    const formData = await req.formData();

    const username = formData.get("username");
    const name = formData.get("name");
    const description = formData.get("description");
    const email = formData.get("email");
    const contact = formData.get("contact");
    const address = formData.get("address");
    const image = formData.get("image");

    if (!username || !name || !description || !email || !contact || !address) {
      return NextResponse.json(
        {
          success: false,
          message: "All store fields are required",
        },
        { status: 400 }
      );
    }

    let logo = "/happy_store.webp";

    if (image && image.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "stores");
      await fs.mkdir(uploadDir, { recursive: true });

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const safeFileName = image.name.replaceAll(" ", "-");
      const fileName = `${Date.now()}-${safeFileName}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.writeFile(filePath, buffer);

      logo = `/uploads/stores/${fileName}`;
    }

    const existingStore = await prisma.store.findFirst({
      where: {
        userId,
      },
    });

    const store = existingStore
      ? await prisma.store.update({
          where: {
            id: existingStore.id,
          },
          data: {
            username,
            name,
            description,
            email,
            contact,
            address,
            logo,
            status: "pending",
            isActive: false,
          },
        })
      : await prisma.store.create({
          data: {
            userId,
            username,
            name,
            description,
            email,
            contact,
            address,
            logo,
            status: "pending",
            isActive: false,
          },
        });

    return NextResponse.json({
      success: true,
      message: "Store submitted successfully",
      store,
    });
  } catch (error) {
    console.error("CREATE_STORE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit store",
        error: error.message,
      },
      { status: 500 }
    );
  }
}