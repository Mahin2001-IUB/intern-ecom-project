const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const userId = "user_1";
  const storeId = "store_1";
  const addressId = "addr_1";

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      name: "Demo User",
      email: "demo@example.com",
      image: "/gs_logo.jpg",
      cart: {},
    },
  });

  await prisma.store.upsert({
    where: { id: storeId },
    update: {},
    create: {
      id: storeId,
      userId,
      name: "Happy Shop",
      username: "happyshop",
      email: "happyshop@example.com",
      contact: "+880123456789",
      logo: "/happy_store.webp",
      description: "A demo store for testing the GoCart application.",
      address: "Dhaka, Bangladesh",
      status: "approved",
      isActive: true,
    },
  });

  await prisma.address.upsert({
    where: { id: addressId },
    update: {},
    create: {
      id: addressId,
      userId,
      name: "Demo User",
      email: "demo@example.com",
      street: "123 Main Street",
      city: "Dhaka",
      state: "Dhaka",
      zip: "1200",
      country: "Bangladesh",
      phone: "+880123456789",
    },
  });

  const products = [
    ["prod_1", "Modern table lamp", "Decoration", 40, 29],
    ["prod_2", "Smart speaker gray", "Speakers", 50, 29],
    ["prod_3", "Smart watch white", "Watch", 60, 29],
    ["prod_4", "Wireless headphones", "Headphones", 70, 29],
    ["prod_5", "Smart watch black", "Watch", 49, 29],
    ["prod_6", "Security Camera", "Camera", 59, 29],
    ["prod_7", "Smart Pen for iPad", "Pen", 89, 29],
    ["prod_8", "Home Theater", "Theater", 99, 29],
    ["prod_9", "Apple Wireless Earbuds", "Earbuds", 89, 29],
    ["prod_10", "Apple Smart Watch", "Watch", 179, 29],
    ["prod_11", "RGB Gaming Mouse", "Mouse", 39, 29],
    ["prod_12", "Smart Home Cleaner", "Cleaner", 199, 29],
  ];

  for (let i = 0; i < products.length; i++) {
    const [id, name, category, mrp, price] = products[i];

    await prisma.product.upsert({
      where: { id },
      update: {},
      create: {
        id,
        name,
        category,
        mrp,
        price,
        description: `${name} with a sleek design. Perfect for testing the e-commerce application.`,
        images: [`/products/product_img${i + 1}.png`],
        storeId,
        inStock: true,
      },
    });

    await prisma.rating.upsert({
      where: {
        userId_productId_orderId: {
          userId,
          productId: id,
          orderId: `seed_order_${id}`,
        },
      },
      update: {},
      create: {
        rating: 5,
        review: "Excellent demo product.",
        userId,
        productId: id,
        orderId: `seed_order_${id}`,
      },
    });
  }

  await prisma.coupon.upsert({
    where: { code: "NEW10" },
    update: {},
    create: {
      code: "NEW10",
      description: "10% Off for New Users",
      discount: 10,
      forNewUser: true,
      forMember: false,
      isPublic: true,
      expiresAt: new Date("2027-12-31"),
    },
  });

  await prisma.order.upsert({
    where: { id: "order_1" },
    update: {},
    create: {
      id: "order_1",
      total: 58,
      userId,
      storeId,
      addressId,
      isPaid: false,
      paymentMethod: "COD",
      isCouponUsed: false,
      coupon: {},
      orderItems: {
        create: [
          {
            productId: "prod_1",
            quantity: 1,
            price: 29,
          },
          {
            productId: "prod_2",
            quantity: 1,
            price: 29,
          },
        ],
      },
    },
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });